import type { Category, Difficulty } from '../types/problem';

export interface SessionAttempt {
  problemId: string;
  concept: string;
  category: Category;
  difficulty: Difficulty;
  allCorrect: boolean;
}

/**
 * Pick a one-line reflection from the entire session's attempts. Returns
 * null when there's not enough data (< 5 attempts).
 *
 * Rule order is intentional — the most informative pattern wins. We look at:
 *  - the last 5 attempts (recent shape: clean run, rough patch)
 *  - per-concept hit rates across the whole session (weakness, strength)
 *  - difficulty correlation (failing only on hard, easies clean)
 *  - improvement / drift trajectory across halves of the session
 *  - session-level accuracy as a default framing
 */
export function reflect(attempts: SessionAttempt[]): string | null {
  if (attempts.length < 5) return null;

  const total = attempts.length;
  const correct = attempts.filter((a) => a.allCorrect).length;

  const last5 = attempts.slice(-5);
  const last5Correct = last5.filter((a) => a.allCorrect).length;
  const last5Hard = last5.filter((a) => a.difficulty === 'hard').length;

  // 1) Recent perfect run.
  if (last5Correct === 5) {
    if (last5Hard >= 1) {
      return `Five clean in a row — including a hard one. ${correct}/${total} on the session.`;
    }
    return `Five clean in a row. ${correct}/${total} on the session.`;
  }

  // 2) Recent rough patch (zero of last 5).
  if (last5Correct === 0) {
    return "Five in a row off — the next one's a fresh start. Slow down.";
  }

  // 3) Per-concept weakness across the whole session.
  const byConcept = new Map<
    string,
    { total: number; correct: number }
  >();
  for (const a of attempts) {
    const cur = byConcept.get(a.concept) ?? { total: 0, correct: 0 };
    byConcept.set(a.concept, {
      total: cur.total + 1,
      correct: cur.correct + (a.allCorrect ? 1 : 0),
    });
  }

  let weakest: { concept: string; missed: number; total: number } | null =
    null;
  for (const [concept, stats] of byConcept) {
    const missed = stats.total - stats.correct;
    if (stats.total >= 2 && missed >= 2) {
      if (
        !weakest ||
        missed > weakest.missed ||
        (missed === weakest.missed && stats.total > weakest.total)
      ) {
        weakest = { concept, missed, total: stats.total };
      }
    }
  }
  if (weakest) {
    return `${weakest.concept} keeps tripping you — ${weakest.missed} of ${weakest.total} missed. Worth a closer look.`;
  }

  // 4) Per-concept strength (≥3 on a concept, all correct).
  for (const [concept, stats] of byConcept) {
    if (stats.total >= 3 && stats.correct === stats.total) {
      return `${stats.total} on ${concept} — clean across the board.`;
    }
  }

  // 5) Difficulty correlation: easies clean, hards catching you.
  const easies = attempts.filter((a) => a.difficulty === 'easy');
  const hards = attempts.filter((a) => a.difficulty === 'hard');
  const easyMisses = easies.filter((a) => !a.allCorrect).length;
  const hardMisses = hards.filter((a) => !a.allCorrect).length;
  if (
    hards.length >= 2 &&
    easies.length >= 2 &&
    easyMisses === 0 &&
    hardMisses >= 2
  ) {
    return `Easies clean, hards catching you — the reading skill is there; keep practicing the trickier patterns.`;
  }

  // 6) Trajectory: split session in half, compare accuracy.
  if (total >= 10) {
    const half = Math.floor(total / 2);
    const firstHalf = attempts.slice(0, half);
    const secondHalf = attempts.slice(-half);
    const firstAcc =
      firstHalf.filter((a) => a.allCorrect).length / firstHalf.length;
    const secondAcc =
      secondHalf.filter((a) => a.allCorrect).length / secondHalf.length;
    if (secondAcc - firstAcc >= 0.25) {
      return `You're warming up — the second half is noticeably stronger than the first.`;
    }
    if (firstAcc - secondAcc >= 0.25) {
      return `Drift — your last few are weaker than your earlier run. Maybe a break.`;
    }
  }

  // 7) Default: session-level framing.
  const accuracy = correct / total;
  if (accuracy >= 0.8) {
    return `${correct}/${total} clean. You're rolling.`;
  }
  if (accuracy >= 0.5) {
    return `${correct}/${total} so far. Keep going.`;
  }
  return `${correct}/${total} so far — read the explanations carefully on the next few.`;
}
