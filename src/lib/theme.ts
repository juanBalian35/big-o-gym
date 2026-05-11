// Theme storage + DOM application. Read once on boot to avoid a flash of
// the wrong theme; write to localStorage and the document data attribute on
// every change.

import { safeStorage } from './storage/safe-storage';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'complexity-practice:v1:theme';

export function loadTheme(): Theme {
  const raw = safeStorage.get(THEME_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  return 'dark';
}

export function saveTheme(theme: Theme): void {
  safeStorage.set(THEME_KEY, theme);
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
}
