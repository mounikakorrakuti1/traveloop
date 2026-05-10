# Traveloop — frontend

Vite + React **JavaScript** SPA (UI in **`.jsx`**, logic in **`.js`**) aligned with **Traveloop Implementation Playbook §3**: React Query, Zustand, Tailwind, Axios + cookie session, folder layout, lazy routes, MSW.

The API lives in the sibling folder **`../backend`**.

**Note:** Components were transpiled from the previous TypeScript sources with SWC (automatic **`react/jsx-runtime`** output). Edit **`src/**/*.jsx`** freely; keep **`import`** paths extensionless as usual.

## Setup

1. Copy `.env.example` to `.env`. Set **`VITE_API_URL`** to your API origin (no trailing slash), e.g. `http://localhost:3000`.
2. Optional — UI without a running API: add **`VITE_USE_MSW=true`** to `.env` (uses **`src/mocks/handlers.js`**; demo public slug: **`demo-coastal`**).
3. `npm install` then **`npm start`** or **`npm run dev`** (Vite, port **5173**).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm start` / `npm run dev` | Dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint (JS + JSX + React Hooks) |
| `npm test` | Vitest |

## IDE paths

**`jsconfig.json`** maps **`@/*`** → **`src/*`** (no TypeScript compiler).
