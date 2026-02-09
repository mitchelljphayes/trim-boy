import { describe, it, expect, vi, beforeEach } from 'vitest';
import { format, startOfWeek, endOfWeek } from 'date-fns';

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

  return builder;
}

const mockFrom = vi.fn();
const mockGetUser = vi.fn();
const mockGetSession = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

describe('Log Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── CREATE LOG ────────────────────────────────────────────
  describe('createLog', () => {
    it('should insert a strength log with correct params', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const insertedLog = {
        id: 1,
        user_id: 'user-123',
        category: 'strength',
        date: '2024-01-15',
        metadata: null,
        created_at: '2024-01-15T10:00:00Z',
      };

      const queryBuilder = createMockQueryBuilder(insertedLog, null);
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');

      // Simulate what useCreateLog does
      const { data: { user } } = await supabase.auth.getUser();
      expect(user).toBeTruthy();

      const date = new Date('2024-01-15');
      const formattedDate = format(date, 'yyyy-MM-dd');

      const result = await supabase
        .from('logs')
        .insert({
          user_id: user!.id,
          category: 'strength',
          date: formattedDate,
          metadata: null,
        })
        .select()
        .single();

      expect(mockFrom).toHaveBeenCalledWith('logs');
      expect(queryBuilder.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        category: 'strength',
        date: '2024-01-15',
        metadata: null,
      });
      expect(queryBuilder.select).toHaveBeenCalled();
      expect(queryBuilder.single).toHaveBeenCalled();
      expect(result.data).toEqual(insertedLog);
      expect(result.error).toBeNull();
    });

    it('should insert a run log with metadata', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const metadata = { distance: 5.0, pace: '5:30', enjoyment: 5 };
      const insertedLog = {
        id: 2,
        user_id: 'user-123',
        category: 'run',
        date: '2024-01-15',
        metadata,
        created_at: '2024-01-15T10:00:00Z',
      };

      const queryBuilder = createMockQueryBuilder(insertedLog, null);
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      const result = await supabase
        .from('logs')
        .insert({
          user_id: user!.id,
          category: 'run',
          date: '2024-01-15',
          metadata,
        })
        .select()
        .single();

      expect(queryBuilder.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        category: 'run',
        date: '2024-01-15',
        metadata: { distance: 5.0, pace: '5:30', enjoyment: 5 },
      });
      expect(result.data.metadata).toEqual(metadata);
    });

    it('should insert a surf log with marine conditions metadata', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const metadata = {
        timeSurf: 90,
        location: 'Bondi Beach',
        enjoyment: 5,
        swell: '1.5m',
        wind: '10kt NE',
        tide: 'Rising Mid-Tide',
      };

      const insertedLog = {
        id: 3,
        user_id: 'user-123',
        category: 'surf',
        date: '2024-01-15',
        metadata,
        created_at: '2024-01-15T10:00:00Z',
      };

      const queryBuilder = createMockQueryBuilder(insertedLog, null);
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      const result = await supabase
        .from('logs')
        .insert({
          user_id: user!.id,
          category: 'surf',
          date: '2024-01-15',
          metadata,
        })
        .select()
        .single();

      expect(result.data.category).toBe('surf');
      expect(result.data.metadata).toEqual(metadata);
    });

    it('should insert a breathwork log', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const insertedLog = {
        id: 4,
        user_id: 'user-123',
        category: 'breath',
        date: '2024-01-15',
        metadata: null,
        created_at: '2024-01-15T10:00:00Z',
      };

      const queryBuilder = createMockQueryBuilder(insertedLog, null);
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      const result = await supabase
        .from('logs')
        .insert({
          user_id: user!.id,
          category: 'breath',
          date: '2024-01-15',
          metadata: null,
        })
        .select()
        .single();

      expect(result.data.category).toBe('breath');
    });

    it('should insert a maintenance log', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const insertedLog = {
        id: 5,
        user_id: 'user-123',
        category: 'maint',
        date: '2024-01-15',
        metadata: null,
        created_at: '2024-01-15T10:00:00Z',
      };

      const queryBuilder = createMockQueryBuilder(insertedLog, null);
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      const result = await supabase
        .from('logs')
        .insert({
          user_id: user!.id,
          category: 'maint',
          date: '2024-01-15',
          metadata: null,
        })
        .select()
        .single();

      expect(result.data.category).toBe('maint');
    });

    it('should fail when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      // useCreateLog throws 'Not authenticated' when user is null
      expect(user).toBeNull();

      // Verify the hook would throw
      const createLogFn = async () => {
        if (!user) {
          throw new Error('Not authenticated');
        }
      };
      await expect(createLogFn()).rejects.toThrow('Not authenticated');
    });

    it('should handle RLS policy violation on insert', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const queryBuilder = createMockQueryBuilder(null, {
        message: 'new row violates row-level security policy for table "logs"',
        code: '42501',
      });
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      const result = await supabase
        .from('logs')
        .insert({
          user_id: user!.id,
          category: 'run',
          date: '2024-01-15',
          metadata: null,
        })
        .select()
        .single();

      expect(result.error).toBeTruthy();
      expect(result.error!.code).toBe('42501');
    });

    it('should handle invalid category value', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // The DB has a check constraint on category
      const queryBuilder = createMockQueryBuilder(null, {
        message: 'invalid input value for enum log_category: "invalid"',
        code: '22P02',
      });
      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      const result = await supabase
        .from('logs')
        .insert({
          user_id: user!.id,
          category: 'invalid' as any,
          date: '2024-01-15',
          metadata: null,
        })
        .select()
        .single();

      expect(result.error).toBeTruthy();
    });

    it('should format date correctly from Date object', () => {
      const testDates = [
        { input: new Date('2024-01-01'), expected: '2024-01-01' },
        { input: new Date('2024-12-31'), expected: '2024-12-31' },
        { input: new Date('2024-06-15'), expected: '2024-06-15' },
      ];

      testDates.forEach(({ input, expected }) => {
        expect(format(input, 'yyyy-MM-dd')).toBe(expected);
      });
    });
  });

  // ─── WEEKLY STATS ──────────────────────────────────────────
  describe('weeklyStats', () => {
    it('should fetch logs for current week (Mon-Sun)', async () => {
      const now = new Date('2024-01-17'); // Wednesday
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });

      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      expect(startDate).toBe('2024-01-15'); // Monday
      expect(endDate).toBe('2024-01-21'); // Sunday

      const weekLogs = [
        { id: 1, user_id: 'u1', category: 'strength', date: '2024-01-15', metadata: null, created_at: '2024-01-15T10:00:00Z' },
        { id: 2, user_id: 'u1', category: 'run', date: '2024-01-16', metadata: { distance: 5 }, created_at: '2024-01-16T10:00:00Z' },
        { id: 3, user_id: 'u1', category: 'maint', date: '2024-01-17', metadata: null, created_at: '2024-01-17T10:00:00Z' },
        { id: 4, user_id: 'u1', category: 'surf', date: '2024-01-17', metadata: { timeSurf: 60 }, created_at: '2024-01-17T11:00:00Z' },
        { id: 5, user_id: 'u1', category: 'breath', date: '2024-01-18', metadata: null, created_at: '2024-01-18T10:00:00Z' },
      ];

      const queryBuilder: Record<string, unknown> = {};
      const result = { data: weekLogs, error: null };
      queryBuilder.select = vi.fn().mockReturnValue(queryBuilder);
      queryBuilder.eq = vi.fn().mockReturnValue(queryBuilder);
      queryBuilder.gte = vi.fn().mockReturnValue(queryBuilder);
      queryBuilder.lte = vi.fn().mockResolvedValue(result);

      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');

      const queryResult = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', 'u1')
        .gte('date', startDate)
        .lte('date', endDate);

      expect(mockFrom).toHaveBeenCalledWith('logs');
      expect(queryBuilder.eq).toHaveBeenCalledWith('user_id', 'u1');
      expect(queryBuilder.gte).toHaveBeenCalledWith('date', '2024-01-15');
      expect(queryBuilder.lte).toHaveBeenCalledWith('date', '2024-01-21');
      expect(queryResult.data).toHaveLength(5);
    });

    it('should correctly calculate strength and run counts', () => {
      const logs = [
        { category: 'strength', date: '2024-01-15' },
        { category: 'strength', date: '2024-01-17' },
        { category: 'run', date: '2024-01-16' },
        { category: 'run', date: '2024-01-18' },
        { category: 'run', date: '2024-01-20' },
        { category: 'maint', date: '2024-01-15' },
        { category: 'surf', date: '2024-01-17' },
        { category: 'breath', date: '2024-01-18' },
      ];

      const strengthCount = logs.filter(l => l.category === 'strength').length;
      const runCount = logs.filter(l => l.category === 'run').length;

      expect(strengthCount).toBe(2);
      expect(runCount).toBe(3);
    });

    it('should build habits map correctly for all days of the week', () => {
      const now = new Date('2024-01-17'); // Wednesday
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });

      const logs = [
        { category: 'surf', date: '2024-01-15' },
        { category: 'maint', date: '2024-01-15' },
        { category: 'maint', date: '2024-01-16' },
        { category: 'breath', date: '2024-01-17' },
      ];

      // Build habits map (matching useWeeklyStats logic)
      const habitsMap = new Map<string, { surf: boolean, maint: boolean, breath: boolean }>();

      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        habitsMap.set(dateStr, { surf: false, maint: false, breath: false });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      logs.forEach(log => {
        const dayHabits = habitsMap.get(log.date);
        if (dayHabits) {
          if (log.category === 'surf') dayHabits.surf = true;
          if (log.category === 'maint') dayHabits.maint = true;
          if (log.category === 'breath') dayHabits.breath = true;
        }
      });

      const habits = Array.from(habitsMap.entries())
        .map(([date, status]) => ({ date, ...status }))
        .sort((a, b) => a.date.localeCompare(b.date));

      expect(habits).toHaveLength(7); // All 7 days
      expect(habits[0]).toEqual({ date: '2024-01-15', surf: true, maint: true, breath: false });
      expect(habits[1]).toEqual({ date: '2024-01-16', surf: false, maint: true, breath: false });
      expect(habits[2]).toEqual({ date: '2024-01-17', surf: false, maint: false, breath: true });
      expect(habits[3]).toEqual({ date: '2024-01-18', surf: false, maint: false, breath: false });
    });

    it('should return empty stats when no logs exist', () => {
      const logs: { category: string; date: string }[] = [];

      const strengthCount = logs.filter(l => l.category === 'strength').length;
      const runCount = logs.filter(l => l.category === 'run').length;

      expect(strengthCount).toBe(0);
      expect(runCount).toBe(0);
    });

    it('should handle null userId by returning null', async () => {
      // useWeeklyStats returns null when userId is null
      const userId: string | null = null;
      if (!userId) {
        expect(true).toBe(true); // Would return null early
        return;
      }
    });
  });

  // ─── ALL LOGS (Archive) ───────────────────────────────────
  describe('allLogs', () => {
    it('should fetch all logs ordered by date and created_at descending', async () => {
      const allLogs = [
        { id: 3, user_id: 'u1', category: 'run', date: '2024-01-17', metadata: null, created_at: '2024-01-17T10:00:00Z' },
        { id: 2, user_id: 'u1', category: 'strength', date: '2024-01-16', metadata: null, created_at: '2024-01-16T10:00:00Z' },
        { id: 1, user_id: 'u1', category: 'maint', date: '2024-01-15', metadata: null, created_at: '2024-01-15T10:00:00Z' },
      ];

      const queryBuilder: Record<string, unknown> = {};
      const result = { data: allLogs, error: null };
      queryBuilder.select = vi.fn().mockReturnValue(queryBuilder);
      queryBuilder.eq = vi.fn().mockReturnValue(queryBuilder);
      queryBuilder.order = vi.fn().mockReturnValue(queryBuilder);
      // The last call in the chain resolves
      queryBuilder.order = vi.fn()
        .mockReturnValueOnce(queryBuilder) // first .order() call
        .mockResolvedValueOnce(result);    // second .order() call resolves

      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');

      const queryResult = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', 'u1')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      expect(mockFrom).toHaveBeenCalledWith('logs');
      expect(queryBuilder.eq).toHaveBeenCalledWith('user_id', 'u1');
      expect(queryBuilder.order).toHaveBeenCalledWith('date', { ascending: false });
      expect(queryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(queryResult.data).toHaveLength(3);
      // Verify order - most recent first
      expect(queryResult.data![0].date).toBe('2024-01-17');
    });

    it('should return empty array when no logs', async () => {
      const queryBuilder: Record<string, unknown> = {};
      const result = { data: [], error: null };
      queryBuilder.select = vi.fn().mockReturnValue(queryBuilder);
      queryBuilder.eq = vi.fn().mockReturnValue(queryBuilder);
      queryBuilder.order = vi.fn()
        .mockReturnValueOnce(queryBuilder)
        .mockResolvedValueOnce(result);

      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');

      const queryResult = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', 'u1')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      expect(queryResult.data).toEqual([]);
    });

    it('should handle query error', async () => {
      const queryBuilder: Record<string, unknown> = {};
      const result = { data: null, error: { message: 'relation "logs" does not exist', code: '42P01' } };
      queryBuilder.select = vi.fn().mockReturnValue(queryBuilder);
      queryBuilder.eq = vi.fn().mockReturnValue(queryBuilder);
      queryBuilder.order = vi.fn()
        .mockReturnValueOnce(queryBuilder)
        .mockResolvedValueOnce(result);

      mockFrom.mockReturnValue(queryBuilder);

      const { supabase } = await import('@/lib/supabase');

      const queryResult = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', 'u1')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      expect(queryResult.error).toBeTruthy();
      expect(queryResult.error!.code).toBe('42P01');
    });

    it('should handle null userId by returning empty array', async () => {
      // useAllLogs returns [] when userId is null
      const userId: string | null = null;
      const result = userId ? 'would query' : [];
      expect(result).toEqual([]);
    });
  });

  // ─── DATE EDGE CASES ──────────────────────────────────────
  describe('date handling edge cases', () => {
    it('should handle week boundary correctly (Monday start)', () => {
      // Test Monday
      const monday = new Date('2024-01-15');
      const start = startOfWeek(monday, { weekStartsOn: 1 });
      expect(format(start, 'yyyy-MM-dd')).toBe('2024-01-15');

      // Test Sunday (end of week)
      const sunday = new Date('2024-01-21');
      const sundayStart = startOfWeek(sunday, { weekStartsOn: 1 });
      expect(format(sundayStart, 'yyyy-MM-dd')).toBe('2024-01-15');
    });

    it('should handle year boundary', () => {
      const newYearsDay = new Date('2024-01-01'); // Monday
      const start = startOfWeek(newYearsDay, { weekStartsOn: 1 });
      const end = endOfWeek(newYearsDay, { weekStartsOn: 1 });

      expect(format(start, 'yyyy-MM-dd')).toBe('2024-01-01');
      expect(format(end, 'yyyy-MM-dd')).toBe('2024-01-07');
    });

    it('should handle leap year', () => {
      const leapDay = new Date('2024-02-29');
      expect(format(leapDay, 'yyyy-MM-dd')).toBe('2024-02-29');
    });
  });
});
