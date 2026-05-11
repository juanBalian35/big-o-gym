// Opaque per-browser visitor ID for cross-day analytics.
//
// What this is: a random UUID generated client-side on first visit and
// stored in localStorage. Sent as a `vid` prop on every track() event.
//
// What this is NOT: a user identifier. We never know who a vid belongs to
// - no email, no IP, no fingerprint. The UUID is generated locally and
// only ever crosses the wire as a string in our analytics events. Clearing
// site data clears the vid; private browsing never persists it.
//
// Why we have it: Plausible's default identification is a daily-rotating
// IP+UA hash, which can answer "how many unique visitors today?" but not
// "did this browser come back next week?" The vid prop closes that gap
// without identifying the person behind the browser.

import { safeStorage } from './storage/safe-storage';

const VISITOR_KEY = 'complexity-practice:v1:visitor';

let cached: string | null = null;

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for very old environments. Not a true UUID but unique enough.
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

export function getVisitorId(): string {
  if (cached) return cached;
  let id = safeStorage.get(VISITOR_KEY);
  if (!id) {
    id = generateUuid();
    safeStorage.set(VISITOR_KEY, id);
  }
  cached = id;
  return id;
}
