# Pixel CRM

Pixel CRM is a pnpm monorepo with a React frontend in `apps/frontend`, an Express API in `apps/backend`, and shared packages in `lib/*`.

## Repo layout

- `apps/frontend`: Vite + React CRM UI
- `apps/backend`: Express API and session-based auth
- `lib/db`: Drizzle schema and Postgres access
- `lib/api-spec`, `lib/api-zod`, `lib/api-client-react`: shared API contracts
- `scripts`: local seed and utility scripts

## Local development

1. Run `pnpm install`.
2. Use `apps/backend/.env.example` and `apps/frontend/.env.example` to create local env files.
3. Start the API with `pnpm --filter @workspace/backend dev`.
4. Start the frontend with `pnpm --filter @workspace/frontend dev`.
5. After Postgres is ready, run `pnpm --filter @workspace/db push` and `pnpm --filter @workspace/scripts seed` if you want demo CRM data.

The frontend proxies `/api` to `http://localhost:5000` during local development, so session cookies work without extra CORS setup.

## Deployment

### Vercel frontend

1. Import this repo into Vercel.
2. Set the project root to `apps/frontend`.
3. Use `pnpm install` as the install command if Vercel does not infer it.
4. Use `pnpm --filter @workspace/frontend build` as the build command if needed.
5. Set the output directory to `dist/public` if Vercel does not infer it.
6. Set `VITE_API_BASE_URL` to your deployed backend origin, for example `https://pixel-crm-api.onrender.com`.
7. Deploy. The included `vercel.json` rewrites all routes to `index.html` for SPA routing.

### Free backend options

- Render:
  Build command: `pnpm install && pnpm --filter @workspace/backend build`
  Start command: `pnpm --filter @workspace/backend start`
- Railway:
  Build command: `pnpm install && pnpm --filter @workspace/backend build`
  Start command: `pnpm --filter @workspace/backend start`
- Koyeb:
  Build command: `pnpm install && pnpm --filter @workspace/backend build`
  Start command: `pnpm --filter @workspace/backend start`

Backend environment variables:

- `DATABASE_URL`
- `SESSION_SECRET`
- `CORS_ORIGIN`
- `NODE_ENV=production`
- `PORT` if your provider does not inject it

### Free Postgres options

- Supabase
- Neon
- Railway Postgres

## What changed

- Replit-specific Vite plugins and `.replit` files were removed.
- The repo now uses `apps/frontend` and `apps/backend` as the primary app packages.
- The backend uses Express with PostgreSQL via Drizzle while preserving the existing UI structure.
- The frontend supports a deploy-time API origin via `VITE_API_BASE_URL`.
- The backend now has production-safe session and CORS defaults.
