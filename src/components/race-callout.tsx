import { RACE_SETS } from '../data/race-sets';
import { loadPB } from '../lib/race-storage';
import { navigateRace } from '../lib/url-routing';
import { track } from '../lib/track';

export function RaceCallout() {
  if (RACE_SETS.length === 0) return null;
  const hasAnyPB = RACE_SETS.some((s) => loadPB(s.id) !== null);

  function handleClick() {
    track('race_callout_click', { has_pb: hasAnyPB });
    navigateRace(null);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group block w-full rounded-md border border-border bg-panel p-4 text-left transition-colors hover:border-accent hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="text-accent">▸</span>
          <span className="text-sm font-semibold tracking-tight">
            race mode
          </span>
          <span className="ml-0.5 animate-pulse text-accent">_</span>
          <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            new
          </span>
        </div>
        <span className="text-xs text-muted transition-colors group-hover:text-accent">
          pick a set →
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        {RACE_SETS.length} curated sets · beat the clock, beat your friends
      </p>
    </button>
  );
}
