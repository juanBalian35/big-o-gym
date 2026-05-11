import { RACE_SETS } from '../data/race-sets';
import { loadPB } from '../lib/race-storage';
import { formatTime } from '../lib/format-time';
import { navigateRace, navigateHome, navigateToDaily } from '../lib/url-routing';

export function RaceSetList() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Race mode</h2>
        <p className="text-sm text-muted">
          Run a curated set against the clock. Each wrong submission adds 10
          seconds - you keep retrying until you get it right.
        </p>
      </div>
      <ul className="space-y-3">
        {RACE_SETS.map((set) => {
          const pb = loadPB(set.id);
          return (
            <li key={set.id}>
              <button
                type="button"
                onClick={() => navigateRace(set.id)}
                className="w-full rounded-md border border-border bg-panel p-4 text-left transition-colors hover:border-accent"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-medium">{set.name}</div>
                  <div className="text-xs text-muted">
                    {set.problemIds.length} problems
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted">{set.blurb}</p>
                <div className="mt-3 text-xs">
                  {pb ? (
                    <span className="text-accent">
                      best: {formatTime(pb.timeMs)}
                    </span>
                  ) : (
                    <span className="text-muted">no run yet</span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={navigateHome}
          className="text-xs text-muted hover:text-text underline-offset-2 hover:underline"
        >
          ← back to practice
        </button>
        <button
          type="button"
          onClick={navigateToDaily}
          className="text-xs text-accent underline-offset-2 hover:underline"
        >
          today's problem →
        </button>
      </div>
    </main>
  );
}
