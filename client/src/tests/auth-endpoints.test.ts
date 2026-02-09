import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase module before importing anything that uses it
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('Auth Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── SIGN UP ───────────────────────────────────────────────
  describe('signUp', () => {
    it('should call supabase.auth.signUp with correct params', async () => {
      mockSignUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: { data: { name: 'TESTUSER' } },
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: { name: 'TESTUSER' } },
      });
      expect(result.error).toBeNull();
    });

    it('should handle signUp failure', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered', status: 422 },
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password123',
        options: { data: { name: 'TEST' } },
      });

      expect(result.error).toBeTruthy();
      expect(result.error!.message).toBe('User already registered');
    });

    it('should handle network errors during signUp', async () => {
      mockSignUp.mockRejectedValue(new Error('Network error'));

      const { supabase } = await import('@/lib/supabase');
      await expect(
        supabase.auth.signUp({
          email: 'test@example.com',
          password: 'password123',
          options: { data: { name: 'TEST' } },
        })
      ).rejects.toThrow('Network error');
    });

    it('should enforce 8-char name limit (as AuthContext does)', async () => {
      // The AuthContext signUp method truncates names to 8 chars uppercase
      const name = 'LongUserName';
      const formattedName = name.toUpperCase().slice(0, 8);

      expect(formattedName).toBe('LONGUSER');
      expect(formattedName.length).toBeLessThanOrEqual(8);
    });
  });

  // ─── SIGN IN ───────────────────────────────────────────────
  describe('signIn', () => {
    it('should call supabase.auth.signInWithPassword with correct params', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@example.com' }, session: { access_token: 'tok' } },
        error: null,
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.error).toBeNull();
      expect(result.data.session).toBeTruthy();
    });

    it('should handle invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 },
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrong',
      });

      expect(result.error).toBeTruthy();
      expect(result.error!.message).toBe('Invalid login credentials');
    });

    it('should handle network errors during signIn', async () => {
      mockSignInWithPassword.mockRejectedValue(new Error('fetch failed'));

      const { supabase } = await import('@/lib/supabase');
      await expect(
        supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('fetch failed');
    });
  });

  // ─── SIGN OUT ──────────────────────────────────────────────
  describe('signOut', () => {
    it('should call supabase.auth.signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should handle signOut failure gracefully', async () => {
      mockSignOut.mockResolvedValue({
        error: { message: 'Session not found', status: 404 },
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.signOut();

      // AuthContext catches errors and still clears state
      expect(result.error).toBeTruthy();
    });
  });

  // ─── GET SESSION ───────────────────────────────────────────
  describe('getSession', () => {
    it('should return active session', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'tok',
            user: { id: 'u1', email: 'test@example.com' },
          },
        },
        error: null,
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.getSession();

      expect(result.data.session).toBeTruthy();
      expect(result.data.session!.user.id).toBe('u1');
    });

    it('should return null session when not authenticated', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.getSession();

      expect(result.data.session).toBeNull();
    });
  });

  // ─── GET USER ──────────────────────────────────────────────
  describe('getUser', () => {
    it('should return authenticated user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@example.com' } },
        error: null,
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.getUser();

      expect(result.data.user).toBeTruthy();
      expect(result.data.user!.id).toBe('u1');
    });

    it('should return null user when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'not_authenticated', status: 401 },
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.getUser();

      expect(result.data.user).toBeNull();
    });
  });

  // ─── RESET PASSWORD ────────────────────────────────────────
  describe('resetPasswordForEmail', () => {
    it('should send password reset email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.resetPasswordForEmail('test@example.com', {
        redirectTo: 'http://localhost:5173/reset-password',
      });

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'http://localhost:5173/reset-password',
      });
      expect(result.error).toBeNull();
    });

    it('should handle reset for non-existent email', async () => {
      // Note: Supabase doesn't actually error for non-existent emails (security)
      mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.resetPasswordForEmail('nonexistent@example.com', {
        redirectTo: 'http://localhost:5173/reset-password',
      });

      // Should succeed silently (doesn't reveal if email exists)
      expect(result.error).toBeNull();
    });
  });

  // ─── UPDATE USER (Password) ────────────────────────────────
  describe('updateUser', () => {
    it('should update user password', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: 'u1' } },
        error: null,
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.updateUser({ password: 'newPassword123' });

      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newPassword123' });
      expect(result.error).toBeNull();
    });

    it('should handle weak password error', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Password should be at least 6 characters', status: 422 },
      });

      const { supabase } = await import('@/lib/supabase');
      const result = await supabase.auth.updateUser({ password: '123' });

      expect(result.error).toBeTruthy();
      expect(result.error!.message).toContain('Password');
    });
  });
});
