/**
 * Streak Manager - localStorage cache layer
 * 
 * The source of truth is now Supabase (user_progress table).
 * This module provides synchronous access to cached values for:
 * - Initial page load (before React hydrates)
 * - Theme determination
 * - Offline fallback
 * 
 * The useUserProgress and useStreakSync hooks handle DB sync.
 */

import { startOfWeek, format } from 'date-fns';

// localStorage keys (synced from DB via hooks)
const CACHE_KEYS = {
  STREAK_COUNT: 'trim_streak_count',
  STREAK_WEEK: 'trim_streak_week',
  GBC_UNLOCKED: 'trim_gbc_unlocked',
  GOLD_UNLOCKED: 'trim_gold_unlocked',
  LIGHTNING_UNLOCKED: 'trim_lightning_unlocked',
  TOTAL_MASTERY: 'trim_mastery_total',
  MILESTONES: 'trim_milestones',
  // Legacy keys for migration
  GBC_ANNOUNCED: 'trim_gbc_announced',
  LIGHTNING_ANNOUNCED: 'trim_lightning_announced',
} as const;

// Session storage for "already shown this session" flags
const SESSION_KEYS = {
  GBC_ANNOUNCED: 'trim_gbc_announced_session',
  GOLD_ANNOUNCED: 'trim_gold_announced_session',
  LIGHTNING_ANNOUNCED: 'trim_lightning_announced_session',
} as const;

export interface Milestone {
  date: string;
  achievement: string;
  status: string;
  weekId: string;
}

export type EvolutionTier = 'NONE' | 'GBC_UNLOCK' | 'GOLD_UNLOCK' | 'LIGHTNING_UNLOCK';

// === CACHE READERS (synchronous, for non-React code) ===

export function getCurrentWeekId(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function getStreak(): number {
  return parseInt(localStorage.getItem(CACHE_KEYS.STREAK_COUNT) || '0', 10);
}

export function getStreakWeek(): string | null {
  return localStorage.getItem(CACHE_KEYS.STREAK_WEEK);
}

export function getTotalMastery(): number {
  return parseInt(localStorage.getItem(CACHE_KEYS.TOTAL_MASTERY) || '0', 10);
}

export function isGbcUnlocked(): boolean {
  return localStorage.getItem(CACHE_KEYS.GBC_UNLOCKED) === 'true';
}

export function isGoldUnlocked(): boolean {
  return localStorage.getItem(CACHE_KEYS.GOLD_UNLOCKED) === 'true';
}

export function isLightningUnlocked(): boolean {
  return localStorage.getItem(CACHE_KEYS.LIGHTNING_UNLOCKED) === 'true';
}

// === SESSION-BASED "ANNOUNCED THIS SESSION" ===

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

// === EVOLUTION TIER (for initial load, before hooks) ===

export function getEvolutionTier(): EvolutionTier {
  const streak = getStreak();

  // Lightning: streak >= 5, not yet announced this session
  if (streak >= 5 && isLightningUnlocked() && !isLightningAnnouncedThisSession()) {
    return 'LIGHTNING_UNLOCK';
  }

  // Gold: streak >= 2, not yet announced this session
  if (streak >= 2 && isGoldUnlocked() && !isGoldAnnouncedThisSession()) {
    if (!isGbcUnlocked() || !isGbcAnnouncedThisSession()) {
      return 'GBC_UNLOCK';
    }
    return 'GOLD_UNLOCK';
  }

  // GBC: streak >= 1, not yet announced this session
  if (streak >= 1 && isGbcUnlocked() && !isGbcAnnouncedThisSession()) {
    return 'GBC_UNLOCK';
  }

  return 'NONE';
}

// === PROTOCOL HELPERS ===

export function isProtocolComplete(strengthCount: number, runCount: number): boolean {
  return strengthCount >= 4 && runCount >= 2;
}

// === MILESTONES (from localStorage cache) ===

export function getMilestones(): Milestone[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEYS.MILESTONES) || '[]');
  } catch {
    return [];
  }
}

