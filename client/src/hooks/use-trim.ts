import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, startOfWeek, endOfWeek } from "date-fns";
import type { LogCategory, Log, Json } from "@/types/supabase";

// === WEEKLY STATS HOOK ===

interface WeeklyStats {
  strengthCount: number;
  runCount: number;
  habits: {
    date: string;
    strength: boolean;
    run: boolean;
    yoga: boolean;
    surf: boolean;
    maint: boolean;
    breath: boolean;
  }[];
}

export function useWeeklyStats(userId: string | null) {
  return useQuery({
    queryKey: ['weekly-stats', userId],
    queryFn: async (): Promise<WeeklyStats | null> => {
      if (!userId) return null;

      // Calculate start (Monday) and end (Sunday) of current week
      const now = new Date();
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      
      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      const { data: logs, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('Error fetching weekly stats:', error);
        throw error;
      }

      // Cast logs to our Log type
      const typedLogs = (logs || []) as Log[];

      // Process logs into required format
      const strengthCount = typedLogs.filter(l => l.category === 'strength').length;
      const runCount = typedLogs.filter(l => l.category === 'run').length;

      // Build habits map
      const habitsMap = new Map<string, { strength: boolean, run: boolean, yoga: boolean, surf: boolean, maint: boolean, breath: boolean }>();
      
      // Initialize all days of week
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        habitsMap.set(dateStr, { strength: false, run: false, yoga: false, surf: false, maint: false, breath: false });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      typedLogs.forEach(log => {
        const dayHabits = habitsMap.get(log.date);
        if (dayHabits) {
          if (log.category === 'strength') dayHabits.strength = true;
          if (log.category === 'run') dayHabits.run = true;
          if (log.category === 'yoga') dayHabits.yoga = true;
          if (log.category === 'surf') dayHabits.surf = true;
          if (log.category === 'maint') dayHabits.maint = true;
          if (log.category === 'breath') dayHabits.breath = true;
        }
      });

      const habits = Array.from(habitsMap.entries()).map(([date, status]) => ({
        date,
        ...status
      })).sort((a, b) => a.date.localeCompare(b.date));

      return {
        strengthCount,
        runCount,
        habits
      };
    },
    enabled: !!userId,
  });
}

// === ALL LOGS HOOK (Archive) ===

export function useAllLogs(userId: string | null) {
  return useQuery({
    queryKey: ['all-logs', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all logs:', error);
        throw error;
      }

      return (data || []) as Log[];
    },
    enabled: !!userId,
  });
}

// === CREATE LOG HOOK ===

interface CreateLogParams {
  category: LogCategory;
  date: Date;
  metadata?: Record<string, unknown>;
}

export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, date, metadata }: CreateLogParams) => {
      // Get current session (cached, no network request)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const formattedDate = format(date, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from('logs')
        .insert({
          user_id: session.user.id,
          category,
          date: formattedDate,
          metadata: (metadata || null) as Json,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating log:', error);
        throw error;
      }

      return data as Log;
    },
    onSuccess: () => {
      // Invalidate weekly stats to refresh UI
      queryClient.invalidateQueries({ queryKey: ['weekly-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-logs'] });
    },
  });
}

// === DEPRECATED: These are no longer needed with Supabase Auth ===

/** @deprecated Use Supabase Auth instead */
export function useCreateUser() {
  return useMutation({
    mutationFn: async (_name: string) => {
      throw new Error('useCreateUser is deprecated. Use Supabase Auth instead.');
    },
  });
}
