import { RACE_PB_KEY_PREFIX } from './storage/keys';
import { safeStorage } from './storage/safe-storage';

export interface RacePB {
  timeMs: number;
  completedAt: string;
}

function keyFor(setId: string): string {
  return `${RACE_PB_KEY_PREFIX}${setId}`;
}

export function loadPB(setId: string): RacePB | null {
  const raw = safeStorage.get(keyFor(setId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.timeMs === 'number' &&
      typeof parsed.completedAt === 'string'
    ) {
      return { timeMs: parsed.timeMs, completedAt: parsed.completedAt };
    }
    safeStorage.remove(keyFor(setId));
    return null;
  } catch {
    safeStorage.remove(keyFor(setId));
    return null;
  }
}

export function savePBIfBetter(setId: string, timeMs: number): {
  isNewBest: boolean;
  previous: RacePB | null;
} {
  const prev = loadPB(setId);
  if (prev && prev.timeMs <= timeMs) {
    return { isNewBest: false, previous: prev };
  }
  const next: RacePB = { timeMs, completedAt: new Date().toISOString() };
  safeStorage.set(keyFor(setId), JSON.stringify(next));
  return { isNewBest: true, previous: prev };
}
