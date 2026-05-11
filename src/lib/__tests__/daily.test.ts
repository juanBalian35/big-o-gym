import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  dateKey,
  getCurrentStreak,
  getDailyProblemId,
  hasActiveStreak,
  isTodaySolved,
  recordDailySolve,
} from '../daily';

const HISTORY_KEY = 'bigo:daily-history';

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
});

describe('dateKey', () => {
  it('returns YYYY-MM-DD in UTC', () => {
    expect(dateKey(new Date('2026-05-10T03:00:00Z'))).toBe('2026-05-10');
    expect(dateKey(new Date('2026-12-31T23:59:59Z'))).toBe('2026-12-31');
  });

  it('does not shift across timezones (uses UTC, not local)', () => {
    // 11pm Pacific = 6am UTC next day - dateKey should report the UTC date.
    const d = new Date(Date.UTC(2026, 4, 11, 6, 0, 0));
    expect(dateKey(d)).toBe('2026-05-11');
  });
});

describe('getDailyProblemId', () => {
  it('is deterministic for a given UTC date', () => {
    const d = new Date('2026-05-10T12:00:00Z');
    const a = getDailyProblemId(d);
    const b = getDailyProblemId(d);
    expect(a).toBe(b);
  });

  it('differs from one day to the next (no consecutive collisions)', () => {
    const start = new Date('2026-05-10T00:00:00Z');
    let prev = getDailyProblemId(start);
    for (let i = 1; i < 365; i++) {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      const cur = getDailyProblemId(d);
      expect(cur).not.toBe(prev);
      prev = cur;
    }
  });
});

describe('isTodaySolved / recordDailySolve', () => {
  it('returns false when nothing recorded', () => {
    expect(isTodaySolved()).toBe(false);
  });

  it('returns true after recording today', () => {
    recordDailySolve('two-sum');
    expect(isTodaySolved()).toBe(true);
  });

  it('writes to localStorage under the bigo:daily-history key', () => {
    recordDailySolve('two-sum', new Date('2026-05-10T00:00:00Z'));
    const raw = localStorage.getItem(HISTORY_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual({ '2026-05-10': 'two-sum' });
  });
});

describe('hasActiveStreak', () => {
  it('false when no history', () => {
    expect(hasActiveStreak()).toBe(false);
  });

  it('true when yesterday is solved', () => {
    const today = new Date('2026-05-10T12:00:00Z');
    const yesterday = new Date('2026-05-09T12:00:00Z');
    recordDailySolve('foo', yesterday);
    expect(hasActiveStreak(today)).toBe(true);
  });

  it('false when only the day before yesterday is solved', () => {
    const today = new Date('2026-05-10T12:00:00Z');
    const dayBefore = new Date('2026-05-08T12:00:00Z');
    recordDailySolve('foo', dayBefore);
    expect(hasActiveStreak(today)).toBe(false);
  });
});

describe('getCurrentStreak', () => {
  const today = new Date('2026-05-10T12:00:00Z');
  const day = (offset: number) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + offset);
    return d;
  };

  it('returns 0 with no history', () => {
    expect(getCurrentStreak(today)).toBe(0);
  });

  it('counts today + consecutive prior days when today is solved', () => {
    recordDailySolve('a', day(0));
    recordDailySolve('b', day(-1));
    recordDailySolve('c', day(-2));
    expect(getCurrentStreak(today)).toBe(3);
  });

  it('falls back to yesterday when today is not yet solved', () => {
    recordDailySolve('a', day(-1));
    recordDailySolve('b', day(-2));
    expect(getCurrentStreak(today)).toBe(2);
  });

  it('stops at the first gap', () => {
    recordDailySolve('a', day(0));
    recordDailySolve('b', day(-1));
    // gap on day(-2)
    recordDailySolve('c', day(-3));
    expect(getCurrentStreak(today)).toBe(2);
  });

  it('returns 0 when neither today nor yesterday is solved', () => {
    recordDailySolve('a', day(-2));
    recordDailySolve('b', day(-3));
    expect(getCurrentStreak(today)).toBe(0);
  });
});
