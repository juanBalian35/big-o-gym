import { describe, expect, it } from 'vitest';
import { validateProblems, addReferencedVars } from '../validate-problems';
import type { CodeProblem } from '../../types/problem';

const baseProblem: CodeProblem = {
  kind: 'code',
  id: 'p1',
  code: { python: 'pass', javascript: 'void 0;' },
  time_complexity: 'O(n)',
  space_complexity: 'O(1)',
  explanation: 'a single pass',
  concept: 'a placeholder concept',
  topic_tags: [],
  difficulty: 'easy',
  variables: [{ name: 'n', meaning: 'length of the input' }],
};

describe('validateProblems — variables', () => {
  it('accepts a valid problem with declared variables', () => {
    expect(() => validateProblems([baseProblem])).not.toThrow();
  });

  it('rejects missing variables array', () => {
    const bad = {
      ...baseProblem,
      variables: undefined,
    } as unknown as CodeProblem;
    expect(() => validateProblems([bad])).toThrow(/variables/);
  });

  it('rejects empty variables array', () => {
    const bad = { ...baseProblem, variables: [] };
    expect(() => validateProblems([bad])).toThrow(/non-empty/);
  });

  it('rejects variables with missing meaning', () => {
    const bad = {
      ...baseProblem,
      variables: [{ name: 'n', meaning: '' }],
    };
    expect(() => validateProblems([bad])).toThrow(/meaning/);
  });

  it('rejects duplicate variable names', () => {
    const bad = {
      ...baseProblem,
      variables: [
        { name: 'n', meaning: 'first' },
        { name: 'n', meaning: 'second' },
      ],
    };
    expect(() => validateProblems([bad])).toThrow(/duplicate variable/);
  });

  it('rejects an answer that uses an undeclared variable', () => {
    const bad: CodeProblem = {
      ...baseProblem,
      time_complexity: 'O(n * k)',
      variables: [{ name: 'n', meaning: 'length' }],
    };
    expect(() => validateProblems([bad])).toThrow(
      /variable "k" appears in an answer/
    );
  });

  it('accepts multivariable answers with all vars declared', () => {
    const ok: CodeProblem = {
      ...baseProblem,
      time_complexity: 'O(m * n)',
      variables: [
        { name: 'm', meaning: 'rows' },
        { name: 'n', meaning: 'columns' },
      ],
    };
    expect(() => validateProblems([ok])).not.toThrow();
  });

  it('checks variables in accepted_equivalent_forms', () => {
    const bad: CodeProblem = {
      ...baseProblem,
      time_complexity: 'O(n)',
      accepted_equivalent_forms: { time: ['O(n + k)'] },
      variables: [{ name: 'n', meaning: 'length' }],
    };
    expect(() => validateProblems([bad])).toThrow(/"k"/);
  });

  it('ignores known function names like log, lg, ln, max', () => {
    const ok: CodeProblem = {
      ...baseProblem,
      time_complexity: 'O(n log n)',
      variables: [{ name: 'n', meaning: 'length' }],
    };
    expect(() => validateProblems([ok])).not.toThrow();
  });
});

describe('addReferencedVars', () => {
  const collect = (s: string) => {
    const out = new Set<string>();
    addReferencedVars(s, out);
    return [...out].sort();
  };

  it('extracts a single variable', () => {
    expect(collect('O(n)')).toEqual(['n']);
  });

  it('extracts multiple variables', () => {
    expect(collect('O(m * n)')).toEqual(['m', 'n']);
  });

  it('strips the O(...) wrapper', () => {
    expect(collect('Θ(v + e)')).toEqual(['e', 'v']);
  });

  it('ignores log/lg/ln/max/min', () => {
    expect(collect('O(n log n)')).toEqual(['n']);
    expect(collect('O(max(n, m))')).toEqual(['m', 'n']);
  });
});
