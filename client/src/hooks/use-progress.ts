import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format, startOfWeek } from "date-fns";
import type { UserProgress, UserProgressUpdate, MilestoneInsert, Achievement } from "@/types/supabase";

// localStorage keys for caching
const CACHE_KEYS = {
  STREAK_COUNT: 'trim_streak_count',
  STREAK_WEEK: 'trim_streak_week',
  GBC_UNLOCKED: 'trim_gbc_unlocked',
  GOLD_UNLOCKED: 'trim_gold_unlocked',
  LIGHTNING_UNLOCKED: 'trim_lightning_unlocked',
  TOTAL_MASTERY: 'trim_mastery_total',
} as const;

// Session storage for "already shown this session" flags
const SESSION_KEYS = {
  GBC_ANNOUNCED: 'trim_gbc_announced_session',
  GOLD_ANNOUNCED: 'trim_gold_announced_session',
  LIGHTNING_ANNOUNCED: 'trim_lightning_announced_session',
} as const;

export type EvolutionTier = 'NONE' | 'GBC_UNLOCK' | 'GOLD_UNLOCK' | 'LIGHTNING_UNLOCK';

// === CACHE HELPERS ===

function cacheProgress(progress: UserProgress): void {
  localStorage.setItem(CACHE_KEYS.STREAK_COUNT, String(progress.streak_count));
  if (progress.streak_week) {
    localStorage.setItem(CACHE_KEYS.STREAK_WEEK, progress.streak_week);
  }
  localStorage.setItem(CACHE_KEYS.GBC_UNLOCKED, progress.gbc_unlocked_at ? 'true' : 'false');
  localStorage.setItem(CACHE_KEYS.GOLD_UNLOCKED, progress.gold_unlocked_at ? 'true' : 'false');
  localStorage.setItem(CACHE_KEYS.LIGHTNING_UNLOCKED, progress.lightning_unlocked_at ? 'true' : 'false');
  localStorage.setItem(CACHE_KEYS.TOTAL_MASTERY, String(progress.total_mastery));
}

function getCachedProgress(): Partial<UserProgress> | null {
  const streakCount = localStorage.getItem(CACHE_KEYS.STREAK_COUNT);
  if (streakCount === null) return null;
  
  return {
    streak_count: parseInt(streakCount, 10),
    streak_week: localStorage.getItem(CACHE_KEYS.STREAK_WEEK),
    gbc_unlocked_at: localStorage.getItem(CACHE_KEYS.GBC_UNLOCKED) === 'true' ? 'cached' : null,
    gold_unlocked_at: localStorage.getItem(CACHE_KEYS.GOLD_UNLOCKED) === 'true' ? 'cached' : null,
    lightning_unlocked_at: localStorage.getItem(CACHE_KEYS.LIGHTNING_UNLOCKED) === 'true' ? 'cached' : null,
    total_mastery: parseInt(localStorage.getItem(CACHE_KEYS.TOTAL_MASTERY) || '0', 10),
  };
}

// Session-based "announced this session" checks
export function isGbcAnnouncedThisSession(): boolean {
  return sessionStorage.getItem(SESSION_KEYS.GBC_ANNOUNCED) === 'true';
}

export function setGbcAnnouncedThisSession(): void {
  sessionStorage.setItem(SESSION_KEYS.GBC_ANNOUNCED, 'true');
}

export function isGoldAnnouncedThisSession(): boolean {
  return sessionStorage.getItem(SESSION_KEYS.GOLD_ANNOUNCED) === 'true';
}

export function setGoldAnnouncedThisSession(): void {
  sessionStorage.setItem(SESSION_KEYS.GOLD_ANNOUNCED, 'true');
}

export function isLightningAnnouncedThisSession(): boolean {
  return sessionStorage.getItem(SESSION_KEYS.LIGHTNING_ANNOUNCED) === 'true';
}

export function setLightningAnnouncedThisSession(): void {
  sessionStorage.setItem(SESSION_KEYS.LIGHTNING_ANNOUNCED, 'true');
}

