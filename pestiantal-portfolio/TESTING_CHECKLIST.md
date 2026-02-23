# Portfolio API Integration - Testing Checklist

This document provides a comprehensive testing checklist for the GitHub Pages portfolio with live API integration.

## Pre-Deployment Testing

### 1. API Connectivity ✅
- [x] API responds to GET requests
- [x] CORS headers are properly configured
- [x] API returns valid JSON array
- [x] Data structure matches TypeScript interfaces

**Test Command:**
```bash
curl http://167.99.139.139/public/projects
```

**Expected Headers:**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`

---

### 2. Build Process ✅
- [x] Project builds successfully with `npm run build`
- [x] No TypeScript errors
- [x] No ESLint warnings
- [x] Static pages generated for all projects
- [x] Environment variables loaded correctly

**Test Command:**
```bash
npm run build
```

**Expected Output:**
- ✓ Compiled successfully
- ✓ Linting and checking validity of types
- ✓ Generating static pages
- ✓ Exporting

---

### 3. Local Development Testing

#### Test API Fetching
1. Start dev server: `npm run dev`
2. Open browser console
3. Navigate to `/projects`
4. Check console for "Using cached data" or API success

#### Test Cache Behavior
1. Load projects page (should fetch from API)
2. Refresh page within 1 hour (should use cache)
3. Check console: `"Using cached data from [timestamp]"`
4. Clear localStorage: `localStorage.clear()`
5. Refresh (should fetch from API again)

#### Test Fallback Strategy

**Scenario 1: API Down**
1. Stop your API server or block network to `167.99.139.139`
2. Clear browser cache: `localStorage.clear()`
3. Refresh page
4. Should see: `"Using fallback static data"` in console
5. Projects should still display from `projects.fallback.json`

**Scenario 2: Network Issues**
1. Disconnect from internet
2. Clear localStorage
3. Refresh page
4. Should load from static fallback

---

### 4. Data Validation

#### Verify Project Data
- [ ] All projects display correctly
- [ ] Images load properly
- [ ] Project metadata (name, version, description) is accurate
- [ ] Links (GitHub, Live URL) work correctly
- [ ] Tech stack icons display

#### Compare API vs Fallback
1. Fetch from API: `curl http://167.99.139.139/public/projects > api-data.json`
2. Compare with `src/data/projects.fallback.json`
3. Ensure no critical data loss

---

### 5. TypeScript Type Safety
- [x] `RawProject` interface matches API response
- [x] `Project` interface has Date objects for dates
- [x] Type transformations work correctly
- [x] No `any` types used

---

### 6. Caching Logic Tests

#### Test Cache Expiration
1. Load projects (fresh API call)
2. Wait 1 hour (or change `NEXT_PUBLIC_CACHE_TTL` to 5000 for testing)
3. Refresh page
4. Should make new API call (check Network tab)

#### Test Manual Refresh
If you implement a refresh button later:
```javascript
import { refreshProjects } from '@/lib/projects';

// Force refresh
const projects = await refreshProjects();
```

---

### 7. Performance Testing

#### Initial Load Time
- [ ] API responds within 5 seconds (current timeout)
- [ ] Page loads quickly even with API call
- [ ] No significant delay compared to static JSON

#### Static Build Performance
- [ ] Build time is reasonable (< 30 seconds)
- [ ] All static pages generated successfully
- [ ] Output size is acceptable

---

## Deployment Testing

### 8. GitHub Pages Deployment

#### Before Deployment
1. Ensure `.env.local` is in `.gitignore` ✅
2. Environment variables are set in build environment
3. Static export configured in `next.config.ts` ✅

#### After Deployment
- [ ] Visit deployed site
- [ ] Check browser console for errors
- [ ] Verify projects load correctly
- [ ] Test navigation between projects
- [ ] Check images load (verify paths are correct)

#### CORS Verification on Production
Open browser console on deployed site:
```javascript
fetch('http://167.99.139.139/public/projects')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```
Should succeed without CORS errors.

---

### 9. Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

### 10. Error Handling

#### Console Messages
Check for appropriate console warnings:
- API failure: `"Failed to fetch from API: [error]"`
- Using cache: `"Using cached data from [date]"`
- Using fallback: `"Using fallback static data"`

#### Graceful Degradation
- [ ] Site never shows blank page
- [ ] Always displays projects (even if stale)
- [ ] No JavaScript errors break the UI

---

## Maintenance Testing

### 11. Update Workflow

#### Updating Projects via API
1. Make changes in Project Tracker UI
2. Wait for cache to expire (1 hour) OR
3. Clear browser cache: `localStorage.clear()`
4. Refresh portfolio site
5. Changes should appear

#### Rebuild Detection
When you rebuild the site:
1. Run `npm run build`
2. API is fetched fresh during build
3. New static pages generated with latest data

---

### 12. Monitoring & Logging

#### What to Monitor
- API uptime and response time
- Build success/failure rate
- Console errors in browser

#### Debug Information
Check browser localStorage:
```javascript
// View cached data
JSON.parse(localStorage.getItem('portfolio_projects_cache'))

// View cache timestamp
new Date(parseInt(localStorage.getItem('portfolio_projects_cache_timestamp')))

// Clear cache
localStorage.removeItem('portfolio_projects_cache')
localStorage.removeItem('portfolio_projects_cache_timestamp')
```

---

## Quick Test Script

Run this in your browser console to test the full flow:

```javascript
// Test 1: Fetch from API
fetch('http://167.99.139.139/public/projects')
  .then(r => r.json())
  .then(data => {
    console.log('✅ API Working:', data.length, 'projects');
    localStorage.setItem('portfolio_projects_cache', JSON.stringify(data));
    localStorage.setItem('portfolio_projects_cache_timestamp', Date.now());
  })
  .catch(e => console.error('❌ API Failed:', e));

// Test 2: Check cache
setTimeout(() => {
  const cached = localStorage.getItem('portfolio_projects_cache');
  const timestamp = localStorage.getItem('portfolio_projects_cache_timestamp');
  if (cached && timestamp) {
    console.log('✅ Cache Working:', new Date(parseInt(timestamp)));
  } else {
    console.log('❌ Cache Empty');
  }
}, 1000);

// Test 3: Clear cache (test fallback)
setTimeout(() => {
  localStorage.clear();
  console.log('✅ Cache Cleared - Reload to test fallback');
}, 2000);
```

---

## Common Issues & Solutions

### Issue: Projects not updating
**Solution:** Clear localStorage or wait for cache TTL

### Issue: API timeout
**Solution:** Increase timeout in `fetchProjectsFromAPI()` (currently 5s)

### Issue: CORS errors
**Solution:** Verify nginx config has proper headers

### Issue: Build fails to fetch API
**Solution:** Ensure API is accessible from build environment

---

## Success Criteria

- ✅ Build completes without errors
- ✅ All projects display correctly
- ✅ API fetches successfully during build
- ✅ Fallback works when API is down
- ✅ Cache reduces unnecessary API calls
- ✅ Type safety maintained throughout
- ✅ No console errors on live site

---

## Next Steps

After successful testing:
1. Deploy to GitHub Pages
2. Monitor for any issues
3. Update `projects.fallback.json` monthly
4. Consider adding:
   - Loading indicators
   - Manual refresh button
   - Cache status display
   - Error boundary components
