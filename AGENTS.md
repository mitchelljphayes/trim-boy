# TRIM Boy - Agent Instructions

A Game Boy-themed fitness PWA with React + TypeScript + Vite + Supabase.

## Build & Run Commands

```bash
# Development
npm run dev              # Start dev server with hot reload (port 5173)

# Build & Preview
npm run build            # Production build to dist/public
npm run preview          # Preview production build

# Type Checking
npm run check            # Run TypeScript compiler (tsc --noEmit)

# Testing
npm run test             # Run all tests once
npm run test:watch       # Run tests in watch mode
npx vitest run client/src/tests/log-endpoints.test.ts  # Single test file
npx vitest run -t "should insert a strength log"       # Single test by name
```

## Project Structure

```
trim-boy/
├── client/
│   ├── public/          # Static assets, PWA icons
│   └── src/
│       ├── components/  # Reusable UI (shadcn/ui + custom)
│       ├── contexts/    # React contexts (AuthContext)
│       ├── hooks/       # Custom hooks (use-trim, use-audio)
│       ├── lib/         # Utilities (supabase client, utils)
│       ├── pages/       # Route components
│       ├── tests/       # Vitest test files
│       └── types/       # TypeScript type definitions
├── supabase/
│   └── migrations/      # SQL migration files
└── attached_assets/     # Sprite images and static assets
```

## Path Aliases

```typescript
import { cn } from "@/lib/utils";           // → client/src/lib/utils
import type { Log } from "@/types/supabase"; // → client/src/types/supabase
import sprite from "@assets/sprite.png";     // → attached_assets/sprite.png
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - No implicit any, strict null checks
- **Explicit return types** on exported functions and hooks
- **Use `type` imports** for type-only imports:
  ```typescript
  import type { LogCategory, Log } from "@/types/supabase";
  import { format } from "date-fns";
  ```
- **Interface for objects, type for unions/primitives**:
  ```typescript
  interface WeeklyStats {
    strengthCount: number;
    runCount: number;
  }
  type LogCategory = 'strength' | 'run' | 'surf' | 'maint' | 'breath' | 'yoga';
  ```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `use-trim.ts`, `TimerPage.tsx` |
| Components | PascalCase | `HabitGrid`, `RetroButton` |
| Hooks | camelCase with `use` prefix | `useWeeklyStats`, `useAuth` |
| Types/Interfaces | PascalCase | `LogCategory`, `WeeklyStats` |
| Functions | camelCase | `formatTime`, `fetchProfile` |
| Constants | SCREAMING_SNAKE_CASE | `VITE_SUPABASE_URL` |
| Test files | `*.test.ts` or `*.test.tsx` | `log-endpoints.test.ts` |

### React Patterns

- **Functional components only** - No class components
- **Hooks at top level** - Before any conditional returns
- **Early returns for loading/null states**:
  ```typescript
  if (!userId) return null;
  if (loading) return <LoadingSpinner />;
  ```
- **Use `useCallback` for event handlers** passed to children:
  ```typescript
  const handleLogout = useCallback(async () => {
    await signOut();
    setLocation('/login');
  }, [signOut, setLocation]);
  ```
- **Destructure props and hooks**:
  ```typescript
  const { user, profile, signOut } = useAuth();
  const [, setLocation] = useLocation();
  ```

### Data Fetching

- **TanStack Query** for server state (useQuery, useMutation)
- **Query keys** as arrays: `['weekly-stats', userId]`
- **Invalidate on mutation**:
  ```typescript
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['weekly-stats'] });
  }
  ```

### Error Handling

- **Use `console.error`** for logging errors
- **Throw errors** from async functions, catch in mutation handlers
- **Check for null/undefined** before accessing nested properties:
  ```typescript
  if (!session?.user) {
    throw new Error('Not authenticated');
  }
  ```

### Styling

- **Tailwind CSS** with custom Game Boy color variables
- **Use `cn()` utility** for conditional classes:
  ```typescript
  className={cn("base-class", isActive && "active-class")}
  ```
- **CSS variables** for theming: `hsl(var(--gb-darkest))`
- **Radix UI primitives** for accessible components

## Testing

### Test Setup

- Framework: **Vitest** with jsdom environment
- Setup file: `client/src/tests/setup.ts`
- Mocking: Use `vi.mock()` for modules, `vi.fn()` for functions

### Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something specific', async () => {
    // Arrange
    const mockData = { ... };
    
    // Act
    const result = await functionUnderTest();
    
    // Assert
    expect(result).toEqual(expectedValue);
  });
});
```

### Mocking Supabase

```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue(queryBuilder),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
    },
  },
}));
```

## Supabase

### Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Tables

- **profiles**: User profiles linked to auth.users
- **logs**: Activity logs (strength, run, surf, maint, breath, yoga)

### RLS Policies

All tables use Row Level Security. Users can only access their own data:
```sql
USING (auth.uid() = user_id)
```

## Important Patterns

### Auth Context Usage

```typescript
const { user, profile, signOut } = useAuth();
const userId = user?.id ?? null;
```

### Creating Logs

```typescript
const { mutate: logActivity } = useCreateLog();
logActivity({ 
  category: 'strength', 
  date: new Date(),
  metadata: { optional: 'data' }
});
```

### Date Handling

Use `date-fns` for all date operations:
```typescript
import { format, startOfWeek, endOfWeek } from 'date-fns';
const formattedDate = format(date, 'yyyy-MM-dd');
const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
```

### Routing

Use `wouter` (not react-router):
```typescript
import { useLocation } from 'wouter';
const [, setLocation] = useLocation();
setLocation('/dashboard');
```

## PWA Notes

- Service worker caches static assets
- Supabase API calls are **never cached** (NetworkOnly strategy)
- Use `registerType: "prompt"` for update notifications