// === USER PROGRESS HOOK ===

export function useUserProgress(userId: string | null) {
  return useQuery({
    queryKey: ['user-progress', userId],
    queryFn: async (): Promise<UserProgress | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no row exists, create one
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('user_progress')
            .insert({ user_id: userId })
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating user progress:', insertError);
            throw insertError;
          }
          
          return newData as UserProgress;
        }
        
        console.error('Error fetching user progress:', error);
        throw error;
      }

      // Cache to localStorage
      if (data) {
        cacheProgress(data as UserProgress);
      }

      return data as UserProgress;
    },
    enabled: !!userId,
    // Use cached data as placeholder
    placeholderData: () => {
      const cached = getCachedProgress();
      if (cached && userId) {
        return { user_id: userId, ...cached } as UserProgress;
      }
      return undefined;
    },
  });
}

// === UPDATE PROGRESS MUTATION ===

interface UpdateProgressResult {
  progress: UserProgress;
  justCompleted: boolean;
  pendingEvolution: EvolutionTier;
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      strengthCount, 
      runCount 
    }: { 
      userId: string; 
      strengthCount: number; 
      runCount: number;
    }): Promise<UpdateProgressResult> => {
      const protocolMet = strengthCount >= 4 && runCount >= 2;
      const currentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      // Fetch current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current progress:', fetchError);
        throw fetchError;
      }

      const progress = currentProgress as UserProgress;
      const alreadyCompletedThisWeek = progress.streak_week === currentWeek;

      // If protocol not met or already celebrated this week, return current state
      if (!protocolMet || alreadyCompletedThisWeek) {
        return {
          progress,
          justCompleted: false,
          pendingEvolution: getPendingEvolution(progress),
        };
      }

      // Calculate new streak
      let newStreak = progress.streak_count;
      const lastWeek = progress.streak_week;
      
      if (lastWeek) {
        const lastWeekDate = new Date(lastWeek);
        const currentWeekDate = new Date(currentWeek);
        const diffWeeks = Math.round((currentWeekDate.getTime() - lastWeekDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        if (diffWeeks === 1) {
          // Consecutive week - increment streak
          newStreak += 1;
        } else if (diffWeeks > 1) {
          // Gap - reset streak
          newStreak = 1;
        }
        // diffWeeks === 0 means same week, shouldn't happen due to check above
      } else {
        // First completion ever
        newStreak = 1;
      }

      // Determine new unlocks
      const now = new Date().toISOString();
      const updates: UserProgressUpdate = {
        streak_count: newStreak,
        streak_week: currentWeek,
        total_mastery: progress.total_mastery + 1,
        updated_at: now,
      };

      // Check for new tier unlocks
      if (newStreak >= 1 && !progress.gbc_unlocked_at) {
        updates.gbc_unlocked_at = now;
      }
      if (newStreak >= 2 && !progress.gold_unlocked_at) {
        updates.gold_unlocked_at = now;
      }
      if (newStreak >= 5 && !progress.lightning_unlocked_at) {
        updates.lightning_unlocked_at = now;
      }

      // Update progress
      const { data: updatedProgress, error: updateError } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating progress:', updateError);
        throw updateError;
      }

      const newProgress = updatedProgress as UserProgress;

      // Create milestone records for any new unlocks
      const milestones: MilestoneInsert[] = [];
      
      if (newStreak >= 2) {
        milestones.push({
          user_id: userId,
          achievement: 'GOLD_STATUS',
          week_id: currentWeek,
        });
      }

      // Record tier unlock milestones
      if (updates.gbc_unlocked_at) {
        milestones.push({
          user_id: userId,
          achievement: 'GBC_UNLOCK',
          week_id: currentWeek,
        });
      }
      if (updates.gold_unlocked_at) {
        milestones.push({
          user_id: userId,
          achievement: 'GOLD_UNLOCK',
          week_id: currentWeek,
        });
      }
      if (updates.lightning_unlocked_at) {
        milestones.push({
          user_id: userId,
          achievement: 'LIGHTNING_UNLOCK',
          week_id: currentWeek,
        });
      }

      if (milestones.length > 0) {
        await supabase
          .from('milestones')
          .upsert(milestones, { onConflict: 'user_id,achievement,week_id' });
      }

      // Cache to localStorage
      cacheProgress(newProgress);

      return {
        progress: newProgress,
        justCompleted: true,
        pendingEvolution: getPendingEvolution(newProgress),
      };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['user-progress', result.progress.user_id], result.progress);
    },
  });
}

