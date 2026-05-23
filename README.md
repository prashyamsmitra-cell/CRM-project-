# ForgeCRM Frontend

This repository now contains only the ForgeCRM frontend application.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS

## Local development

1. Install dependencies:

```bash
pnpm install
```

2. Create a local env file from `.env.example` if needed.

3. Start the frontend:

```bash
pnpm dev
```

The app runs on `http://localhost:5173`.

## Environment variables

- `VITE_API_BASE_URL`
  The deployed backend base URL, for example `https://your-api.onrender.com`

- `VITE_DEV_API_PROXY_TARGET`
  Optional local backend proxy target for development. Defaults to `http://localhost:5000`

## Build

```bash
pnpm build
```

## Deploy to Vercel

Use these settings:

- Framework Preset: `Vite`
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output Directory: `dist`

Set:

- `VITE_API_BASE_URL=https://your-backend-url`

## Backend

The backend has been split out locally into a separate sibling folder at `../backend-repo` so it can be published independently.
