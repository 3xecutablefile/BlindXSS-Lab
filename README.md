# BlindXSS Lab (Next.js + Serverless)

An intentionally vulnerable Blind XSS practice lab built on Next.js. It includes:
- A single-page UI to submit payloads and contact messages
- Serverless API routes that record activity
- A serverless “bot” endpoint that scans recent reports (simulating an admin reading and triggering XSS)

This repo is tuned for Vercel’s serverless platform (no local file writes; ephemeral in-memory store).

## Features
- Next.js app (Pages Router)
- Serverless APIs: `/api/reports`, `/api/comments`, `/api/contact`, `/api/collect-xss`, `/api/xss-payloads`
- Admin bot endpoint: `/api/bot` (manual trigger or Vercel Cron)
- No DB dependency in deployment: uses an in-memory store per warm lambda

## Requirements
- Node.js 18+ (Next.js 14)
- npm 9+ or pnpm/yarn equivalent

## Quick Start (Local)
1) Clone and install:
   - `git clone https://github.com/3xecutablefile/BlindXSS-Lab.git`
   - `cd BlindXSS-Lab`
   - `npm install`

2) Run dev server:
   - `npm run dev`
   - App runs at `http://localhost:3000`

3) Optional production build locally:
   - `npm run build && npm start`
   - Starts a production server on port 3000

4) Try it:
   - Open the homepage and submit an XSS payload (e.g. `<script>alert('XSS')</script>`)
   - Submit a contact message to see your UA captured
   - Trigger the bot manually: `curl http://localhost:3000/api/bot`

Notes for local dev:
- Data is kept in memory and resets on server restart.

## Deploy to Vercel (CLI)
1) Install Vercel CLI:
   - `npm i -g vercel`

2) Deploy:
   - First time: `vercel` (link project and confirm)
   - Production: `vercel --prod --yes`

3) Make it public:
   - In Vercel → Project → Settings → Deployment Protection → set Production to Public

4) Optional (Cron):
   - The included `vercel.json` schedules the bot once per day (Hobby plan limit):
     - `GET /api/bot` at 00:00 UTC
   - You can trigger manually anytime or use an external pinger for higher frequency.

## Deploy via Dashboard
1) Create a new Vercel Project and import this GitHub repo.
2) Framework Preset: Next.js
3) Root Directory: `/` (repo root)
4) Build/Output: leave empty (Next.js defaults)
5) After deploy, go to Settings → Deployment Protection and set Production to Public.

## API Overview
- `GET /api/reports` → list reports
- `POST /api/reports` → `{ userAgent: string }` adds a report
- `GET /api/comments` → list comments
- `POST /api/comments` → `{ name, comment }` adds a comment
- `POST /api/contact` → `{ name, email, message }` stores a contact message + UA
- `GET|POST /api/collect-xss` → collects payload data (returns 1x1 GIF)
- `GET /api/xss-payloads` → list collected payloads
- `GET /api/bot` → scans last 5 minutes of reports and flags XSS-like payloads

Example calls:
```
curl -X POST http://localhost:3000/api/reports \
  -H 'Content-Type: application/json' \
  -d '{"userAgent":"<img src=x onerror=alert(1)>"}'

curl http://localhost:3000/api/bot
```

## Troubleshooting
- 404 NOT_FOUND on Vercel: Attach your domain to the latest Production deployment (Settings → Domains), ensure Framework Preset is Next.js, Root Directory is `/`, and re-deploy.
- 401 Authentication Required: Disable Deployment Protection (Settings → Deployment Protection → Production → Public) or use a bypass token.
- Data disappears: The store is in-memory; it resets on cold starts/redeploys. For persistence, wire a managed DB (Vercel Postgres, Supabase, Turso).

## Security Notes
- Intentionally vulnerable. Do not use with real data.
- For educational purposes only.