export function getGoldWeekIds(): Set<string> {
  const milestones = getMilestones();
  return new Set(milestones.filter(m => m.achievement === 'GOLD_STATUS').map(m => m.weekId));
}

export function hasEverReachedGold(): boolean {
  return getMilestones().some(m => m.achievement === 'GOLD_STATUS');
}

// === CACHE WRITERS (called by hooks after DB sync) ===

export function cacheStreak(count: number, week: string | null): void {
  localStorage.setItem(CACHE_KEYS.STREAK_COUNT, String(count));
  if (week) {
    localStorage.setItem(CACHE_KEYS.STREAK_WEEK, week);
  } else {
    localStorage.removeItem(CACHE_KEYS.STREAK_WEEK);
  }
}

export function cacheUnlocks(gbc: boolean, gold: boolean, lightning: boolean): void {
  localStorage.setItem(CACHE_KEYS.GBC_UNLOCKED, gbc ? 'true' : 'false');
  localStorage.setItem(CACHE_KEYS.GOLD_UNLOCKED, gold ? 'true' : 'false');
  localStorage.setItem(CACHE_KEYS.LIGHTNING_UNLOCKED, lightning ? 'true' : 'false');
}

export function cacheTotalMastery(total: number): void {
  localStorage.setItem(CACHE_KEYS.TOTAL_MASTERY, String(total));
}

export function cacheMilestones(milestones: Milestone[]): void {
  localStorage.setItem(CACHE_KEYS.MILESTONES, JSON.stringify(milestones));
}

// === LEGACY COMPATIBILITY ===

// These functions are kept for backwards compatibility during migration
// They will be called by the old code paths until fully migrated

export function setGbcUnlocked(): void {
  localStorage.setItem(CACHE_KEYS.GBC_UNLOCKED, 'true');
}

export function isGbcAnnounced(): boolean {
  return localStorage.getItem(CACHE_KEYS.GBC_ANNOUNCED) === 'true';
}

export function setGbcAnnounced(): void {
  localStorage.setItem(CACHE_KEYS.GBC_ANNOUNCED, 'true');
}

export function setLightningUnlocked(): void {
  localStorage.setItem(CACHE_KEYS.LIGHTNING_UNLOCKED, 'true');
}

export function isLightningAnnounced(): boolean {
  return localStorage.getItem(CACHE_KEYS.LIGHTNING_ANNOUNCED) === 'true';
}

export function setLightningAnnounced(): void {
  localStorage.setItem(CACHE_KEYS.LIGHTNING_ANNOUNCED, 'true');
}

export function logEvolutionEvent(achievement: 'GBC_UNLOCK' | 'GOLD_UNLOCK' | 'LIGHTNING_UNLOCK'): void {
  const milestones = getMilestones();
  const weekId = getCurrentWeekId();

  const alreadyLogged = milestones.some(
    m => m.weekId === weekId && m.achievement === achievement
  );
  if (alreadyLogged) return;

  milestones.push({
    date: new Date().toISOString(),
    achievement,
    status: achievement === 'GBC_UNLOCK' 
      ? 'HARDWARE EVOLVED' 
      : achievement === 'LIGHTNING_UNLOCK' 
        ? 'STORM ACTIVATED' 
        : 'GOLD ACTIVATED',
    weekId,
  });
  localStorage.setItem(CACHE_KEYS.MILESTONES, JSON.stringify(milestones));
}

/**
 * @deprecated Use useStreakSync hook instead
 * Kept for backwards compatibility during migration
 */
export function checkAndUpdateStreak(strengthCount: number, runCount: number): {
  streak: number;
  justCompleted: boolean;
} {
  // This is now a no-op that just returns cached values
  // The actual logic is in useStreakSync hook
  return { 
    streak: getStreak(), 
    justCompleted: false 
  };
}
