---
title: "The Cloudflare Outage: A Deep Dive into Rust's unwrap() Incident"
---

# The Cloudflare Outage

## TL;DR

<div class="flex justify-center my-6">
  <img src="/images/blog/cloudflare-rust-unwrap/funny.gif" alt="gif" class="rounded-lg max-w-md w-full" />
</div>

So Cloudflare did an oopsie on November 18, 2025, making half of the internet users worried about their ISP. X, Discord and many other sites were affected.
The culprit? A single `.unwrap()` call in Rust that panicked when the bot management service reveived 200+ feature flags instead of the expected 60.
Many blamed Rust, while the reality is more neuanced, this failuer was triggered by a constraint violation in a high-performance system.  

## What happened?
To understand the issue, we should look at what Cloudflare basicly is. You can think of it as a middle man, between you and your service.
When you visit a site, it doesn't go directly to their servers, instead, it flows through Cloudflare first. 

There it acts as a [Reverse Proxy](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/) as it's making some critical checks like:
- Are you a bot?
- An LMM scraper?
- Do we block you based on that?
- Do you pass configured security rules?
- Is your request on an approved port?

If you are eligable to enter, Cloudflare serves you from cache (fast) or fetches the page from the server and sends it back to you.
This is why when Cloudflare "went down", X went down, Down Detector went down, etc. Just like we pulled the balluster under the internet.

<div class="flex justify-center my-6">
  <img src="/images/blog/cloudflare-rust-unwrap/funny_internet.jpeg" alt="jpeg" class="rounded-lg max-w-md w-full" />
</div>

One of Cloudflare's key services is **bot management**. It analyzes approximately 60 different features to build a statistical model determining wheter you're a bot or a legititame user.
Are you high-risk or low-risk? Blocked or not?

But wait, these features can't be static. Cloudflare can't wait for engineers to deploy a new code every time a new bot attack vector shows up. Instead, feature flags are refreshed around **every five minutes**, allowing the system to adapt to new threats in near real-time.

Changes were made in their data storage service that slightly altered how data was retrived. When the next feature flag update came through, instead of receiving the expect 60 features, the bot management system suddenly received **over 200 feature flags**.

"That doesn't seems that bad right? Whats 140 extra features?"

Wrong, very wrong.


## Previously, on internet outages

Don't forget the accident that happened back in september, about those excessive `useEffect` ([blog link](https://blog.cloudflare.com/deep-dive-into-cloudflares-sept-12-dashboard-and-api-outage)). 

The internet has a long history of small code decisions causing massive impact.

The lesson? At scale, everything matters. Every. Single. Line.


## Why would Cloudflare use rust?

Many people gone to X to take shots at Rust. "Another Rust failure!" they cried. But let's think about this rationally.
Cloudflare operates at a scale where **every microsecond counts**. They handle millions of requests per second across their global network.
Operating at this level of scale, you need:

1. **VERY fast performance**: Comparable to C/C++
2. **Memory safety**: No buffer overflows or use-after-free bugs
3. **Thread safety**: Guaranteed at compile time
4. **A strong type system**: Catches errors before production

For this with well-known inputs, well-known outputs, consistent behavior requirements, top-tier performance, you're essentially choosing between C and Rust.

Cloudflare chose Rust because of its excellent type system combined with C-level performance. And honestly? That's a pretty reasonable choice. The type system that "caused" this outage would likely have resulted in a similar crash in C (just with a different mechanism).


## .unwrap()

<div class="flex justify-center my-6">
  <img src="/images/blog/cloudflare-rust-unwrap/source_code.jpg" alt="Funny GIF" class="rounded-lg max-w-md w-full" />
</div>

Let's talk about what `.unwrap()` actually does in Rust.

In Rust, there's no `try-catch` like in JavaScript or Python. Instead, operations that might fail return a `Result` type:

```rust
// A Result is either Ok (value) or Err (error)
let result: Result<File, Error> = File::open("config.txt");
```

You're supposed to handle both cases explicitly:

```rust
match File::open("config.txt") {
    Ok(file) => {
        // Use the file
    },
    Err(error) => {
        // Handle the error gracefully
        log_error(error);
        return default_value;
    }
}
```

But sometimes, developers *know* something should never fail. Like when using a mutex - unless the lock is poisoned, it should always succeed.
In these cases, they use `.expect()` or `.unwrap()`:

```rust
// .expect() provides a custom panic message
let value = some_operation().expect("This should never fail!");

// .unwrap() provides a generic panic message
let value = some_operation().unwrap();
```

The critical thing to understand: **both `.expect()` and `.unwrap()` are essentially assertions**. If the operation fails, the program panics - it crashes.