// === PENDING EVOLUTION HELPER ===

function getPendingEvolution(progress: UserProgress): EvolutionTier {
  // Lightning: streak >= 5, not yet announced this session
  if (progress.lightning_unlocked_at && !isLightningAnnouncedThisSession()) {
    return 'LIGHTNING_UNLOCK';
  }

  // Gold: streak >= 2, not yet announced this session (requires GBC to be announced first)
  if (progress.gold_unlocked_at && !isGoldAnnouncedThisSession()) {
    if (!progress.gbc_unlocked_at || isGbcAnnouncedThisSession()) {
      return 'GOLD_UNLOCK';
    }
    // GBC not yet announced, show that first
    return 'GBC_UNLOCK';
  }

  // GBC: streak >= 1, not yet announced this session
  if (progress.gbc_unlocked_at && !isGbcAnnouncedThisSession()) {
    return 'GBC_UNLOCK';
  }

  return 'NONE';
}

// === STREAK SYNC HOOK ===

interface StreakSyncResult {
  streak: number;
  justCompleted: boolean;
  pendingEvolution: EvolutionTier;
}

export function useStreakSync(
  userId: string | null,
  strengthCount: number,
  runCount: number,
  onEvolutionReady?: (tier: EvolutionTier) => void
): StreakSyncResult {
  const { data: progress } = useUserProgress(userId);
  const { mutate: updateProgress } = useUpdateProgress();
  const lastCheckedRef = useRef<string>('');
  const pendingEvolutionRef = useRef<EvolutionTier>('NONE');

  // Check and update streak when stats change
  useEffect(() => {
    if (!userId || !progress) return;

    const statsKey = `${strengthCount}-${runCount}`;
    if (lastCheckedRef.current === statsKey) return;
    lastCheckedRef.current = statsKey;

    updateProgress(
      { userId, strengthCount, runCount },
      {
        onSuccess: (result) => {
          pendingEvolutionRef.current = result.pendingEvolution;
          
          if (result.pendingEvolution !== 'NONE' && onEvolutionReady) {
            onEvolutionReady(result.pendingEvolution);
          }
          
          // Dispatch event for other components
          window.dispatchEvent(new CustomEvent('streak-update', { 
            detail: { 
              streak: result.progress.streak_count,
              justCompleted: result.justCompleted,
              pendingEvolution: result.pendingEvolution,
            }
          }));
        },
      }
    );
  }, [userId, strengthCount, runCount, progress, updateProgress, onEvolutionReady]);

  return {
    streak: progress?.streak_count ?? 0,
    justCompleted: false, // This is transient, handled via callback
    pendingEvolution: pendingEvolutionRef.current,
  };
}

// === MARK EVOLUTION SEEN ===

export function useMarkEvolutionSeen() {
  const queryClient = useQueryClient();

  return useCallback((tier: EvolutionTier) => {
    switch (tier) {
      case 'GBC_UNLOCK':
        setGbcAnnouncedThisSession();
        break;
      case 'GOLD_UNLOCK':
        setGoldAnnouncedThisSession();
        break;
      case 'LIGHTNING_UNLOCK':
        setLightningAnnouncedThisSession();
        break;
    }
    
    // Invalidate to refresh pending evolution state
    queryClient.invalidateQueries({ queryKey: ['user-progress'] });
  }, [queryClient]);
}

// === MILESTONES HOOK ===

export function useMilestones(userId: string | null) {
  return useQuery({
    queryKey: ['milestones', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });
}
