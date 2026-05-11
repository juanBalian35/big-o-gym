// Attempts schema bumped to v2 in Ticket 12 (added problem_kind, nullable
// space/language fields). Older v1 attempts are intentionally not migrated -
// they go stale on the user's machine. Documented in DECISIONS.md.
export const ATTEMPTS_KEY = 'complexity-practice:v2:attempts';

// Preferences schema unchanged since v1.
export const PREFERENCES_KEY = 'complexity-practice:v1:preferences';

export const RACE_PB_KEY_PREFIX = 'complexity-practice:v1:race-pb:';

// Kept for tests that assert the version-prefix invariant.
export const STORAGE_PREFIX = 'complexity-practice:';
