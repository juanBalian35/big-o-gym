import { problems } from '../data/problems';
import type { Problem } from '../types/problem';

const PATH_PREFIX = '/p/';
const HASH_PREFIX = '#/p/';
const RACE_PREFIX = '/race';

export function parseChallengeId(): string | null {
  if (typeof window === 'undefined') return null;

  // Real URL: /p/<id>
  const path = window.location.pathname;
  if (path.startsWith(PATH_PREFIX)) {
    const id = path.slice(PATH_PREFIX.length).replace(/\/$/, '');
    if (id) return id;
  }

  // Legacy hash form (kept so old shared links still work).
  const hash = window.location.hash;
  if (hash.startsWith(HASH_PREFIX)) {
    const id = hash.slice(HASH_PREFIX.length);
    if (id) return id;
  }

  return null;
}

export function findChallengeProblem(): Problem | null {
  const id = parseChallengeId();
  if (!id) return null;
  return problems.find((p) => p.id === id) ?? null;
}

export function buildShareUrl(problemId: string): string {
  if (typeof window === 'undefined') return `/p/${problemId}`;
  return `${window.location.origin}/p/${problemId}`;
}

export function clearChallengeHash(): void {
  // Misnamed for back-compat; clears whatever URL signal put us in
  // challenge mode (path or hash).
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', '/');
}

export type RaceRoute =
  | { kind: 'list' }
  | { kind: 'set'; setId: string; vsTimeMs: number | null };

export function parseRaceRoute(): RaceRoute | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === RACE_PREFIX) return { kind: 'list' };
  if (path.startsWith(`${RACE_PREFIX}/`)) {
    const setId = path.slice(RACE_PREFIX.length + 1);
    if (!setId) return { kind: 'list' };
    const vsParam = new URLSearchParams(window.location.search).get('vs');
    const vsTimeMs = vsParam ? parseVsTime(vsParam) : null;
    return { kind: 'set', setId, vsTimeMs };
  }
  return null;
}

function parseVsTime(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function buildRaceShareUrl(setId: string, timeMs: number): string {
  const path = `${RACE_PREFIX}/${setId}?vs=${timeMs}`;
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

export function navigateRace(setId: string | null): void {
  if (typeof window === 'undefined') return;
  const url = setId ? `${RACE_PREFIX}/${setId}` : RACE_PREFIX;
  window.history.pushState(null, '', url);
  // pushState doesn't fire popstate; emit a custom event the App listens for.
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function navigateHome(): void {
  if (typeof window === 'undefined') return;
  window.history.pushState(null, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// /daily is the bookmarkable "today's problem" route. Sticky - reload keeps
// the user on it. A regular practice click sends them back to /.
const DAILY_PATH = '/daily';

export function isDailyRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.replace(/\/$/, '') === DAILY_PATH;
}

export function navigateToDaily(): void {
  if (typeof window === 'undefined') return;
  window.history.pushState(null, '', DAILY_PATH);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
