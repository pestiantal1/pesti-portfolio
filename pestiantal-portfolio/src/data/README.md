# Projects Data Directory

## files

### projects.fallback.json
This is a **fallback/emergency backup file**. 

**Live data comes from the API at:** `http://167.99.139.139/public/projects`

This file is only used when:
- The API is unreachable
- The network is down
- The cache has expired and API request fails

### Update Strategy
- Update this file only when making major structural changes to projects
- Keep it synchronized with the API periodically (monthly review recommended)
- This file is included in the production build as a reliability fallback
