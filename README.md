# Pastebin‑Lite

A minimal, production-ready paste service built with Next.js (App Router). Create pastes via API, view them with a shareable URL, and optionally limit lifetime or views.

## Features
- Create pastes via REST API with optional `ttl_seconds` and `max_views`
- View pastes on `/_p/:id` with atomic view counting
- Deterministic time for testing via `TEST_MODE` and `x-test-now-ms`
- In-memory storage for local dev; Upstash Redis ready for production
- Clean, modern UI with card-based layout and accessible form controls

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Optional persistence: Upstash Redis (REST API)

## Quick Start
- Prereqs: Node `>=18`
- Install: `npm install`
- Dev: `npm run dev` → `http://localhost:3000`
- Build: `npm run build`
- Start (prod): `npm run start`

## API
- POST `/api/pastes`
  - Body (JSON):
    - `content` (string, required)
    - `ttl_seconds` (integer ≥ 1, optional)
    - `max_views` (integer ≥ 1, optional)
  - Response: `{ id, url }`

- GET `/api/pastes/:id`
  - Query: none
  - Response: `{ content, remaining_views, expires_at }`
  - Status `404` if expired or view limit reached

- GET `/api/healthz`
  - Response: `{ ok, storage }` where `storage` is `redis` or `memory`

## HTML Routes
- Home: `/` — create a paste via form
- View: `/p/:id` — renders paste content

## Environment Variables (optional)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `TEST_MODE` (set to `1` to enable deterministic time via `x-test-now-ms`)

## Deployment
- Vercel (recommended)
  - Connect GitHub repo: `https://github.com/Barkat0126/Pastebin-lite-assignment`
  - Build command: `npm run build`
  - Output directory: `.next`
  - Environment: set Upstash vars if using Redis

## Live Example
- Example paste: `https://pastebin-lite-assignment.vercel.app/p/sxDb09808Fc0`

## Notes
- In-memory storage is for local dev only; use Redis in production.
- Paste expiry is based on `createdAtMs + ttl_seconds`; view limits are enforced atomically.