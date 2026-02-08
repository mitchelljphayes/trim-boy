# TRIM Migration Plan: Supabase + Vercel + PWA

> **Goal**: Transform TRIM from a Replit-hosted Express app to a production-ready PWA with proper auth, hosted for free on Supabase + Vercel.

## Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Replit (Single Host)                 │
├─────────────────────────────────────────────────────────┤
│  Express Server (server/)                               │
│  ├── API Routes (/api/users, /api/logs/*)              │
│  ├── Drizzle ORM → PostgreSQL                          │
│  └── Vite Dev Server (serves React)                    │
├─────────────────────────────────────────────────────────┤
│  React Frontend (client/)                               │
│  ├── localStorage for "auth" (user_id, user_name)      │
│  ├── TanStack Query for API calls                      │
│  └── No PWA capabilities                               │
└─────────────────────────────────────────────────────────┘
```

## Target Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Vercel (Free)  │     │  Supabase Auth   │     │   Supabase DB    │
│                  │     │   (Free Tier)    │     │   (Free Tier)    │
│  - React SPA     │────▶│  - Email/Pass    │────▶│  - PostgreSQL    │
│  - PWA manifest  │     │  - OAuth ready   │     │  - RLS policies  │
│  - Service Worker│     │  - JWT sessions  │     │  - Auto REST API │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Phase 1: Supabase Project Setup
**Status**: Not Started

### Tasks
- [ ] Create Supabase project
- [ ] Configure database schema (migrate from Drizzle)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Enable Supabase Auth (email/password)
- [ ] Generate TypeScript types from schema
- [ ] Test database connectivity

### Schema Migration Notes
Current tables:
- `users`: id, name, createdAt
- `logs`: id, userId, category, date, metadata, createdAt

New schema considerations:
- Use Supabase's `auth.users` for authentication
- Create `profiles` table linked to `auth.users.id`
- Keep `logs` table, link to `auth.users.id` instead of custom users table
- Add RLS: users can only CRUD their own logs

### SQL for Supabase
```sql
-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs table
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own logs" ON logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON logs
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Phase 2: Auth Integration
**Status**: Not Started

### Tasks
- [ ] Install `@supabase/supabase-js`
- [ ] Create Supabase client configuration
- [ ] Create AuthContext provider
- [ ] Build Login page (email/password)
- [ ] Build Register page
- [ ] Add password requirements UI
- [ ] Replace localStorage auth with Supabase session
- [ ] Add logout functionality
- [ ] Protect routes (redirect to login if not authenticated)
- [ ] Handle auth state changes (onAuthStateChange)

### Auth Flow
```
1. User visits app → Check Supabase session
2. No session → Redirect to /login
3. Login/Register → Supabase handles auth
4. Success → Store session (Supabase handles this)
5. API calls → Include auth token automatically
6. Logout → Clear session, redirect to /login
```

### Files to Create
- `client/src/lib/supabase.ts` - Supabase client
- `client/src/contexts/AuthContext.tsx` - Auth state management
- `client/src/pages/Login.tsx` - Login form
- `client/src/pages/Register.tsx` - Registration form
- `client/src/components/ProtectedRoute.tsx` - Route guard

### Files to Modify
- `client/src/pages/Onboarding.tsx` - Replace with auth flow
- `client/src/hooks/use-trim.ts` - Use Supabase client instead of fetch
- `client/src/pages/Dashboard.tsx` - Get user from auth context

---

## Phase 3: API Migration
**Status**: Not Started

### Tasks
- [ ] Replace fetch calls with Supabase client queries
- [ ] Update `useWeeklyStats` hook
- [ ] Update `useAllLogs` hook
- [ ] Update `useCreateLog` hook
- [ ] Remove `useCreateUser` hook (handled by auth)
- [ ] Test all data flows
- [ ] Remove Express server code (no longer needed)
- [ ] Update build scripts

### Before/After Example
```typescript
// BEFORE: Custom fetch
const res = await fetch('/api/logs/weekly/' + userId);
const data = await res.json();

// AFTER: Supabase client
const { data, error } = await supabase
  .from('logs')
  .select('*')
  .eq('user_id', userId)
  .gte('date', startDate)
  .lte('date', endDate);
```

---

## Phase 4: PWA Implementation
**Status**: Not Started

### Tasks
- [ ] Install `vite-plugin-pwa`
- [ ] Create `manifest.json` with app metadata
- [ ] Generate app icons (multiple sizes)
- [ ] Configure service worker (Workbox)
- [ ] Add offline fallback page
- [ ] Cache static assets
- [ ] Cache API responses (stale-while-revalidate)
- [ ] Add install prompt handling
- [ ] Test on mobile devices
- [ ] Verify Lighthouse PWA score

### manifest.json Structure
```json
{
  "name": "TRIM - Fitness Protocol",
  "short_name": "TRIM",
  "description": "Retro Game Boy fitness tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#9bbc0f",
  "theme_color": "#0f380f",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Caching Strategy
- **Static assets**: Cache-first (CSS, JS, images)
- **API data**: Stale-while-revalidate (show cached, fetch fresh)
- **Auth**: Network-only (always fresh)

---

## Phase 5: Vercel Deployment
**Status**: Not Started

### Tasks
- [ ] Create `vercel.json` configuration
- [ ] Set up environment variables in Vercel
- [ ] Configure build settings
- [ ] Set up preview deployments
- [ ] Configure custom domain (optional)
- [ ] Test production build locally
- [ ] Deploy to Vercel
- [ ] Verify all features work in production
- [ ] Set up error monitoring (optional: Sentry)

### Environment Variables Needed
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## Phase 6: Cleanup & Polish
**Status**: Not Started

### Tasks
- [ ] Remove Express server files (`server/`)
- [ ] Remove Drizzle configuration
- [ ] Update package.json (remove server deps)
- [ ] Update README with new setup instructions
- [ ] Add data migration script for existing users (if needed)
- [ ] Security audit
- [ ] Performance testing
- [ ] Document Supabase dashboard access

---

## Files to Delete (After Migration)
```
server/
├── index.ts
├── routes.ts
├── storage.ts
├── db.ts
├── vite.ts
├── static.ts
└── seed.ts

drizzle.config.ts
migrations/
```

## Files to Keep/Modify
```
client/           # Main app (heavily modified)
shared/
├── schema.ts     # Keep types, remove Drizzle-specific code
└── routes.ts     # Delete (no longer needed)
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Medium | High | Export all data before migration |
| Auth flow breaks existing users | High | Medium | Clear communication, fresh start |
| Supabase free tier limits | Low | Low | Monitor usage, 500MB is plenty |
| Offline sync conflicts | Medium | Medium | Start with read-only offline |

---

## Success Criteria

- [ ] Users can register with email/password
- [ ] Users can log in and see their data
- [ ] All workout logging features work
- [ ] App is installable as PWA on iOS/Android
- [ ] App works offline (at least read-only)
- [ ] Lighthouse PWA score > 90
- [ ] Zero hosting costs

---

## Timeline Estimate

| Phase | Estimated Effort |
|-------|-----------------|
| Phase 1: Supabase Setup | 1-2 hours |
| Phase 2: Auth Integration | 3-4 hours |
| Phase 3: API Migration | 2-3 hours |
| Phase 4: PWA Implementation | 2-3 hours |
| Phase 5: Vercel Deployment | 1 hour |
| Phase 6: Cleanup | 1-2 hours |
| **Total** | **10-15 hours** |

---

## Quick Reference

### Supabase Dashboard
- URL: https://app.supabase.com
- Project: (TBD after creation)

### Vercel Dashboard  
- URL: https://vercel.com
- Project: (TBD after creation)

### Local Development
```bash
# Install dependencies
npm install

# Run dev server (after migration)
npm run dev

# Build for production
npm run build
```
