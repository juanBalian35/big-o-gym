// A localStorage wrapper that gracefully falls back to in-memory state when
// localStorage is unavailable (private browsing, disabled, SSR, etc.) or
// throws on access.

const memoryStore = new Map<string, string>();

function tryGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

function trySet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

function tryRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    memoryStore.delete(key);
  }
}

export const safeStorage = {
  get: tryGet,
  set: trySet,
  remove: tryRemove,
};
