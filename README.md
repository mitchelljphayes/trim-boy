# TRIM Boy

A Game Boy-themed fitness tracker PWA with the "4-2 Protocol" (4 strength sessions + 2 runs per week).

![TRIM Boy](client/public/pwa-512x512.png)

## Features

- **4-2 Protocol Tracking**: Log 4 strength workouts and 2 runs per week
- **Activity Logging**: Strength A/B, Running, Surfing, Breathwork, Maintenance, Yoga
- **Streak System**: Track consecutive weeks of protocol completion
- **Gamification**: Unlock new themes (Classic → Color → Gold → Storm)
- **Archive**: View historical activity logs
- **Game Boy Aesthetic**: Retro green palette with LCD effects
- **PWA Support**: Installable, works offline

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL)
- **Hosting**: Vercel
- **PWA**: vite-plugin-pwa with Workbox

## Live App

**[https://trim-boy.vercel.app](https://trim-boy.vercel.app)**

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (for backend)

### 1. Clone the repository

```bash
git clone https://github.com/mitchelljphayes/trim-boy.git
cd trim-boy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

Create a Supabase project at [supabase.com](https://supabase.com), then create the required tables:

```sql
-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Logs table (activity tracking)
-- Categories: 'strength', 'run', 'surf', 'maint', 'breath', 'yoga'
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON logs FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX logs_user_date_idx ON logs(user_id, date);
CREATE INDEX logs_user_category_idx ON logs(user_id, category);
```

### 4. Set environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp client/.env.example client/.env.local
```

Edit `client/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Configure Supabase Auth

In your Supabase dashboard, go to **Authentication > URL Configuration** and add:

- Site URL: `http://localhost:5173` (dev) or your production URL
- Redirect URLs: `http://localhost:5173/**`, `https://your-domain.vercel.app/**`

### 6. Run development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

The `vercel.json` is pre-configured for SPA routing.

## Project Structure

```
trim-boy/
├── client/
│   ├── public/           # Static assets, PWA icons
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React contexts (Auth)
│       ├── hooks/        # Custom hooks (useTrim)
│       ├── lib/          # Utilities (supabase client)
│       ├── pages/        # Route components
│       └── types/        # TypeScript types
├── vercel.json           # Vercel deployment config
├── vite.config.ts        # Vite + PWA config
└── package.json
```

## License

MIT
