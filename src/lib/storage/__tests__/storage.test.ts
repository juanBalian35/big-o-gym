import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  loadAttempts,
  saveAttempt,
  clearAttempts,
  loadPreferredLanguage,
  savePreferredLanguage,
  ATTEMPTS_KEY,
  PREFERENCES_KEY,
} from '../index';
import type { Attempt } from '../../../types/attempt';

const sampleAttempt: Attempt = {
  problem_id: 'sum-array',
  problem_kind: 'code',
  language_shown: 'python',
  time_answer: 'O(n)',
  space_answer: 'O(1)',
  time_result: 'correct',
  space_result: 'correct',
  timestamp: '2026-05-02T00:00:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('attempts storage', () => {
  it('returns empty array when nothing stored', () => {
    expect(loadAttempts()).toEqual([]);
  });

  it('round-trips a single attempt', () => {
    saveAttempt(sampleAttempt);
    expect(loadAttempts()).toEqual([sampleAttempt]);
  });

  it('appends multiple attempts in order', () => {
    saveAttempt(sampleAttempt);
    saveAttempt({ ...sampleAttempt, problem_id: 'binary-search' });
    const loaded = loadAttempts();
    expect(loaded).toHaveLength(2);
    expect(loaded[0]?.problem_id).toBe('sum-array');
    expect(loaded[1]?.problem_id).toBe('binary-search');
  });

  it('clearAttempts wipes storage', () => {
    saveAttempt(sampleAttempt);
    clearAttempts();
    expect(loadAttempts()).toEqual([]);
  });

  it('returns empty array and resets on corrupted JSON', () => {
    localStorage.setItem(ATTEMPTS_KEY, 'this is not json');
    expect(loadAttempts()).toEqual([]);
    expect(localStorage.getItem(ATTEMPTS_KEY)).toBeNull();
  });

  it('returns empty array on non-array JSON', () => {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ foo: 'bar' }));
    expect(loadAttempts()).toEqual([]);
    expect(localStorage.getItem(ATTEMPTS_KEY)).toBeNull();
  });
});

describe('preferences storage', () => {
  it('defaults to python when nothing stored', () => {
    expect(loadPreferredLanguage()).toBe('python');
  });

  it('round-trips javascript', () => {
    savePreferredLanguage('javascript');
    expect(loadPreferredLanguage()).toBe('javascript');
  });

  it('round-trips python', () => {
    savePreferredLanguage('python');
    expect(loadPreferredLanguage()).toBe('python');
  });

  it('falls back to default on corrupted JSON', () => {
    localStorage.setItem(PREFERENCES_KEY, '{ broken');
    expect(loadPreferredLanguage()).toBe('python');
    expect(localStorage.getItem(PREFERENCES_KEY)).toBeNull();
  });

  it('falls back to default on invalid language value', () => {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ language: 'rust' })
    );
    expect(loadPreferredLanguage()).toBe('python');
  });
});

describe('storage keys are versioned', () => {
  it('keys are versioned under the complexity-practice namespace', () => {
    expect(ATTEMPTS_KEY).toMatch(/^complexity-practice:v\d+:attempts$/);
    expect(PREFERENCES_KEY).toMatch(
      /^complexity-practice:v\d+:preferences$/
    );
  });
});
