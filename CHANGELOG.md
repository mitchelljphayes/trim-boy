# Changelog

All notable changes to TRIM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Planning Phase - 2026-02-08

#### Decisions Made

1. **Hosting Platform**: Supabase + Vercel
   - **Rationale**: Both have generous free tiers, Supabase provides auth + database in one, Vercel handles static hosting excellently
   - **Alternatives Considered**:
     - Railway + Lucia Auth (more code changes, Railway has $5/mo credit limit)
     - Render + Better Auth (free tier sleeps after 15min)
     - Keep Express, just add auth (requires more security work)

2. **Authentication**: Supabase Auth (email/password)
   - **Rationale**: Free, secure, handles sessions/JWT automatically, easy OAuth later
   - **Alternatives Considered**:
     - Clerk (great DX but more opinionated)
     - Auth0 (enterprise-grade, overkill for hobby)
     - Roll our own with bcrypt (security risk, maintenance burden)

3. **Database**: Supabase PostgreSQL
   - **Rationale**: Already using PostgreSQL, Supabase is just hosted Postgres with extras
   - **Migration Strategy**: Create new schema with RLS, no direct data migration (fresh start)

4. **Architecture Change**: Remove Express server entirely
   - **Rationale**: Supabase's auto-generated REST API (PostgREST) handles all CRUD operations
   - **Impact**: Simpler codebase, fewer moving parts, client-only deployment

5. **PWA Approach**: vite-plugin-pwa with Workbox
   - **Rationale**: Well-maintained, integrates with existing Vite setup
   - **Offline Strategy**: Cache-first for assets, stale-while-revalidate for data

#### Architecture Before
```
Replit (monolith)
├── Express Server
│   ├── Custom API routes
│   └── Drizzle ORM → PostgreSQL
└── React Frontend
    └── localStorage "auth"
```

#### Architecture After
```
Vercel (static)          Supabase (managed)
└── React PWA      ────▶ ├── Auth (email/pass)
    ├── Offline support  ├── PostgreSQL + RLS
    └── Installable      └── Auto REST API
```

---

## Version History

### [0.1.0] - Initial Replit Version (Pre-migration)

#### Features (Inherited from friend's Replit build)
- Game Boy DMG visual theme with pixel art sprites
- Workout routines: Strength A/B, Maintenance, Running, Surfing, Breathwork
- Timer-based exercises with audio cues (Web Audio API)
- Weekly stats dashboard with PowerCells and HabitGrid
- "4-2 Protocol" streak system
- Tiered visual unlocks:
  - GBC Color Mode (2-week streak)
  - Gold Mode (streak >= 2)  
  - Lightning Edition (streak >= 5)
- Marine data integration for surf logs (Open-Meteo API)
- Secret C.R.E.A.M. chiptune Easter egg
- Evangelion background music

#### Tech Stack (Original)
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Express 5, Drizzle ORM, PostgreSQL
- Routing: Wouter
- State: TanStack Query
- Validation: Zod (shared schemas)

#### Known Issues (To Fix in Migration)
- No real authentication (username only, stored in localStorage)
- No authorization (any user can access any data via API)
- No session management
- No security headers
- No rate limiting
- Not installable as PWA
- No offline support

---

## Migration Progress

### Phase 1: Supabase Setup - COMPLETE
- [x] Create project (fphunxrvpcwufxaomldy)
- [x] Configure schema (profiles, logs tables)
- [x] Set up RLS (row-level security policies)
- [x] Enable auth (email/password)

### Phase 2: Auth Integration - COMPLETE
- [x] Supabase client (`lib/supabase.ts`)
- [x] AuthContext (`contexts/AuthContext.tsx`)
- [x] Login/Register pages (Game Boy styled)
- [x] Protected routes (`components/ProtectedRoute.tsx`)
- [x] Logout functionality

### Phase 3: API Migration - COMPLETE
- [x] Replace fetch with Supabase client
- [x] Update useWeeklyStats hook
- [x] Update useAllLogs hook
- [x] Update useCreateLog hook
- [x] Update Dashboard to use AuthContext
- [x] Update Archive to use AuthContext
- [ ] End-to-end testing (IN PROGRESS)

### Phase 4: PWA
- [ ] Manifest
- [ ] Icons
- [ ] Service worker
- [ ] Offline support

### Phase 5: Deployment
- [ ] Vercel config
- [ ] Environment variables
- [ ] Production deploy

### Phase 6: Cleanup
- [ ] Remove server code
- [ ] Update docs
- [ ] Final testing

---

## Notes

### Supabase Project Details
- **Project ID**: fphunxrvpcwufxaomldy
- **Project URL**: https://fphunxrvpcwufxaomldy.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/fphunxrvpcwufxaomldy

### Vercel Project Details
- **Project Name**: (TBD)
- **Production URL**: (TBD)
- **Preview URL Pattern**: (TBD)

### Environment Variables
```bash
# Required for production
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Local development
# Copy to .env.local
```

### Useful Commands
```bash
# Generate Supabase types (after schema changes)
npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts

# Test production build locally
npm run build && npm run preview

# Deploy to Vercel
vercel --prod
```
