import { describe, expect, it } from 'vitest';
import { tokenize } from '../tokenizer';
import { parse } from '../parser';
import { simplifyTop, makeTracker } from '../simplifier';
import { canonicalize } from '../comparator';

function norm(input: string) {
  const t = makeTracker();
  const ast = simplifyTop(parse(tokenize(input)), t);
  return { canonical: canonicalize(ast), tracker: t };
}

describe('simplifier — canonical equivalence', () => {
  it('n*n and n² produce same canonical form', () => {
    expect(norm('n*n').canonical).toBe(norm('n²').canonical);
  });

  it('n log n and n*log(n) produce same canonical form', () => {
    expect(norm('n log n').canonical).toBe(norm('n*log(n)').canonical);
  });

  it('n + m and m + n produce same canonical form', () => {
    expect(norm('n + m').canonical).toBe(norm('m + n').canonical);
  });

  it('all log bases unify', () => {
    expect(norm('log n').canonical).toBe(norm('lg n').canonical);
    expect(norm('log n').canonical).toBe(norm('ln n').canonical);
    expect(norm('log n').canonical).toBe(norm('log_2 n').canonical);
    expect(norm('log n').canonical).toBe(norm('log₂ n').canonical);
  });
});

describe('simplifier — tracker flags', () => {
  it('does not fire flags on syntactic-only normalization', () => {
    const { tracker } = norm('n*n');
    expect(tracker.droppedConstant).toBe(false);
    expect(tracker.droppedDominated).toBe(false);
  });

  it('fires droppedConstant for 2n', () => {
    const { tracker } = norm('2n');
    expect(tracker.droppedConstant).toBe(true);
  });

  it('fires droppedConstant for whole-expression constant', () => {
    const { tracker } = norm('5');
    expect(tracker.droppedConstant).toBe(true);
  });

  it('does not fire flags for O(1)', () => {
    const { tracker } = norm('1');
    expect(tracker.droppedConstant).toBe(false);
    expect(tracker.droppedDominated).toBe(false);
  });

  it('fires droppedDominated for n + log n', () => {
    const { tracker } = norm('n + log n');
    expect(tracker.droppedDominated).toBe(true);
  });

  it('fires droppedDominated for n^2 + n', () => {
    const { tracker } = norm('n^2 + n');
    expect(tracker.droppedDominated).toBe(true);
  });

  it('fires droppedDominated for 2^n + n^2', () => {
    const { tracker } = norm('2^n + n^2');
    expect(tracker.droppedDominated).toBe(true);
  });

  it('does not fire dominated when n + m (multivariable)', () => {
    const { tracker } = norm('n + m');
    expect(tracker.droppedDominated).toBe(false);
  });

  it('fires dominated for n*m + n', () => {
    const { tracker } = norm('n*m + n');
    expect(tracker.droppedDominated).toBe(true);
  });
});

describe('simplifier — final shape', () => {
  it('5 → 1', () => {
    expect(norm('5').canonical).toBe('C(1)');
  });

  it('2n → n', () => {
    expect(norm('2n').canonical).toBe('V(n)');
  });

  it('n^2 + n → n^2', () => {
    expect(norm('n^2 + n').canonical).toBe(norm('n^2').canonical);
  });

  it('2^n + n^100 → 2^n', () => {
    expect(norm('2^n + n^100').canonical).toBe(norm('2^n').canonical);
  });

  it('n! + 2^n → n!', () => {
    expect(norm('n! + 2^n').canonical).toBe(norm('n!').canonical);
  });

  it('n^n + n! → n^n', () => {
    expect(norm('n^n + n!').canonical).toBe(norm('n^n').canonical);
  });
});
