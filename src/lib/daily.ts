import { DAILY_ORDER } from '../data/daily-order';

const HISTORY_KEY = 'bigo:daily-history';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// UTC YYYY-MM-DD. UTC keeps the daily flip predictable across timezones -
// everyone gets the same problem, and the boundary doesn't shift if the
// device clock is in a weird zone.
export function dateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

// Whole UTC days since the Unix epoch. Used as the deterministic step into
// DAILY_ORDER, which guarantees consecutive days are different problems
// (each day = next entry, cycle at the end).
function daysSinceEpoch(date: Date): number {
  const utcMs = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return Math.floor(utcMs / MS_PER_DAY);
}

export function getDailyProblemId(date: Date = new Date()): string {
  const idx = daysSinceEpoch(date) % DAILY_ORDER.length;
  return DAILY_ORDER[idx]!;
}

type History = Record<string, string>;

function loadHistory(): History {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as History)
      : {};
  } catch {
    return {};
  }
}

function saveHistory(h: History): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {
    // localStorage may throw in private mode / quota - ignore, daily is
    // best-effort.
  }
}

export function isTodaySolved(date: Date = new Date()): boolean {
  return loadHistory()[dateKey(date)] !== undefined;
}

export function recordDailySolve(
  problemId: string,
  date: Date = new Date()
): void {
  const h = loadHistory();
  h[dateKey(date)] = problemId;
  saveHistory(h);
}

// True when yesterday's daily was solved - i.e., solving today would extend
// an existing streak rather than start a new one. False if the most recent
// solve was 2+ days ago (the streak is broken and solving today starts over).
export function hasActiveStreak(date: Date = new Date()): boolean {
  const yesterday = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1)
  );
  return loadHistory()[dateKey(yesterday)] !== undefined;
}

// Length of the streak the user can currently extend. If today is solved,
// counts today + consecutive prior days. If today isn't solved yet but
// yesterday is, returns the chain ending at yesterday (which solving today
// would extend). If both are missing, the streak is 0.
export function getCurrentStreak(date: Date = new Date()): number {
  const h = loadHistory();
  let cursor = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  if (h[dateKey(cursor)] === undefined) {
    // Today not solved - fall back to yesterday so we count the chain the
    // user is still in the position to extend.
    cursor = new Date(
      Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() - 1
      )
    );
  }
  let streak = 0;
  while (h[dateKey(cursor)] !== undefined) {
    streak++;
    cursor = new Date(
      Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() - 1
      )
    );
  }
  return streak;
}
