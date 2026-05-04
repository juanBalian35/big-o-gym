import { describe, expect, it } from 'vitest';
import { selectNextProblem } from '../problem-selection';
import type { Problem } from '../../types/problem';

const make = (id: string): Problem => ({
  kind: 'code',
  id,
  code: { python: 'x', javascript: 'x' },
  time_complexity: 'O(1)',
  space_complexity: 'O(1)',
  explanation: 'x',
  concept: 'x',
  topic_tags: [],
  difficulty: 'easy',
  variables: [{ name: 'n', meaning: 'placeholder' }],
});

describe('selectNextProblem', () => {
  it('returns the only problem when pool has one', () => {
    const pool = [make('a')];
    expect(selectNextProblem(pool, null).id).toBe('a');
    expect(selectNextProblem(pool, 'a').id).toBe('a');
  });

  it('never returns the same problem twice in a row', () => {
    const pool = [make('a'), make('b'), make('c')];
    for (let r = 0; r < 1; r += 0.1) {
      const next = selectNextProblem(pool, 'a', () => r);
      expect(next.id).not.toBe('a');
    }
  });

  it('uses rng to pick deterministically', () => {
    const pool = [make('a'), make('b'), make('c')];
    expect(selectNextProblem(pool, null, () => 0).id).toBe('a');
    expect(selectNextProblem(pool, null, () => 0.5).id).toBe('b');
    expect(selectNextProblem(pool, null, () => 0.99).id).toBe('c');
  });

  it('throws when pool is empty', () => {
    expect(() => selectNextProblem([], null)).toThrow();
  });
});
