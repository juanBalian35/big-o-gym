import { describe, expect, it } from 'vitest';
import { classifyAnswer } from '../classifier';

describe('classifyAnswer — syntactic equivalence (correct)', () => {
  const cases: [string, string][] = [
    ['O(n)', 'n'],
    ['O(n)', 'O( n )'],
    ['O(N)', 'O(n)'],
    ['O(n^2)', 'O(n²)'],
    ['O(n*n)', 'O(n²)'],
    ['O(n log n)', 'O(n*log(n))'],
    ['O(log n)', 'O(log₂ n)'],
    ['O(log n)', 'O(lg n)'],
    ['O(log n)', 'O(ln n)'],
    ['O(log n)', 'O(log_2 n)'],
    ['Θ(n)', 'O(n)'],
    ['o(n)', 'O(n)'],
    ['O(nn)', 'O(n²)'],
    ['O(n · n)', 'O(n²)'],
    ['O(n + m)', 'O(m + n)'],
    ['O(n*m)', 'O(m*n)'],
    ['O(2^n)', 'O(2^n)'],
    ['O(n!)', 'O(n!)'],
    ['O(n^n)', 'O(n^n)'],
  ];

  for (const [user, canonical] of cases) {
    it(`"${user}" vs "${canonical}" → correct`, () => {
      const r = classifyAnswer(user, canonical);
      expect(r.result).toBe('correct');
    });
  }
});

describe('classifyAnswer — almost (lossy simplification)', () => {
  const cases: [string, string][] = [
    ['O(2n)', 'O(n)'],
    ['O(5)', 'O(1)'],
    ['O(n + log n)', 'O(n)'],
    ['O(n² + n)', 'O(n²)'],
    ['O(3n²)', 'O(n²)'],
    ['O(2^n + n²)', 'O(2^n)'],
    ['O(100)', 'O(1)'],
    ['O(n + 5)', 'O(n)'],
    ['O(n + n)', 'O(n)'],
  ];

  for (const [user, canonical] of cases) {
    it(`"${user}" vs "${canonical}" → almost`, () => {
      const r = classifyAnswer(user, canonical);
      expect(r.result).toBe('almost');
      expect(r.message).toBeTruthy();
    });
  }
});

describe('classifyAnswer — wrong', () => {
  const cases: [string, string][] = [
    ['O(n)', 'O(n²)'],
    ['O(log n)', 'O(n)'],
    ['O(n²)', 'O(n log n)'],
    ['O(n)', 'O(2^n)'],
    ['O(1)', 'O(n)'],
    ['O(n + m)', 'O(n*m)'],
  ];

  for (const [user, canonical] of cases) {
    it(`"${user}" vs "${canonical}" → wrong`, () => {
      const r = classifyAnswer(user, canonical);
      expect(r.result).toBe('wrong');
    });
  }
});

describe('classifyAnswer — parse_error', () => {
  const cases: string[] = ['', '   ', 'linear', 'fast', 'O()', 'O(', 'n +', '++n'];
  for (const input of cases) {
    it(`"${input}" → parse_error`, () => {
      const r = classifyAnswer(input, 'O(n)');
      expect(r.result).toBe('parse_error');
    });
  }
});

describe('classifyAnswer — accepted_equivalents', () => {
  it('treats accepted equivalent as correct', () => {
    const r = classifyAnswer('O(m·n)', 'O(m * n)', ['O(mn)']);
    expect(r.result).toBe('correct');
  });

  it('uses accepted equivalent when canonical does not match', () => {
    // canonical is "O(max(n,m))" which is unparseable; equivalent is "O(n+m)"
    const r = classifyAnswer('O(n + m)', 'O(max(n, m))', ['O(n + m)']);
    expect(r.result).toBe('correct');
  });

  it('without equivalents, n+m vs unparseable canonical → wrong', () => {
    const r = classifyAnswer('O(n + m)', 'O(max(n, m))');
    expect(r.result).toBe('wrong');
  });
});

describe('classifyAnswer — multivariable preservation', () => {
  it('does not collapse n + m', () => {
    const r = classifyAnswer('O(n + m)', 'O(n + m)');
    expect(r.result).toBe('correct');
  });

  it('drops n when n*m + n', () => {
    const r = classifyAnswer('O(n*m + n)', 'O(n*m)');
    expect(r.result).toBe('almost');
  });

  it('keeps both terms when neither dominates', () => {
    const r = classifyAnswer('O(n + m)', 'O(n)');
    expect(r.result).toBe('wrong');
  });
});

describe('classifyAnswer — message text', () => {
  it('mentions dropping the constant for O(2n) → O(n)', () => {
    const r = classifyAnswer('O(2n)', 'O(n)');
    expect(r.message?.toLowerCase()).toContain('constant');
  });

  it('mentions dropping the dominated term for O(n + log n) → O(n)', () => {
    const r = classifyAnswer('O(n + log n)', 'O(n)');
    expect(r.message?.toLowerCase()).toContain('dominated');
  });
});
