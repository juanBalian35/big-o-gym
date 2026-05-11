// Lightweight observability. Aggregate counts piped to PostHog (when its
// env-configured key is present) and a console.info in dev. Each event call
// is wrapped in try/catch so analytics can never break the app.
//
// Every event includes a `vid` prop - an opaque, client-generated UUID
// stored in localStorage. It identifies a *browser install*, not a person.
// See src/lib/visitor.ts for the rationale.
//
// PostHog is initialized in src/lib/posthog-init.ts and configured via
// VITE_POSTHOG_KEY (and optionally VITE_POSTHOG_HOST). When the key is
// missing the helper degrades to console-only.

import posthog from 'posthog-js';
import { getVisitorId } from './visitor';
import { isPostHogReady } from './posthog-init';

export type EventName =
  | 'problem_shown'
  | 'submit'
  | 'solved'
  | 'parse_error'
  | 'share'
  | 'challenge_arrived'
  | 'retry'
  | 'reflection_shown'
  | 'session_end'
  | 'race_start'
  | 'race_complete'
  | 'race_pb'
  | 'race_submit'
  | 'race_abandon'
  | 'race_callout_click'
  | 'nudge_shown'
  | 'nudge_clicked'
  | 'daily_started'
  | 'daily_solved'
  | 'show_solution';

type PropValue = string | number | boolean;

const isDev = import.meta.env.DEV;

export function track(
  name: EventName,
  props?: Record<string, PropValue>
): void {
  try {
    if (typeof window === 'undefined') return;
    const fullProps: Record<string, PropValue> = {
      vid: getVisitorId(),
      ...(props ?? {}),
    };
    if (isPostHogReady()) {
      posthog.capture(name, fullProps);
    }
    if (isDev) {
      console.info('[track]', name, fullProps);
    }
  } catch {
    // never let analytics throw
  }
}
