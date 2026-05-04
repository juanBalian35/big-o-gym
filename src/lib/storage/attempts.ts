import type { Attempt } from '../../types/attempt';
import { ATTEMPTS_KEY } from './keys';
import { safeStorage } from './safe-storage';

export function loadAttempts(): Attempt[] {
  const raw = safeStorage.get(ATTEMPTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      safeStorage.remove(ATTEMPTS_KEY);
      return [];
    }
    return parsed as Attempt[];
  } catch {
    safeStorage.remove(ATTEMPTS_KEY);
    return [];
  }
}

export function saveAttempt(a: Attempt): void {
  const all = loadAttempts();
  all.push(a);
  safeStorage.set(ATTEMPTS_KEY, JSON.stringify(all));
}

export function clearAttempts(): void {
  safeStorage.remove(ATTEMPTS_KEY);
}
