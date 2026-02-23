# Fixing Mixed Content Error - HTTPS Setup Guide

## 🚨 The Problem

Your portfolio at `https://pantal.dev` cannot fetch from `http://167.99.139.139` because:

**Browsers block HTTP requests from HTTPS pages** (Mixed Content Policy)

**Current Status:**
- ❌ API calls blocked by browser security
- ✅ Fallback to static JSON works
- ❌ Real-time updates **NOT working**

---

## ✅ Solution: Add HTTPS to Your API Server

You need to install an SSL certificate on your DigitalOcean server.

### Quick Overview
1. Get a domain name for your API (e.g., `api.pantal.dev`)
2. Point DNS to `167.99.139.139`
3. Install SSL certificate (free with Let's Encrypt)
4. Update nginx to serve HTTPS
5. Update portfolio to use `https://api.pantal.dev`

---

## 📋 Step-by-Step Guide

### Step 1: Set Up Domain for API

**Option A: Subdomain of pantal.dev** (Recommended)
1. Log into your domain registrar (where you bought pantal.dev)
2. Add DNS A record:
   - **Name:** `api` (or `projects-api`)
   - **Type:** A
   - **Value:** `167.99.139.139`
   - **TTL:** 3600

**Option B: Use IP with different port** (NOT recommended - still needs cert)

**Result:** `api.pantal.dev` → `167.99.139.139`

---

### Step 2: Install Certbot (Let's Encrypt)

SSH into your DigitalOcean server:

```bash
ssh root@167.99.139.139
```

Install Certbot:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# OR if you have Python installed differently
sudo snap install --classic certbot
```

---

### Step 3: Get SSL Certificate

```bash
# Replace api.pantal.dev with your actual domain
sudo certbot --nginx -d api.pantal.dev
```

**Follow prompts:**
- Enter email address
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (select "2" for Yes)

**Certbot will:**
- Generate SSL certificate
- Update nginx configuration automatically
- Set up auto-renewal

---

### Step 4: Update Nginx Configuration

Verify nginx config was updated:

```bash
sudo nano /etc/nginx/sites-available/default
# OR
sudo nano /etc/nginx/sites-available/your-config-name
```

Should now have redirect from HTTP to HTTPS:

```nginx
# HTTP server - redirects to HTTPS
server {
    listen 80;
    server_name api.pantal.dev;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name api.pantal.dev;

    ssl_certificate /etc/letsencrypt/live/api.pantal.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.pantal.dev/privkey.pem;

    # Your existing API configuration
    location /public/projects {
        # ... your proxy/app config
    }

    # CORS headers (very important!)
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept" always;
}
```

Test and reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 5: Test HTTPS Endpoint

```bash
curl https://api.pantal.dev/public/projects
```

Should return your projects JSON.

Also test from browser:
```
https://api.pantal.dev/public/projects
```

---

### Step 6: Update Portfolio Environment Variable

Update `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.pantal.dev
```

---

### Step 7: Rebuild and Deploy

```bash
npm run build
git add .
git commit -m "Update API URL to HTTPS"
git push
```

Wait for GitHub Actions to deploy.

---

### Step 8: Verify It's Working

1. Visit `https://pantal.dev/projects`
2. Open DevTools (F12) → Console
3. Should see:
   - ✅ No "Mixed Content" errors
   - ✅ Successful fetch from `https://api.pantal.dev`
   - ✅ Projects loaded from live API

4. Test real-time updates:
   - Change a project in Project Manager
   - Refresh `pantal.dev/projects`
   - Changes appear immediately! 🎉

---

## 🔄 Alternative: Revert to Build-Time Fetching

If you don't want to set up HTTPS right now, you can revert to **Option 1** (build-time fetching):

### Why This Works
- GitHub Actions build server can make HTTP requests (no browser restriction)
- API is fetched during build
- Static HTML deployed with data baked in

### Trade-offs
- ✅ Works without HTTPS
- ✅ Super fast (static pages)
- ❌ Updates require rebuild (~2 min)
- ❌ Not real-time

### How to Revert

I can help you revert the client-side changes if you prefer this approach. Just let me know!

---

## 🎯 Recommended Path

### For Production Use:
**Set up HTTPS** - It's the modern standard and required for:
- Client-side API calls from HTTPS sites
- Security best practices
- Future API features
- Professional appearance

### Time Required:
- **DNS propagation:** 5-60 minutes
- **SSL setup:** 10 minutes
- **Total:** ~1 hour max

### Cost:
- **SSL Certificate:** FREE (Let's Encrypt)
- **Domain:** You already have pantal.dev
- **Subdomain:** FREE

---

## 📞 Quick Commands Summary

```bash
# 1. SSH to server
ssh root@167.99.139.139

# 2. Install Certbot
sudo apt update && sudo apt install certbot python3-certbot-nginx

# 3. Get certificate (after DNS is set up)
sudo certbot --nginx -d api.pantal.dev

# 4. Test nginx
sudo nginx -t
sudo systemctl reload nginx

# 5. Test HTTPS
curl https://api.pantal.dev/public/projects
```

Then update `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.pantal.dev
```

---

## ❓ FAQ

**Q: Can I use the IP address with HTTPS?**
A: No, SSL certificates require a domain name.

**Q: Will the certificate expire?**
A: Certbot sets up auto-renewal. It renews every 90 days automatically.

**Q: What if I don't have a domain?**
A: You need one for HTTPS. Either:
1. Use a subdomain of pantal.dev (recommended)
2. Buy a cheap domain ($1-10/year)
3. Use a free DNS service like FreeDNS

**Q: Can I skip HTTPS?**
A: Not for client-side fetching from HTTPS sites. Options:
1. Set up HTTPS (recommended)
2. Revert to build-time fetching (Option 1)

---

## 🆘 Troubleshooting

### DNS not propagating
```bash
# Check DNS status
nslookup api.pantal.dev

# Wait 5-60 minutes for propagation
```

### Certbot fails
- Ensure DNS is pointing to your server
- Check port 80 is open: `sudo ufw allow 80`
- Check port 443 is open: `sudo ufw allow 443`

### CORS errors after HTTPS
Make sure `add_header Access-Control-Allow-Origin "*"` is in your HTTPS server block.

### Certificate renewal fails
```bash
# Test renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

---

**Ready to set up HTTPS? Let me know if you need help with any step!**

**Or would you prefer to revert to Option 1 (build-time fetching)?**
