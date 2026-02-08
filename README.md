# TRIM Boy

A Game Boy-themed fitness tracker PWA for logging daily meals and exercise.

![TRIM Boy](client/public/pwa-512x512.png)

## Features

- Log daily meals (breakfast, lunch, dinner, snacks)
- Track exercise/training activities
- View historical logs in the Archive
- Game Boy aesthetic with retro green palette
- PWA support for offline use and mobile installation

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
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  breakfast TEXT,
  lunch TEXT,
  dinner TEXT,
  snacks TEXT,
  training TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
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
