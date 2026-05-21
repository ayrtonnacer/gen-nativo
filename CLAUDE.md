# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev        # Start development server
bun build      # Production build
bun start      # Start production server
bun lint       # Run ESLint
```

No test suite is configured. TypeScript build errors are intentionally suppressed (`ignoreBuildErrors: true` in `next.config.mjs`).

## Environment

The app requires Supabase credentials. Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Architecture

**Gen Nativo** is a Next.js 16 (App Router) production management system for a native tree multiplication lab, written entirely in Spanish. It uses Supabase for auth and database, shadcn/ui (New York style) for components, and Tailwind CSS v4.

### Key architectural patterns

- **Server vs. client Supabase clients**: `lib/supabase/server.ts` uses `createServerClient` (for Server Components, Server Actions, Route Handlers), `lib/supabase/client.ts` uses `createBrowserClient` (for Client Components). Never use the server client in browser code.
- **Middleware**: `middleware.ts` → `lib/supabase/middleware.ts` refreshes the Supabase session on every request. It matches all routes except `_next/static`, `_next/image`, and `favicon.ico`.
- **Auth flow**: Login at `app/page.tsx` → Supabase OAuth callback at `app/auth/callback/route.ts` → redirects to `/dashboard`.
- **Database types**: Auto-generated Supabase types live in `lib/database.types.ts`. Application-level types are in `lib/types.ts`.

### Route structure

| Path | Purpose |
|------|---------|
| `/` | Login page |
| `/dashboard` | Main dashboard with stats and charts |
| `/lotes/nuevo` | Create production batch |
| `/lotes/[id]` | Batch detail |
| `/etapas/germinacion` | Germination stage tracking |
| `/etapas/repique` | Transplant stage tracking |
| `/etapas/rusticacion` | Hardening stage tracking |
| `/etapas/campo` | Field stage tracking |
| `/admin` | Admin panel (species, genetics, users) |
| `/api/admin/usuarios` | User management API route |

### Styling

Tailwind CSS v4 — import syntax changed: `@import "tailwindcss"` in `globals.css` (no `tailwind.config.*` file needed). The theme uses OKLch color variables with an earthy green palette. Use the `cn()` utility from `lib/utils.ts` for conditional class merging.

### Component conventions

- `components/ui/` — shadcn/ui primitives, generated via `npx shadcn@latest add <component>`. Do not edit manually.
- `components/admin/` — admin-specific forms and action buttons (server/client as appropriate).
- Top-level `components/` — feature components (dashboard stats, charts, batch table, etc.).
- Custom hooks live in `hooks/`.
