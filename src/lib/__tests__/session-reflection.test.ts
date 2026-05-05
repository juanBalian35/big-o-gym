import { describe, expect, it } from 'vitest';
import { reflect, type SessionAttempt } from '../session-reflection';

const a = (
  partial: Partial<SessionAttempt> & { allCorrect: boolean }
): SessionAttempt => ({
  problemId: 'p',
  concept: 'X',
  category: 'arrays',
  difficulty: 'medium',
  ...partial,
});

describe('reflect', () => {
  it('returns null when fewer than 5 attempts', () => {
    expect(reflect([])).toBeNull();
    expect(reflect([a({ allCorrect: true })])).toBeNull();
    expect(reflect(Array(4).fill(a({ allCorrect: true })))).toBeNull();
  });

  it('celebrates 5/5 with hard included', () => {
    const out = reflect([
      a({ allCorrect: true, difficulty: 'hard' }),
      a({ allCorrect: true }),
      a({ allCorrect: true }),
      a({ allCorrect: true }),
      a({ allCorrect: true }),
    ]);
    expect(out).toMatch(/hard/i);
    expect(out).toMatch(/5\/5/);
  });

  it('marks rough patch when 0/5 correct', () => {
    const out = reflect(Array(5).fill(a({ allCorrect: false })));
    expect(out).toMatch(/five in a row|fresh start|slow down/i);
  });

  it('flags concept missed twice', () => {
    const out = reflect([
      a({ allCorrect: false, concept: 'amortized analysis' }),
      a({ allCorrect: true }),
      a({ allCorrect: false, concept: 'amortized analysis' }),
      a({ allCorrect: true }),
      a({ allCorrect: false, concept: 'rolling DP' }),
    ]);
    expect(out).toMatch(/amortized analysis/);
    expect(out).toMatch(/2 of 2/);
  });

  it('celebrates per-concept strength (3+ clean on one concept)', () => {
    const out = reflect([
      a({ allCorrect: true, concept: 'recursion' }),
      a({ allCorrect: true, concept: 'recursion' }),
      a({ allCorrect: true, concept: 'recursion' }),
      a({ allCorrect: false, concept: 'something-else' }),
      a({ allCorrect: false, concept: 'another' }),
    ]);
    expect(out).toMatch(/recursion/);
    expect(out).toMatch(/clean/i);
  });

  it('flags hard-vs-easy correlation', () => {
    const out = reflect([
      a({ allCorrect: true, difficulty: 'easy', concept: 'A' }),
      a({ allCorrect: true, difficulty: 'easy', concept: 'B' }),
      a({ allCorrect: false, difficulty: 'hard', concept: 'C' }),
      a({ allCorrect: false, difficulty: 'hard', concept: 'D' }),
      a({ allCorrect: true, difficulty: 'medium', concept: 'E' }),
    ]);
    expect(out).toMatch(/easies|hards|trickier/i);
  });

  it('detects improvement trajectory across a 10+ session', () => {
    // First half: 0/5 correct. Second half: 4/5 correct (mixed last 5 so
    // the recent-shape rule doesn't pre-empt).
    const out = reflect([
      a({ allCorrect: false, concept: 'A' }),
      a({ allCorrect: false, concept: 'B' }),
      a({ allCorrect: false, concept: 'C' }),
      a({ allCorrect: false, concept: 'D' }),
      a({ allCorrect: false, concept: 'E' }),
      a({ allCorrect: false, concept: 'F' }),
      a({ allCorrect: true, concept: 'G' }),
      a({ allCorrect: true, concept: 'H' }),
      a({ allCorrect: true, concept: 'I' }),
      a({ allCorrect: true, concept: 'J' }),
    ]);
    expect(out).toMatch(/warming up|stronger/i);
  });

  it('detects drift trajectory across a 10+ session', () => {
    // First half: 5/5 correct. Second half: 1/5 correct (mixed enough that
    // the recent-shape rule doesn't fire).
    const out = reflect([
      a({ allCorrect: true, concept: 'A' }),
      a({ allCorrect: true, concept: 'B' }),
      a({ allCorrect: true, concept: 'C' }),
      a({ allCorrect: true, concept: 'D' }),
      a({ allCorrect: true, concept: 'E' }),
      a({ allCorrect: true, concept: 'F' }),
      a({ allCorrect: false, concept: 'G' }),
      a({ allCorrect: false, concept: 'H' }),
      a({ allCorrect: false, concept: 'I' }),
      a({ allCorrect: false, concept: 'J' }),
    ]);
    expect(out).toMatch(/drift|weaker/i);
  });

  it('falls back to session-level accuracy when no rule fires', () => {
    const out = reflect([
      a({ allCorrect: true, concept: 'A' }),
      a({ allCorrect: false, concept: 'B' }),
      a({ allCorrect: true, concept: 'C' }),
      a({ allCorrect: false, concept: 'D' }),
      a({ allCorrect: true, concept: 'E' }),
    ]);
    expect(out).toMatch(/3\/5/);
  });
});
