import { problems } from '../data/problems';
import type { Problem } from '../types/problem';

const PATH_PREFIX = '/p/';
const HASH_PREFIX = '#/p/';

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
