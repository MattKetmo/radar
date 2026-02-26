# AGENTS.md

> Guidance for AI coding agents operating in this repository.

## Project Overview

Radar is an alert dashboard for Prometheus Alertmanager. It displays, filters, and groups alerts from one or more Alertmanager clusters via a Next.js web UI.

**Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (Radix UI), Zod v4, nuqs.

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint (next lint)
```

No test suite is configured. No formatter (Prettier) is configured. Validate changes with `pnpm lint` and `pnpm build`.

## Architecture

### Directory Structure

```
src/
├── app/              # Next.js App Router — pages, layouts, API routes
│   ├── api/          # Server-only proxy routes (cluster endpoints never exposed to browser)
│   ├── alerts/       # /alerts and /alerts/[handle] pages
│   ├── silences/     # /silences page
│   └── settings/     # /settings page
├── components/       # React components (feature-based organization)
│   ├── ui/           # shadcn/ui primitives — DO NOT edit manually, use `npx shadcn@latest`
│   ├── alerts/       # Alert display, filtering, grouping
│   ├── silences/     # Silence management
│   ├── layout/       # App shell: sidebar, header, loading
│   ├── command/      # Command palette (⌘K)
│   └── settings/     # Settings page components
├── contexts/         # React Context providers (config, alerts, silences)
├── config/           # Server-side config loading & Zod validation
├── lib/              # Shared utilities (cn(), date formatting)
├── hooks/            # Custom React hooks
└── types/            # Global TypeScript type definitions (Zod schemas)
```

### Key Patterns

- **Pages are thin wrappers.** `page.tsx` renders a `<Template>` component. Logic lives in `src/components/<feature>/template.tsx`.
- **Three Context providers** supply all data: `ConfigProvider`, `AlertsProvider`, `SilencesProvider`. Components consume via `useConfig()`, `useAlerts()`, `useSilences()`.
- **API routes are a proxy layer.** `src/app/api/` proxies requests to Alertmanager. Cluster endpoints are server-side only.
- **URL-driven state.** Filter state persists in query string via `nuqs` (sharable links).
- **Config loaded server-side.** `getConfig()` in `src/config/index.ts`: resolves file path → parses YAML/JSON → substitutes `${ENV_VAR}` → validates with Zod → merges with defaults.

## Code Style

### Imports

Order: external libraries → internal `@/` imports → relative `./` imports. Group by category with blank lines.

```typescript
// 1. External
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

// 2. Internal (@/ alias)
import { ViewConfig } from "@/config/types";
import { useAlerts } from "@/contexts/alerts";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";

// 3. Relative
import { AlertGroups } from "./alert-groups";
import { Group, LabelFilter } from "./types";
```

Use `@/*` path alias (mapped to `./src/*`) for all non-relative imports.

### Naming

| Category | Convention | Examples |
|---|---|---|
| Components | PascalCase | `AlertRow`, `SilenceModal` |
| Functions | camelCase | `alertFilter()`, `parseFilter()` |
| Types / Interfaces | PascalCase | `Alert`, `ViewConfig`, `Group` |
| Zod schemas | PascalCase + `Schema` | `AlertSchema`, `ConfigSchema` |
| Context hooks | `use` + Name | `useConfig()`, `useAlerts()` |
| Providers | Name + `Provider` | `ConfigProvider`, `AlertsProvider` |
| Files: components | kebab-case | `alert-row.tsx`, `group-select.tsx` |
| Files: feature utils | `utils.ts`, `types.ts` | Co-located in feature directory |

### Exports

- **Named exports** for components, hooks, types, utilities (preferred).
- **Default exports** only for Next.js pages/layouts (`export default function Page`).
- Co-export Zod schema + inferred type: `export const FooSchema = z.object({...})` then `export type Foo = z.infer<typeof FooSchema>`.

### TypeScript

- **Strict mode** enabled. Do not use `as any`, `@ts-ignore`, or `@ts-expect-error`.
- **Zod for runtime validation.** Define schema first, infer type with `z.infer<typeof Schema>`. Use `safeParse()` for validation.
- **Zod v4 gotcha:** Always use `z.record(z.string(), valueSchema)` with two arguments. Single-argument `z.record()` breaks at runtime.
- **`interface`** for context props and component prop shapes. **`type`** for domain models, unions, and Zod-inferred types.
- Props pattern: define `type Props = { ... }` above the component, destructure in function signature.

### Components

- Add `'use client'` directive at the top of any file using hooks, event handlers, or browser APIs.
- Server components (pages, layouts, API routes) do NOT use the directive.
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes: `cn("base", condition && "variant")`.
- shadcn/ui components live in `src/components/ui/` — do not edit these manually.
- Icons from `lucide-react`.

### Context Provider Pattern

Every context follows this structure:
1. Define interface for context value.
2. `createContext<T | undefined>(undefined)`.
3. Export `Provider` component that fetches data and wraps children.
4. Export `useX()` hook that throws if used outside provider.

### Error Handling

- **API routes:** try/catch → `console.error()` → return `new Response(message, { status })`.
- **Context providers:** try/catch → `console.error()` → set error state → render error fallback.
- **Zod validation:** `safeParse()` → check `.success` → log `.error.issues` on failure → throw or return error response.
- Catch type: `catch (error: unknown)` → `if (error instanceof Error) message = error.message`.

### Formatting

- No Prettier configured. Follow existing file conventions.
- Semicolons: **inconsistent** — some files use them, some don't. Match the file you're editing.
- Quotes: double quotes for JSX attributes and imports.
- Trailing commas in multi-line objects/arrays.
- 2-space indentation.

## CI/CD

- **Docker workflow** (`.github/workflows/docker.yaml`): builds multi-arch images (amd64/arm64) on push to main, PRs, and releases. Pushes to `ghcr.io`.
- **PR title validation** (`.github/workflows/pr-title.yaml`): enforces semantic prefixes (`fix:`, `feat:`, `chore:`, etc.).
- **Release drafter** auto-generates changelogs from merged PRs.
- Build output is `standalone` mode (see `next.config.ts`) for Docker deployment.

## Important Gotchas

1. **Cluster endpoints are secrets.** Never expose them to the client. API routes strip endpoints before sending config to the browser.
2. **`src/components/ui/` is auto-generated** by shadcn. Use `npx shadcn@latest add <component>` to add new ones.
3. **Zod v4** — `z.record()` requires two arguments: `z.record(z.string(), valueSchema)`.
4. **No test suite.** Validate with `pnpm lint` and `pnpm build`.
5. **Config file location** is `APP_CONFIG` env var or auto-detected `config.json`/`config.yaml`/`config.yml` in project root.
