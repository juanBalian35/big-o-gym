import { useMemo, useState } from 'react';
import type { SessionAttempt } from '../lib/session-reflection';
import { readableName } from '../lib/problem-name';

interface Props {
  sessionAttempts: SessionAttempt[];
  totalCount: number;
  solvedCount: number;
  onSelectProblem: (id: string) => void;
}

export function SessionStatsPanel({
  sessionAttempts,
  totalCount,
  solvedCount,
  onSelectProblem,
}: Props) {
  const [open, setOpen] = useState(false);

  // Dedup by problem id, keeping the latest attempt. Within a single session
  // each problem appears at most once until all are seen, but the rotation
  // resets after that and a problem can re-appear; the latest result wins.
  const { solved, missed } = useMemo(() => {
    const latest = new Map<string, SessionAttempt>();
    for (const a of sessionAttempts) latest.set(a.problemId, a);
    const solvedList: SessionAttempt[] = [];
    const missedList: SessionAttempt[] = [];
    for (const a of latest.values()) {
      (a.allCorrect ? solvedList : missedList).push(a);
    }
    return { solved: solvedList, missed: missedList };
  }, [sessionAttempts]);

  const hasAttempts = sessionAttempts.length > 0;

  return (
    <section
      aria-label="Session stats"
      className="rounded-md border border-border bg-panel/60"
    >
      <button
        type="button"
        onClick={() => hasAttempts && setOpen((v) => !v)}
        disabled={!hasAttempts}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-xs text-muted disabled:cursor-default"
      >
        <span className="tabular-nums">
          <span className="text-text">{solvedCount}</span>
          <span className="opacity-60"> / {totalCount}</span> solved
          {hasAttempts && (
            <span className="opacity-60">
              {' '}· {sessionAttempts.length} attempted
            </span>
          )}
        </span>
        {hasAttempts && (
          <span aria-hidden className="text-muted">
            {open ? '▾' : '▸'}
          </span>
        )}
      </button>

      {open && hasAttempts && (
        <div className="border-t border-border px-4 py-4 space-y-4 text-xs">
          {solved.length > 0 && (
            <Section
              title={`solved (${solved.length})`}
              tone="ok"
              entries={solved}
              onSelect={onSelectProblem}
              actionLabel="revisit"
            />
          )}
          {missed.length > 0 && (
            <Section
              title={`missed (${missed.length})`}
              tone="warn"
              entries={missed}
              onSelect={onSelectProblem}
              actionLabel="redo"
            />
          )}
        </div>
      )}
    </section>
  );
}

interface SectionProps {
  title: string;
  tone: 'ok' | 'warn';
  entries: SessionAttempt[];
  onSelect: (id: string) => void;
  actionLabel: string;
}

function Section({ title, tone, entries, onSelect, actionLabel }: SectionProps) {
  const titleColor = tone === 'ok' ? 'text-ok' : 'text-warn';
  return (
    <div className="space-y-1">
      <div className={`uppercase tracking-wider ${titleColor}`}>{title}</div>
      <ul className="space-y-1">
        {entries.map((a) => (
          <li
            key={a.problemId}
            className="flex items-center justify-between gap-3"
          >
            <span className="font-mono text-text">
              {readableName(a.problemId)}
              <span className="ml-2 text-muted">{a.concept}</span>
            </span>
            <button
              type="button"
              onClick={() => onSelect(a.problemId)}
              className="text-muted hover:text-accent underline-offset-2 hover:underline shrink-0"
            >
              {actionLabel}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
