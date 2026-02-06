import { startOfWeek, format, differenceInCalendarWeeks } from 'date-fns';

const STREAK_KEY = 'trim_streak_count';
const STREAK_WEEK_KEY = 'trim_streak_week';
const STREAK_CELEBRATED_KEY = 'trim_streak_celebrated';

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

  return { streak: currentStreak, justCompleted: true };
}

export function isProtocolComplete(strengthCount: number, runCount: number): boolean {
  return strengthCount >= 4 && runCount >= 2;
}
