// Initialize PostHog once on app boot. Safe no-op when the env var is
// missing (e.g., local dev without a key, or before deploy).

import posthog from 'posthog-js';

const KEY = import.meta.env.VITE_POSTHOG_KEY;
const HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let initialized = false;

export function initPostHog(): void {
  if (initialized) return;
  if (typeof window === 'undefined') return;
  if (!KEY) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(
        '[posthog] VITE_POSTHOG_KEY not set — analytics will console-log only.'
      );
    }
    return;
  }

  posthog.init(KEY, {
    api_host: HOST,
    // Don't create a "person profile" for anonymous users; we only need
    // event counts. Cheaper on the PostHog free tier and matches the spec's
    // "no per-user tracking" stance.
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  });

  initialized = true;
}

export function isPostHogReady(): boolean {
  return initialized;
}
