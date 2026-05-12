// PostHog is initialized by the inline snippet in index.html <head>.
// This module just marks the flag so callers can check readiness.

import posthog from 'posthog-js';

let initialized = false;

export function initPostHog(): void {
  if (initialized) return;
  if (typeof window === 'undefined') return;
  // The <head> snippet has already called posthog.init(); don't re-init.
  if (posthog.__loaded) {
    initialized = true;
    return;
  }
  initialized = true;
}

export function isPostHogReady(): boolean {
  return initialized;
}
