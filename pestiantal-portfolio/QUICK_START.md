# Quick Start Guide - Portfolio API Integration

## 🚀 Your Portfolio is Ready!

The migration from static JSON to API-based project fetching is complete. Here's what you need to know to get started.

---

## ⚡ Quick Commands

```bash
# Install dependencies (if needed)
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npx serve out
```

---

## 🎯 What Changed?

### Before
```
Static projects.json → Display
```

### After
```
API (live data) → Cache → Fallback → Display
```

---

## 🔧 Configuration

Your API is configured in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://167.99.139.139
NEXT_PUBLIC_API_ENDPOINT=/public/projects
NEXT_PUBLIC_CACHE_TTL=3600000  # 1 hour
```

**Want to change the API endpoint?** Edit `.env.local` and rebuild.

---

## 📝 How to Update Projects

### Option 1: Via Project Tracker UI (Recommended)
1. Use your Project Tracker application
2. Add/edit projects
3. Wait 1 hour for cache to expire **OR**
4. Rebuild your portfolio: `npm run build`

### Option 2: Emergency Fallback Update
1. Edit `src/data/projects.fallback.json`
2. Run `npm run build`
3. Deploy

---

## 🧪 Testing It Works

### Test 1: Verify API Connection
```bash
curl http://167.99.139.139/public/projects
```
Should return JSON array of projects.

### Test 2: Build Locally
```bash
npm run build
```
Should show: "✓ Generating static pages (13/13)"

### Test 3: Check in Browser
```bash
npm run dev
```
Open http://localhost:3000/projects
- Check browser console for "Using cached data..." messages

### Test 4: Test Fallback
1. Disconnect internet
2. Clear browser cache: `localStorage.clear()` in console
3. Refresh page
4. Should show projects from fallback file

---

## 📦 Deployment Checklist

- [ ] Commit all changes: `git add . && git commit -m "API integration complete"`
- [ ] Build succeeds locally: `npm run build`
- [ ] Projects display correctly at `/projects`
- [ ] Individual project pages work: `/projects/[id]`
- [ ] Push to GitHub: `git push`
- [ ] Deploy to GitHub Pages
- [ ] Verify on live site

---

## 🔍 Files You Need to Know

| File | Purpose |
|------|---------|
| `src/lib/projects.ts` | API fetching logic, caching, fallback |
| `src/data/projects.fallback.json` | Emergency backup data |
| `.env.local` | API configuration (not committed) |
| `TESTING_CHECKLIST.md` | Comprehensive testing guide |
| `MIGRATION_SUMMARY.md` | Detailed migration documentation |

---

## 🐛 Troubleshooting

### Projects Not Updating?
```javascript
// In browser console:
localStorage.clear()
// Then refresh page
```

### API Not Working?
Check if API is running:
```bash
curl http://167.99.139.139/public/projects
```

### Build Fails?
1. Check `.env.local` exists
2. Verify API is accessible
3. Run `npm install` again

---

## 💡 Pro Tips

### Force Fresh Data
```typescript
import { refreshProjects } from '@/lib/projects';
const projects = await refreshProjects();
```

### Check Cache Age
```javascript
// In browser console:
const timestamp = localStorage.getItem('portfolio_projects_cache_timestamp');
console.log('Cached at:', new Date(parseInt(timestamp)));
```

### Clear Cache
```javascript
// In browser console:
localStorage.clear();
```

---

## 📊 Cache Behavior

| Scenario | What Happens |
|----------|-------------|
| First visit | Fetches from API, caches for 1 hour |
| Within 1 hour | Loads from cache (instant) |
| After 1 hour | Fetches fresh data from API |
| API down | Uses cache (even if expired) |
| No cache + API down | Uses fallback JSON |

---

## ✅ Success Indicators

You'll know it's working when you see:

**In Browser Console:**
- `"Using cached data from [time]"` - Using cache ✅
- `"Using fallback static data"` - API down, using fallback ✅
- No CORS errors ✅

**In Build Output:**
- `✓ Generating static pages (13/13)` ✅
- `✓ Exporting (3/3)` ✅

**On Live Site:**
- All projects display ✅
- Images load ✅
- Links work ✅

---

## 🆘 Need Help?

1. Check `MIGRATION_SUMMARY.md` for detailed docs
2. Run through `TESTING_CHECKLIST.md`
3. Check browser console for errors
4. Verify API endpoint responds

---

## 🎉 You're All Set!

Your portfolio now:
- ✅ Fetches data from live API
- ✅ Caches for performance
- ✅ Falls back gracefully
- ✅ Builds successfully
- ✅ Is well-documented

**Ready to deploy!**

```bash
npm run build && echo "Build successful! Ready to deploy 🚀"
```
