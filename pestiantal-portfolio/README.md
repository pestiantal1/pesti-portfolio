This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Portfolio Project Overview

This portfolio is statically generated using Next.js and deployed on GitHub Pages. It dynamically fetches project data from a live API with intelligent caching and fallback strategies.

## Portfolio Data Fetching System

### How It Works

The portfolio uses a multi-tier data fetching strategy to ensure reliability:

1. **Live API** (Primary) - Fetches fresh project data from `http://167.99.139.139/public/projects`
2. **LocalStorage Cache** (Secondary) - Caches API responses for 1 hour to reduce API calls
3. **Static Fallback** (Tertiary) - Uses `src/data/projects.fallback.json` if API and cache fail

### Data Flow

```
User visits site
    ↓
Try API fetch ──✓──→ Cache & Display
    ↓ ✗
Check Cache ──✓──→ Display cached data
    ↓ ✗
Load Fallback ──→ Display static data
```

### Cache Behavior

- **Cache TTL**: 1 hour (configurable via `NEXT_PUBLIC_CACHE_TTL`)
- **Storage**: Browser localStorage
- **Automatic**: Cached on successful API fetch
- **Manual Refresh**: Call `refreshProjects()` to bypass cache

### Environment Variables

Create a `.env.local` file (see `.env.example`):

```env
NEXT_PUBLIC_API_BASE_URL=http://167.99.139.139
NEXT_PUBLIC_API_ENDPOINT=/public/projects
NEXT_PUBLIC_CACHE_TTL=3600000
```

### Updating Project Data

Project data is managed through the **Project Tracker UI** at your API server. Changes are automatically reflected in the portfolio after:
- Cache expires (1 hour default)
- Manual refresh via `refreshProjects()`  
- Browser localStorage is cleared

The static fallback file (`src/data/projects.fallback.json`) should be updated manually only for:
- Major structural changes
- Emergency backup synchronization
- Monthly maintenance reviews

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Building for Production

This project is configured for static export to GitHub Pages:

```bash
npm run build
```

The output will be in the `out/` directory, ready to deploy to GitHub Pages.

## API Integration Testing

### Test API Accessibility

```bash
curl http://167.99.139.139/public/projects
```

### Verify CORS Headers

```bash
curl -I http://167.99.139.139/public/projects
```

Should show:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`

### Test Fallback Strategy

1. Disconnect from internet
2. Clear browser localStorage
3. Visit portfolio - should load data from static fallback

## Troubleshooting

### Projects not updating

1. Check cache age in browser console: Look for `"Using cached data from [time]"`
2. Clear localStorage: `localStorage.clear()` in browser console
3. Force refresh: Call `refreshProjects()` in your code

### API errors

- Check API is running: `curl http://167.99.139.139/public/projects`
- Verify CORS headers are present
- Check browser console for detailed error messages

### Fallback data is outdated

Update `src/data/projects.fallback.json` manually to match current API data.

## Project Structure

```
src/
├── lib/
│   └── projects.ts          # API fetching logic with caching
├── data/
│   ├── projects.fallback.json  # Static fallback data
│   └── README.md               # Data directory documentation
├── types/
│   └── project.ts             # TypeScript interfaces
└── app/
    └── projects/              # Project pages
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

