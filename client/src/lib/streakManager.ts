import { startOfWeek, format, differenceInCalendarWeeks } from 'date-fns';

const STREAK_KEY = 'trim_streak_count';
const STREAK_WEEK_KEY = 'trim_streak_week';
const STREAK_CELEBRATED_KEY = 'trim_streak_celebrated';
const MILESTONES_KEY = 'trim_milestones';
const MASTERY_COUNT_KEY = 'trim_mastery_total';
const GBC_UNLOCKED_KEY = 'trim_gbc_unlocked';
const GBC_ANNOUNCED_KEY = 'trim_gbc_announced';
const GOLD_ANNOUNCED_KEY = 'trim_gold_announced_session';
const LIGHTNING_UNLOCKED_KEY = 'trim_lightning_unlocked';
const LIGHTNING_ANNOUNCED_KEY = 'trim_lightning_announced';
const LIGHTNING_ANNOUNCED_SESSION_KEY = 'trim_lightning_announced_session';

export interface Milestone {
  date: string;
  achievement: string;
  status: string;
  weekId: string;
}

export type EvolutionTier = 'NONE' | 'GBC_UNLOCK' | 'GOLD_UNLOCK' | 'LIGHTNING_UNLOCK';

function getCurrentWeekId(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

function getWeekDiff(weekIdA: string, weekIdB: string): number {
  return differenceInCalendarWeeks(new Date(weekIdA), new Date(weekIdB), { weekStartsOn: 1 });
}

export function getStreak(): number {
  const weekId = getCurrentWeekId();
  const savedWeek = localStorage.getItem(STREAK_WEEK_KEY);

  if (!savedWeek) return 0;

  const diff = getWeekDiff(weekId, savedWeek);

  if (diff > 1) {
    localStorage.setItem(STREAK_KEY, '0');
    localStorage.removeItem(STREAK_WEEK_KEY);
    return 0;
  }

  return parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
}

export function getMilestones(): Milestone[] {
  try {
    return JSON.parse(localStorage.getItem(MILESTONES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getTotalMastery(): number {
  return parseInt(localStorage.getItem(MASTERY_COUNT_KEY) || '0', 10);
}

export function getGoldWeekIds(): Set<string> {
  const milestones = getMilestones();
  return new Set(milestones.filter(m => m.achievement === 'GOLD_STATUS').map(m => m.weekId));
}

export function hasEverReachedGold(): boolean {
  return getMilestones().some(m => m.achievement === 'GOLD_STATUS');
}

export function isGbcUnlocked(): boolean {
  return localStorage.getItem(GBC_UNLOCKED_KEY) === 'true';
}

export function setGbcUnlocked() {
  localStorage.setItem(GBC_UNLOCKED_KEY, 'true');
}

export function isGbcAnnounced(): boolean {
  return localStorage.getItem(GBC_ANNOUNCED_KEY) === 'true';
}

export function setGbcAnnounced() {
  localStorage.setItem(GBC_ANNOUNCED_KEY, 'true');
}

export function isGoldAnnouncedThisSession(): boolean {
  return sessionStorage.getItem(GOLD_ANNOUNCED_KEY) === 'true';
}

export function setGoldAnnouncedThisSession() {
  sessionStorage.setItem(GOLD_ANNOUNCED_KEY, 'true');
}

export function isLightningUnlocked(): boolean {
  return localStorage.getItem(LIGHTNING_UNLOCKED_KEY) === 'true';
}

export function setLightningUnlocked() {
  localStorage.setItem(LIGHTNING_UNLOCKED_KEY, 'true');
}

export function isLightningAnnounced(): boolean {
  return localStorage.getItem(LIGHTNING_ANNOUNCED_KEY) === 'true';
}

export function setLightningAnnounced() {
  localStorage.setItem(LIGHTNING_ANNOUNCED_KEY, 'true');
}

export function isLightningAnnouncedThisSession(): boolean {
  return sessionStorage.getItem(LIGHTNING_ANNOUNCED_SESSION_KEY) === 'true';
}

export function setLightningAnnouncedThisSession() {
  sessionStorage.setItem(LIGHTNING_ANNOUNCED_SESSION_KEY, 'true');
}

export function getEvolutionTier(): EvolutionTier {
  const streak = getStreak();

  // 5+ week streak: Lightning Edition unlock
  if (streak >= 5 && !isLightningAnnouncedThisSession()) {
    return 'LIGHTNING_UNLOCK';
  }

  // 2+ week streak: Gold Edition unlock (if GBC already announced)
  if (streak >= 2 && !isGoldAnnouncedThisSession()) {
    if (!isGbcAnnounced()) {
      return 'GBC_UNLOCK';
    }
    return 'GOLD_UNLOCK';
  }

  // 1+ week streak: GBC (Color) unlock
  if (streak >= 1 && !isGbcAnnounced()) {
    return 'GBC_UNLOCK';
  }

  return 'NONE';
}

export function logEvolutionEvent(achievement: 'GBC_UNLOCK' | 'GOLD_UNLOCK' | 'LIGHTNING_UNLOCK') {
  const milestones = getMilestones();
  const weekId = getCurrentWeekId();

  const alreadyLogged = milestones.some(
    m => m.weekId === weekId && m.achievement === achievement
  );
  if (alreadyLogged) return;

  milestones.push({
    date: new Date().toISOString(),
    achievement,
    status: achievement === 'GBC_UNLOCK' ? 'HARDWARE EVOLVED' : achievement === 'LIGHTNING_UNLOCK' ? 'STORM ACTIVATED' : 'GOLD ACTIVATED',
    weekId,
  });
  localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
}

function logMilestone(weekId: string) {
  const milestones = getMilestones();
  const alreadyLogged = milestones.some(m => m.weekId === weekId && m.achievement === 'GOLD_STATUS');
  if (alreadyLogged) return;

  milestones.push({
    date: new Date().toISOString(),
    achievement: 'GOLD_STATUS',
    status: 'MASTERED',
    weekId,
  });
  localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
}

function incrementMastery() {
  const current = getTotalMastery();
  localStorage.setItem(MASTERY_COUNT_KEY, String(current + 1));
}

export function checkAndUpdateStreak(strengthCount: number, runCount: number): {
  streak: number;
  justCompleted: boolean;
} {
  const weekId = getCurrentWeekId();
  const protocolMet = strengthCount >= 4 && runCount >= 2;
  const celebratedWeek = localStorage.getItem(STREAK_CELEBRATED_KEY);
  const alreadyCelebrated = celebratedWeek === weekId;

  if (!protocolMet) {
    return { streak: getStreak(), justCompleted: false };
  }

  if (alreadyCelebrated) {
    return { streak: getStreak(), justCompleted: false };
  }

  const savedWeek = localStorage.getItem(STREAK_WEEK_KEY);
  let currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

  if (savedWeek) {
    const diff = getWeekDiff(weekId, savedWeek);
    if (diff > 1) {
      currentStreak = 0;
    }
  }

  currentStreak += 1;
  localStorage.setItem(STREAK_KEY, String(currentStreak));
  localStorage.setItem(STREAK_WEEK_KEY, weekId);
  localStorage.setItem(STREAK_CELEBRATED_KEY, weekId);

  incrementMastery();

  if (currentStreak >= 2) {
    logMilestone(weekId);
  }

  return { streak: currentStreak, justCompleted: true };
}

export function isProtocolComplete(strengthCount: number, runCount: number): boolean {
  return strengthCount >= 4 && runCount >= 2;
}
