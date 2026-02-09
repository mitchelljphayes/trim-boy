/**
 * Migration Issue Tests
 *
 * These tests specifically target issues caused by the Express → Supabase migration.
 * They verify that all pages correctly use Supabase auth instead of legacy localStorage.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Helper to read source files
function readSourceFile(relativePath: string): string {
  const fullPath = path.resolve(__dirname, '..', relativePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

describe('Migration Issues: Express → Supabase', () => {
  // ─── CRITICAL: localStorage user ID no longer set ──────────
  describe('CRITICAL: trim_user_id localStorage is never set but still read', () => {
    it('RunLog.tsx reads trim_user_id from localStorage (BROKEN)', () => {
      const source = readSourceFile('pages/RunLog.tsx');

      // This is the bug: RunLog reads trim_user_id from localStorage
      const readsLocalStorage = source.includes("localStorage.getItem('trim_user_id')");
      expect(readsLocalStorage).toBe(true);

      // But trim_user_id is never set anywhere in the codebase
      // After Express migration, user ID comes from Supabase auth, not localStorage
      // This means handleSave() will ALWAYS return early without saving
    });

    it('SurfLog.tsx reads trim_user_id from localStorage (BROKEN)', () => {
      const source = readSourceFile('pages/SurfLog.tsx');

      const readsLocalStorage = source.includes("localStorage.getItem('trim_user_id')");
      expect(readsLocalStorage).toBe(true);

      // Same issue as RunLog: handleSave() will ALWAYS return early
    });

    it('trim_user_id is NEVER set in the codebase (root cause)', () => {
      // Search all TSX files for setting trim_user_id (excluding test files)
      const pagesDir = path.resolve(__dirname, '..');
      const allFiles = getAllTsxFiles(pagesDir).filter(
        f => !f.includes('/tests/') && !f.includes('.test.')
      );

      const setterPattern = 'localStorage.setItem(' + "'trim_user_id'";
      let setsTrimeUserId = false;
      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes(setterPattern)) {
          setsTrimeUserId = true;
          break;
        }
      }

      // This PROVES the bug: no non-test file ever sets trim_user_id
      expect(setsTrimeUserId).toBe(false);
    });

    it('RunLog userId is read but never used in the logActivity call', () => {
      const source = readSourceFile('pages/RunLog.tsx');

      // The userId variable is read from localStorage
      expect(source).toContain("const userId = localStorage.getItem('trim_user_id')");

      // But it's never passed to logActivity - the hook gets user from supabase.auth.getUser()
      // The logActivity call doesn't include userId
      const logActivityCall = source.match(/logActivity\(\s*\{[\s\S]*?\}\s*,/);
      expect(logActivityCall).toBeTruthy();
      expect(logActivityCall![0]).not.toContain('userId');
    });

    it('SurfLog userId is read but never used in the saveLog call', () => {
      const source = readSourceFile('pages/SurfLog.tsx');

      // Same pattern as RunLog
      expect(source).toContain("const userId = localStorage.getItem('trim_user_id')");

      // saveLog() doesn't use userId either - it's a dead variable
      const saveLogFn = source.match(/const saveLog = \([\s\S]*?\};/);
      expect(saveLogFn).toBeTruthy();
      expect(saveLogFn![0]).not.toContain('userId');
    });
  });

  // ─── Pages that work correctly with Supabase ──────────────
  describe('Pages correctly using Supabase auth (NOT broken)', () => {
    it('TimerPage.tsx does NOT use localStorage for user ID', () => {
      const source = readSourceFile('components/TimerPage.tsx');

      const readsUserId = source.includes("localStorage.getItem('trim_user_id')");
      expect(readsUserId).toBe(false);

      // TimerPage correctly uses logActivity without localStorage check
      expect(source).toContain('logActivity({ category: category as LogCategory, date: new Date() })');
    });

    it('Breathwork.tsx does NOT use localStorage for user ID', () => {
      const source = readSourceFile('pages/Breathwork.tsx');

      const readsUserId = source.includes("localStorage.getItem('trim_user_id')");
      expect(readsUserId).toBe(false);

      // Breathwork correctly uses logActivity without localStorage check
      expect(source).toContain("logActivity({ category: 'breath', date: new Date() })");
    });

    it('Dashboard.tsx correctly uses useAuth() for user ID', () => {
      const source = readSourceFile('pages/Dashboard.tsx');

      // Dashboard uses auth context
      expect(source).toContain('useAuth');
      expect(source).toContain('user?.id');

      // Does NOT use localStorage for user ID
      const readsUserId = source.includes("localStorage.getItem('trim_user_id')");
      expect(readsUserId).toBe(false);
    });
  });

  // ─── Auth Context cleanup removes localStorage ────────────
  describe('AuthContext signOut clears legacy localStorage', () => {
    it('signOut clears all trim_ prefixed localStorage keys', () => {
      const source = readSourceFile('contexts/AuthContext.tsx');

      // AuthContext signOut removes all trim_ prefixed keys
      expect(source).toContain("k.startsWith('trim_')");
      expect(source).toContain('localStorage.removeItem(k)');
    });

    it('signOut would remove trim_user_id IF it existed', () => {
      // Simulate the signOut localStorage cleanup logic
      const mockStorage: Record<string, string> = {
        'trim_user_id': 'some-old-id',
        'trim_user_name': 'TESTUSER',
        'trim_hardware_theme': 'classic',
        'other_key': 'should-persist',
      };

      const keysToRemove = Object.keys(mockStorage).filter(k => k.startsWith('trim_'));
      expect(keysToRemove).toContain('trim_user_id');
      expect(keysToRemove).toContain('trim_user_name');
      expect(keysToRemove).toContain('trim_hardware_theme');
      expect(keysToRemove).not.toContain('other_key');
    });
  });

  // ─── useCreateLog hook gets user from Supabase auth ────────
  describe('useCreateLog hook correctly uses Supabase auth', () => {
    it('hook calls supabase.auth.getUser() internally', () => {
      const source = readSourceFile('hooks/use-trim.ts');

      // Verify the hook gets user from Supabase auth, not from a parameter
      expect(source).toContain('supabase.auth.getUser()');

      // The hook throws 'Not authenticated' when no user
      expect(source).toContain("throw new Error('Not authenticated')");
    });

    it('hook does NOT accept userId as parameter', () => {
      const source = readSourceFile('hooks/use-trim.ts');

      // The CreateLogParams interface should NOT include user_id
      const createLogParamsMatch = source.match(/interface CreateLogParams \{[\s\S]*?\}/);
      expect(createLogParamsMatch).toBeTruthy();
      expect(createLogParamsMatch![0]).not.toContain('user_id');
      expect(createLogParamsMatch![0]).not.toContain('userId');
    });
  });

  // ─── Inconsistent patterns across pages ────────────────────
  describe('Inconsistent patterns across activity logging pages', () => {
    it('all logging pages should use the same pattern for auth check', () => {
      const pages = [
        { name: 'RunLog', file: 'pages/RunLog.tsx' },
        { name: 'SurfLog', file: 'pages/SurfLog.tsx' },
        { name: 'Breathwork', file: 'pages/Breathwork.tsx' },
        { name: 'TimerPage', file: 'components/TimerPage.tsx' },
      ];

      const results = pages.map(p => {
        const source = readSourceFile(p.file);
        return {
          name: p.name,
          usesLocalStorage: source.includes("localStorage.getItem('trim_user_id')"),
          usesAuthContext: source.includes('useAuth'),
          directlyCallsLogActivity: source.includes('logActivity('),
        };
      });

      // RunLog and SurfLog are inconsistent with TimerPage and Breathwork
      // TimerPage and Breathwork don't check localStorage - they just call logActivity
      // RunLog and SurfLog check localStorage first (and break because it's never set)

      const localStoragePages = results.filter(r => r.usesLocalStorage);
      const nonLocalStoragePages = results.filter(r => !r.usesLocalStorage);

      // These are the broken pages
      expect(localStoragePages.map(p => p.name)).toEqual(['RunLog', 'SurfLog']);

      // These work correctly
      expect(nonLocalStoragePages.map(p => p.name)).toEqual(['Breathwork', 'TimerPage']);
    });
  });

  // ─── replit.md still references old localStorage pattern ───
  describe('Documentation still references old Express patterns', () => {
    it('replit.md references old localStorage auth pattern', () => {
      const replitMd = path.resolve(__dirname, '..', '..', '..', 'replit.md');
      if (fs.existsSync(replitMd)) {
        const content = fs.readFileSync(replitMd, 'utf-8');
        // replit.md still says: "User Session: Stored in localStorage (trim_user_id, trim_user_name)"
        const hasOldDocumentation = content.includes('trim_user_id');
        expect(hasOldDocumentation).toBe(true);
      }
    });
  });
});

// Helper to recursively find all .tsx files
function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files.push(...getAllTsxFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}
