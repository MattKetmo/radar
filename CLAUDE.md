# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Radar is an alert dashboard for [Prometheus Alertmanager](https://prometheus.io/docs/alerting/alertmanager/). It displays, filters, and groups alerts from one or more Alertmanager clusters through a Next.js web UI.

## Commands

```bash
pnpm dev        # Start dev server (Turbopack)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

No test suite is configured.

## Architecture

**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Radix UI, Zod, nuqs.

### Config loading (server-side)

`src/config/` handles all config logic:
- `index.ts` — memoized `getConfig()`: resolves file path → parses YAML/JSON → substitutes `${ENV_VAR}` → validates with Zod → merges with `defaultConfig`
- `types.ts` — Zod schemas (`ConfigSchema`, `ClusterSchema`, `ViewsSchema`). **Zod v4 note**: always use `z.record(z.string(), valueSchema)` — single-argument `z.record()` breaks at runtime.
- Config file location: `APP_CONFIG` env var or auto-detected `config.json`/`config.yaml`/`config.yml`

### API routes (proxy layer)

`src/app/api/` routes act as a secure proxy — cluster endpoints are never sent to the browser:
- `GET /api/config` — serves sanitized config (endpoint fields stripped)
- `GET /api/clusters/[slug]/alerts` — proxies to Alertmanager `/api/v2/alerts`
- `GET /api/clusters/[slug]/silences` — proxies to Alertmanager `/api/v2/silences`
- `POST/DELETE /api/clusters/[slug]/silences/[id]` — manage silences

### Client-side data flow

Three React Context providers (in `src/contexts/`) supply all data:
- `ConfigProvider` — fetches `/api/config` on mount, exposes config to all components
- `AlertsProvider` — polls all clusters in parallel (default 30s interval), enriches each alert with `@cluster` label + cluster's custom labels
- `SilencesProvider` — same pattern, 60s default interval

Components pull data via `useConfig()`, `useAlerts()`, `useSilences()` hooks.

### Pages and routing

```
/                        → Redirects to /alerts (or last visited view via cookie)
/alerts                  → Default alerts view
/alerts/[handle]         → Named view from config (e.g. /alerts/errors)
/silences                → Silence management
/settings                → App settings
```

Pages are thin wrappers — `/alerts/[handle]/page.tsx` just renders `<AlertsTemplate view={handle} />`. Real logic lives in template components under `src/components/`.

### Alert display pipeline

`AlertsTemplate` (`src/components/alerts/template.tsx`) orchestrates:
1. Reads URL state (filters, groupBy, selected alert) via `nuqs`
2. Applies client-side filtering and grouping from `useAlerts()` data
3. Renders `AlertGroups` → `AlertRow` → `AlertModal`

Filter state persists in the URL query string (sharable links).

### Config file format

See `config.example.yaml`. Key fields:
- `clusters[].name` — alphanumeric + dashes, used as URL slug
- `clusters[].endpoint` — Alertmanager base URL
- `clusters[].labels` — extra labels injected into all alerts from this cluster
- `views.<key>` — named views with `groupBy`, `filters[]`, `filtersMatch` (all/any), optional `category`
- `viewCategories.<key>` — sidebar grouping for views
