import type { Language } from '../../types/problem';
import { PREFERENCES_KEY } from './keys';
import { safeStorage } from './safe-storage';

interface Preferences {
  language: Language;
}

const DEFAULT_PREFS: Preferences = { language: 'python' };

function loadPrefs(): Preferences {
  const raw = safeStorage.get(PREFERENCES_KEY);
  if (!raw) return { ...DEFAULT_PREFS };
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed.language === 'python' || parsed.language === 'javascript')
    ) {
      return { language: parsed.language };
    }
    safeStorage.remove(PREFERENCES_KEY);
    return { ...DEFAULT_PREFS };
  } catch {
    safeStorage.remove(PREFERENCES_KEY);
    return { ...DEFAULT_PREFS };
  }
}

function savePrefs(prefs: Preferences): void {
  safeStorage.set(PREFERENCES_KEY, JSON.stringify(prefs));
}

export function loadPreferredLanguage(): Language {
  return loadPrefs().language;
}

export function savePreferredLanguage(lang: Language): void {
  savePrefs({ language: lang });
}
