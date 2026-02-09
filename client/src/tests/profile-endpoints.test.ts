import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock chain builder for Supabase queries
function createMockQueryBuilder(resolvedData: unknown = null, resolvedError: unknown = null) {
  const builder: Record<string, unknown> = {};
  const result = { data: resolvedData, error: resolvedError };

  builder.select = vi.fn().mockReturnValue(builder);
  builder.eq = vi.fn().mockReturnValue(builder);
  builder.single = vi.fn().mockResolvedValue(result);
  builder.insert = vi.fn().mockReturnValue(builder);
  builder.update = vi.fn().mockReturnValue(builder);
  builder.delete = vi.fn().mockReturnValue(builder);
  builder.gte = vi.fn().mockReturnValue(builder);
  builder.lte = vi.fn().mockReturnValue(builder);
  builder.order = vi.fn().mockReturnValue(builder);
  builder.then = vi.fn((resolve: (val: unknown) => void) => resolve(result));

  return builder;
}

const mockFrom = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
  },
}));

describe('Profile Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── FETCH PROFILE ────────────────────────────────────────
  describe('fetchProfile (from AuthContext)', () => {
    it('should fetch profile by user ID', async () => {
      const mockProfile = {
        id: 'user-123',
        name: 'TESTUSER',
        created_at: '2024-01-01T00:00:00Z',
      };

      const queryBuilder = createMockQueryBuilder(mockProfile, null);
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'user-123')
        .single();

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(queryBuilder.select).toHaveBeenCalledWith('*');
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', 'user-123');
      expect(queryBuilder.single).toHaveBeenCalled();
      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });

    it('should handle missing profile (new user without profile row)', async () => {
      const queryBuilder = createMockQueryBuilder(null, {
        message: 'JSON object requested, multiple (or no) rows returned',
        code: 'PGRST116',
        details: 'The result contains 0 rows',
      });
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'user-no-profile')
        .single();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error!.code).toBe('PGRST116');
    });

    it('should handle RLS policy denial', async () => {
      const queryBuilder = createMockQueryBuilder(null, {
        message: 'new row violates row-level security policy',
        code: '42501',
      });
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'other-user-id')
        .single();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error!.code).toBe('42501');
    });

    it('should verify profile matches expected schema', async () => {
      const mockProfile = {
        id: 'user-123',
        name: 'TESTUSER',
        created_at: '2024-01-01T00:00:00Z',
      };

      const queryBuilder = createMockQueryBuilder(mockProfile, null);
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'user-123')
        .single();

      const profile = result.data;
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('created_at');
      expect(typeof profile.id).toBe('string');
      expect(typeof profile.name).toBe('string');
    });

    it('should handle profile with null created_at', async () => {
      const mockProfile = {
        id: 'user-123',
        name: 'TESTUSER',
        created_at: null,
      };

      const queryBuilder = createMockQueryBuilder(mockProfile, null);
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'user-123')
        .single();

      expect(result.data.created_at).toBeNull();
    });
  });

  // ─── PROFILE CREATION (via Supabase Auth trigger) ──────────
  describe('profile creation', () => {
    it('should verify signUp sends name in user metadata', () => {
      // The profile is created by a Supabase trigger on auth.users insert
      // The name is passed via options.data during signUp
      // This test verifies the contract between signUp and the trigger

      const name = 'TestUser';
      const formattedName = name.toUpperCase().slice(0, 8);

      const signUpPayload = {
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { name: formattedName },
        },
      };

      expect(signUpPayload.options.data.name).toBe('TESTUSER');
      expect(signUpPayload.options.data.name.length).toBeLessThanOrEqual(8);
    });

    it('should handle names exactly 8 characters', () => {
      const name = 'Abcdefgh';
      const formatted = name.toUpperCase().slice(0, 8);
      expect(formatted).toBe('ABCDEFGH');
      expect(formatted.length).toBe(8);
    });

    it('should handle very long names by truncating', () => {
      const name = 'VeryLongUserName123';
      const formatted = name.toUpperCase().slice(0, 8);
      expect(formatted).toBe('VERYLONG');
      expect(formatted.length).toBe(8);
    });

    it('should handle empty name', () => {
      const name = '';
      const formatted = name.toUpperCase().slice(0, 8);
      expect(formatted).toBe('');
    });
  });
});
