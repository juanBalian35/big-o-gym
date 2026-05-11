import { useState } from 'react';
import type { RaceDoneSummary } from '../hooks/use-race';
import { formatTime, formatDelta } from '../lib/format-time';
import {
  buildRaceShareUrl,
  navigateRace,
  navigateHome,
  navigateToDaily,
} from '../lib/url-routing';
import { track } from '../lib/track';

interface Props {
  summary: RaceDoneSummary;
  onRunAgain: () => void;
}

export function RaceResult({ summary, onRunAgain }: Props) {
  const [shareCopied, setShareCopied] = useState(false);

  const vsDelta =
    summary.vsTimeMs !== null
      ? summary.finalTimeMs - summary.vsTimeMs
      : null;
  const pbDelta =
    summary.previousPB !== null
      ? summary.finalTimeMs - summary.previousPB.timeMs
      : null;

  async function handleShare() {
    track('share', { id: `race:${summary.setId}` });
    const url = buildRaceShareUrl(summary.setId, summary.finalTimeMs);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <section className="rounded-md border border-border bg-panel p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            {summary.setName}
          </p>
          <p className="mt-2 font-mono text-4xl text-accent">
            {formatTime(summary.finalTimeMs)}
          </p>
          {summary.isNewBest && (
            <p className="mt-2 text-sm text-accent">★ new personal best</p>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <Stat label="Wall time" value={formatTime(summary.wallTimeMs)} />
          <Stat
            label="Penalty"
            value={
              summary.penaltyMs > 0
                ? `+${formatTime(summary.penaltyMs)} (${summary.wrongCount})`
                : '-'
            }
          />
          <Stat
            label="Previous best"
            value={
              summary.previousPB
                ? `${formatTime(summary.previousPB.timeMs)}${
                    pbDelta !== null && !summary.isNewBest
                      ? ` (${formatDelta(pbDelta)})`
                      : ''
                  }`
                : '-'
            }
          />
        </dl>

        {vsDelta !== null && (
          <div className="rounded border border-border bg-bg p-3 text-sm">
            <span className="text-muted">vs friend ({formatTime(summary.vsTimeMs!)}): </span>
            <span className={vsDelta < 0 ? 'text-ok' : 'text-warn'}>
              {vsDelta < 0
                ? `you won by ${formatTime(Math.abs(vsDelta))}`
                : vsDelta > 0
                ? `you lost by ${formatTime(vsDelta)}`
                : 'tie'}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="text-xs text-muted hover:text-text underline-offset-2 hover:underline"
          >
            {shareCopied ? 'Link copied!' : 'Share your time'}
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRunAgain}
              className="rounded border border-border px-3 py-1.5 text-sm text-muted hover:text-text"
            >
              Run again
            </button>
            <button
              type="button"
              onClick={() => navigateRace(null)}
              className="rounded border border-accent px-4 py-1.5 text-sm text-accent hover:bg-accent/10"
            >
              All sets →
            </button>
          </div>
        </div>
      </section>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-bg p-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-text">{value}</dd>
    </div>
  );
}
