import type { Problem } from '../types/problem';

export function selectNextProblem(
  allProblems: Problem[],
  lastShownProblemId: string | null,
  rng: () => number = Math.random
): Problem {
  if (allProblems.length === 0) {
    throw new Error('selectNextProblem: empty problem pool');
  }
  if (allProblems.length === 1) {
    return allProblems[0]!;
  }

  const candidates = allProblems.filter((p) => p.id !== lastShownProblemId);
  const pool = candidates.length > 0 ? candidates : allProblems;
  const idx = Math.floor(rng() * pool.length);
  return pool[idx]!;
}
