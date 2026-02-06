# TRIM - Fitness Tracker

## Overview

TRIM is a retro Game Boy-themed fitness tracking web application. Users log strength workouts, runs, and daily habits (surf, maintenance, breathwork) and view weekly progress on a dashboard. The app features timer-based workout routines with audio cues and a pixel-art visual style using the classic Game Boy DMG green palette.

The app follows a monorepo structure with a React frontend, Express backend, PostgreSQL database, and shared schema/route definitions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Directory Structure
- `client/` — React frontend (Vite-powered SPA)
- `server/` — Express backend API
- `shared/` — Shared TypeScript types, Zod schemas, and route definitions used by both client and server
- `migrations/` — Drizzle-generated database migrations

### Frontend (`client/src/`)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State/Data**: TanStack React Query for server state management
- **UI Components**: Shadcn/ui (new-york style) with Radix UI primitives, heavily customized with Game Boy DMG color palette
- **Styling**: Tailwind CSS with CSS variables for the retro green Game Boy theme. Font is "Press Start 2P" for pixel-art aesthetic. Border radius set to 0 for pixel look.
- **Key Pages**:
  - `/` — Onboarding (enter agent name, creates/fetches user)
  - `/dashboard` — Main hub showing weekly stats (PowerCells for strength/run counts, HabitGrid for daily habits)
  - `/strength-a`, `/strength-b` — Timer-based strength workout routines (3 rounds, 45s per exercise)
  - `/maintenance` — Timer-based mobility routine (1 round, 60s per exercise)
- **Custom Hooks** (`hooks/use-trim.ts`): Wraps all API calls using TanStack Query mutations/queries with Zod validation on responses
- **Audio**: Web Audio API generates retro square-wave beeps for workout timer transitions (`hooks/use-audio.ts`)
- **User Session**: Stored in `localStorage` (`trim_user_id`, `trim_user_name`) — no server-side sessions or auth

### Backend (`server/`)
- **Framework**: Express 5 on Node.js, served via `tsx` in development
- **API Pattern**: REST endpoints defined in `server/routes.ts`, with route contracts (path, method, input/output Zod schemas) shared via `shared/routes.ts`
- **Storage Layer**: `server/storage.ts` implements `IStorage` interface using Drizzle ORM queries. Single `DatabaseStorage` class exported as `storage` singleton.
- **Development**: Vite dev server middleware integrated for HMR (`server/vite.ts`)
- **Production**: Client built to `dist/public`, server bundled with esbuild to `dist/index.cjs`

### Database
- **Engine**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for automatic Zod schema generation
- **Schema** (`shared/schema.ts`):
  - `users` table: `id` (serial PK), `name` (unique text), `createdAt`
  - `logs` table: `id` (serial PK), `userId` (FK to users), `category` (text: 'strength'|'run'|'surf'|'maint'|'breath'), `date` (date string YYYY-MM-DD), `createdAt`
- **Migrations**: Run `npm run db:push` to push schema changes directly (uses drizzle-kit push)

### API Endpoints
- `POST /api/users` — Get or create user by name (max 8 chars)
- `POST /api/logs` — Create a new activity log entry
- `GET /api/logs/weekly/:userId` — Get weekly stats (strength count, run count, daily habit booleans)

### Shared Route Contracts (`shared/routes.ts`)
All API routes are defined as objects with `method`, `path`, `input` (Zod schema), and `responses` (Zod schemas keyed by status code). Both client hooks and server handlers reference these contracts for type safety and validation. A `buildUrl` helper handles parameterized paths.

### Build System
- **Dev**: `npm run dev` — runs tsx + Vite dev server with HMR
- **Build**: `npm run build` — Vite builds client, esbuild bundles server. Specific dependencies are bundled (allowlist in `script/build.ts`) while others are kept external.
- **Type Check**: `npm run check` — TypeScript checking across all packages

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets` → `attached_assets/`

## External Dependencies

### Required Services
- **PostgreSQL Database**: Must be provisioned and connected via `DATABASE_URL` environment variable. Used for all persistent data storage.

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and migration tooling
- **express** (v5): HTTP server
- **@tanstack/react-query**: Async server state management
- **zod** + **drizzle-zod**: Schema validation and type inference
- **wouter**: Client-side routing
- **date-fns**: Date manipulation for weekly calculations
- **lucide-react**: Icon library
- **Radix UI** (multiple packages): Accessible UI primitives for shadcn/ui components
- **tailwindcss**: Utility-first CSS framework
- **embla-carousel-react**, **recharts**, **vaul**, **react-day-picker**, **react-resizable-panels**, **react-hook-form**: Additional UI libraries (installed via shadcn/ui, not all actively used)

### Tiered Visual Unlock System
- **Tier 1 (GBC Color Unlock)**: Triggers at first 2-week streak. Fireworks particle overlay → GBC UNLOCKED text → CSS theme switched to `theme-color`. Persisted via `trim_gbc_unlocked` and `trim_gbc_announced` in localStorage.
- **Tier 2 (Gold Mode Unlock)**: Triggers at streak >= 2. Flame engulf transition → golden UI reveal with golden TrimBoy sprite. Applies `theme-gold`. Session-gated via sessionStorage `trim_gold_announced_session`.
- **EvolutionOverlay** (`components/EvolutionOverlay.tsx`): Orchestrates the full visual sequence with fireworks, GBC reveal, flame transition, and gold reveal.
- **HardwareToggle**: GBC mode only available after `isGbcUnlocked()`, Gold only when streak >= 2.
- **Evolution Events**: Logged as milestones (GBC_UNLOCK, GOLD_UNLOCK) and displayed in Archive's Evolution Timeline section.

### No External Auth
Authentication is not implemented. User identity is based on a simple name lookup stored in localStorage on the client side.