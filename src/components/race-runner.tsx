import { useEffect, useState } from 'react';
import { useRace } from '../hooks/use-race';
import { PromptPanel } from './prompt-panel';
import { VariablesPanel } from './variables-panel';
import { AnswerPanel } from './answer-panel';
import { RaceResult } from './race-result';
import type { Language } from '../types/problem';
import type { Theme } from '../lib/theme';
import { formatTime } from '../lib/format-time';
import { navigateRace } from '../lib/url-routing';

interface Props {
  setId: string;
  vsTimeMs: number | null;
  language: Language;
  theme: Theme;
}

export function RaceRunner({ setId, vsTimeMs, language, theme }: Props) {
  const race = useRace({ setId, vsTimeMs });

  if (!race.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <p className="text-sm text-muted">
          That race set doesn't exist.{' '}
          <button
            type="button"
            onClick={() => navigateRace(null)}
            className="text-accent underline-offset-2 hover:underline"
          >
            See all sets
          </button>
          .
        </p>
      </main>
    );
  }

  if (race.status === 'countdown') {
    return (
      <RaceCountdown countdown={race.countdown} setName={race.setName} />
    );
  }

  if (race.status === 'done' && race.summary) {
    return <RaceResult summary={race.summary} onRunAgain={race.restart} />;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <RaceHud
        startedAt={race.startedAt}
        penaltyMs={race.penaltyMs}
        index={race.index}
        total={race.total}
        wrongCount={race.wrongCount}
        flash={race.flash}
        vsTimeMs={race.vsTimeMs}
        setName={race.setName}
      />
      <PromptPanel
        problem={race.currentProblem}
        language={language}
        theme={theme}
      />
      {race.currentProblem.kind === 'code' && (
        <VariablesPanel variables={race.currentProblem.variables} />
      )}
      <AnswerPanel
        key={race.currentProblem.id}
        fields={race.fields}
        onSubmit={race.submit}
        parseError={race.parseErrorMsg}
        disabled={false}
      />
    </main>
  );
}

function RaceCountdown({
  countdown,
  setName,
}: {
  countdown: number;
  setName: string;
}) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-wider text-muted">
        racing · {setName}
      </p>
      <div
        key={countdown}
        className="animate-race-count-pop mt-6 font-mono text-8xl font-semibold text-accent"
      >
        {countdown}
      </div>
      <p className="mt-6 text-xs text-muted">get ready…</p>
    </main>
  );
}

type RaceFlash = 'right' | 'wrong' | 'almost' | 'parse_error' | null;

interface HudProps {
  startedAt: number;
  penaltyMs: number;
  index: number;
  total: number;
  wrongCount: number;
  flash: RaceFlash;
  vsTimeMs: number | null;
  setName: string;
}

function RaceHud({
  startedAt,
  penaltyMs,
  index,
  total,
  wrongCount,
  flash,
  vsTimeMs,
  setName,
}: HudProps) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = now - startedAt + penaltyMs;
  const isWrongLike =
    flash === 'wrong' || flash === 'parse_error' || flash === 'almost';

  const stateClass =
    flash === 'right'
      ? 'border-accent text-accent'
      : flash === 'wrong' || flash === 'parse_error'
      ? 'border-error text-error'
      : flash === 'almost'
      ? 'border-warn text-warn'
      : 'border-border';

  // Re-key on every miss so the shake animation re-fires even when consecutive
  // submissions are wrong. Stable across right submits / non-flash renders.
  const shakeKey = isWrongLike ? wrongCount : 0;

  return (
    <div
      key={shakeKey}
      className={isWrongLike ? 'animate-race-shake' : undefined}
    >
      <section
        className={`rounded-md border bg-panel p-3 transition-colors ${stateClass}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="text-xs uppercase tracking-wider text-muted">
            {setName} · {index + 1} / {total}
          </div>
          <div className="font-mono text-lg tabular-nums">
            {formatTime(elapsed)}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted">
          {wrongCount > 0 && (
            <span>
              {wrongCount} miss{wrongCount === 1 ? '' : 'es'} · +
              {formatTime(penaltyMs)} penalty
            </span>
          )}
          {vsTimeMs !== null && <span>vs {formatTime(vsTimeMs)}</span>}
        </div>
        {/* Reserved row for the per-submit flash. Always rendered with the
            same min-height so the HUD never shifts when the message
            appears or clears. */}
        <div className="mt-1 min-h-[1.25rem] text-xs font-semibold tracking-wide">
          {flash === 'right' && (
            <span className="text-accent">✓ correct</span>
          )}
          {flash === 'parse_error' && (
            <span className="text-error">✗ unparseable · +10s</span>
          )}
          {flash === 'wrong' && (
            <span className="text-error">✗ wrong · +10s</span>
          )}
          {flash === 'almost' && (
            <span className="text-warn">⚠ simplify further · +10s</span>
          )}
        </div>
      </section>
    </div>
  );
}