This brings us to [NASA's Power of 10 Rules](https://www.cs.otago.ac.nz/cosc345/resources/nasa-10-rules.htm) for safety-critical software, particularly Rule #5: "Use a minimum of two runtime assertions per function." These assertions help catch bugs early and ensure the system is operating within expected parameters.

For many applications, this is great advice. For servers handling millions of requests? Not so.


## Technical Deep Dive

Here's where everything came together in a perfect storm of cascading failures.
Cloudflare uses **pre-allocation** for performance. When their bot management service starts, it determines exactly how much memory it needs and allocates it upfront. This ensures consistent, predictable performance, no garbage collection pauses, no allocation overhead during request processing.

This follows NASA's principles: the world doesn't change underneath you. Hardware is fixed. Allocations are fixed. Performance is steady. Cloudflare had a safety check: "If we receive more than 200 feature flags, something is very wrong. Panic and fail fast rather than operate in an unknown state." When the data storage service changes caused 200+ features to be sent, this assertion fired. The service panicked. The thread crashed. Requests started failing.

```Rust

/// Fetch edge features based on 'input' struct into ['Features' buffer],
    pub fn fetch_features(
        &mut self,
        input: &dyn BotsInput,
        features: &mut Features,
    ) -> Result<(), (ErrorFlags, i32)> {
        // update features checksum (lower 32 bits) and copy edge feature names
        features.checksum &= 0xFFFF_FFFF_0000_0000;
        features.checksum |= u64::from(self.config.checksum);
        let (feature_values, _) = features
            .append_with_names(&self.config.feature_names)
            .unwrap();
    }

```
Look at that innocent `.unwrap()` on the last line. The `append_with_names()` function was designed to append feature names to a pre-allocated buffer. It returns a `Result` because appending could fail, specifically, if you try to append more items than the buffer has space for.

Under normal circumstances (60 features), this never fails. The buffer was sized appropriately. But when 200+ features arrived? The buffer overflowed. The `Result` became an `Err`. And that `.unwrap()` panicked.

**But it gets worse.** This wasn't happening on just one server, it was happening across Cloudflare's entire global network simultaneously. Remember, feature flags refresh every five minutes across *all* edge servers. So every five minutes, wave after wave of servers would receive the bloated feature set, panic, and crash.

**The cascade in detail:**

1. **Root cause**: Data storage service change causes over-delivery of feature flags (60 → 200+)
2. **First wave**: Edge servers receive new feature set during regular 5-minute refresh
3. **Buffer overflow**: `append_with_names()` tries to fit 200+ features into a 60-feature buffer
4. **Panic**: The `.unwrap()` encounters an `Err` and panics the thread
5. **Thread crash**: Worker thread handling bot management dies
6. **Request failures**: Incoming requests that need bot management start timing out
7. **Global propagation**: Pattern repeats across Cloudflare's entire edge network
8. **Cascading outage**: X, Discord, and thousands of other sites become unreachable
9. **Duration**: Multiple hours to identify, fix, and redeploy

The beautiful irony? This safety check was designed to prevent the system from operating in an unknown, potentially dangerous state. "Better to fail fast than to corrupt data or make wrong security decisions," the thinking goes. And that's usually correct! But at Cloudflare's scale, with this particular failure mode, "fail fast" meant "fail everywhere, all at once." The safety mechanism became the catastrophe.

What should have happened instead? Something like this:

```rust
pub fn fetch_features(
    &mut self,
    input: &dyn BotsInput,
    features: &mut Features,
) -> Result<(), (ErrorFlags, i32)> {
    features.checksum &= 0xFFFF_FFFF_0000_0000;
    features.checksum |= u64::from(self.config.checksum);
    
    // Handle the error gracefully instead of panicking
    let (feature_values, _) = match features.append_with_names(&self.config.feature_names) {
        Ok(values) => values,
        Err(e) => {
            // Log the error for investigation
            log::error!("Feature buffer overflow: {} features received", 
                       self.config.feature_names.len());
            
            // Return cached features or use safe defaults
            // This way the service degrades gracefully instead of crashing
            return Err((ErrorFlags::FEATURE_OVERFLOW, -1));
        }
    };
}
```

This version would have logged the anomaly, alerted engineers, and continued serving traffic with cached feature sets. The internet would have kept running while Cloudflare investigated. Instead, that single `.unwrap()` brought everything down.


## Lessons learned.

**Small decisions have massive consequences at scale.** That `.unwrap()` probably seemed totally reasonable when it was written. "We'll never get more than 200 features!" Famous last words.

**Test your failure modes.** Everyone tests the happy path. How many test what happens when you get 3x the expected input?

**Fail gracefully when possible.** Sometimes crashing is the right answer (corrupted data, security breach). Sometimes serving cached data with degraded functionality is better than serving nothing at all.

Look, Cloudflare is filled with some of the best engineers in the industry. They just got done being taken out by React `useEffect` hooks and now they're being owned by a Rust `.unwrap()`. The internet had a field day with this. These are the challenges of operating at extreme scale with extreme performance requirements. Every microsecond matters. Every allocation matters. Every line of code matters.

The lesson isn't "don't use Rust" or "unwrap is bad." The lesson is: **understand your constraints, test your failure modes, and fail gracefully when possible.** And hey, at least it wasn't `useEffect` this time.

<!-- Medium screenshot -->
<div class="flex justify-center my-6">
  <img src="/images/blog/cloudflare-rust-unwrap/funny_status.jpg" alt="Internet meme" class="rounded-lg max-w-xl w-full" />
</div>

## Sources

[Another Internet outage??? - ThePrimagen](https://www.youtube.com/watch?v=sJBaMJfxzYk)

[Cloudflare outage due to excessive useEffect API calls - Reddit](https://www.reddit.com/r/reactjs/comments/1nfr6pp/cloudflare_outage_due_to_excessive_useeffect_api/)


[Cloudflare outage on November 18, 2025 - The Cloudflare Blog](https://blog.cloudflare.com/18-november-2025-outage/)
