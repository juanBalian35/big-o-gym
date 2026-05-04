import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ResultState } from '../types/attempt';

export type ResultStateOrError = ResultState | 'parse_error';

export interface ResultLine {
  label: string;
  state: ResultStateOrError;
  userAnswer: string;
  canonicalAnswer: string;
  message?: string;
}

interface Props {
  lines: ResultLine[];
  explanation: string;
  concept: string;
  isTricky?: boolean;
  onNext: () => void;
  onShare: () => void;
  shareCopied?: boolean;
  onRetry?: () => void;
}

export function ResultPanel({
  lines,
  explanation,
  concept,
  isTricky,
  onNext,
  onShare,
  shareCopied,
  onRetry,
}: Props) {
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    nextRef.current?.focus();
  }, []);

  return (
    <section className="rounded-md border border-border bg-panel p-4 space-y-5">
      {lines.map((line) => (
        <ResultRow key={line.label} line={line} />
      ))}

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-muted">
          tested concept ·{' '}
          <span className="text-accent normal-case tracking-normal">
            {concept}
          </span>
          {isTricky && (
            <span className="ml-3 normal-case tracking-normal text-warn">
              ▲ tricky problem
            </span>
          )}
        </p>
        <div className="markdown rounded border border-border bg-bg p-4 text-sm leading-relaxed">
          <ReactMarkdown>{explanation}</ReactMarkdown>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onShare}
          className="text-xs text-muted hover:text-text underline-offset-2 hover:underline"
        >
          {shareCopied ? 'Link copied!' : 'Copy share link'}
        </button>
        <div className="flex items-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded border border-warn px-3 py-1.5 text-sm text-warn hover:bg-warn/10"
            >
              Try again
            </button>
          )}
          <button
            ref={nextRef}
            type="button"
            onClick={onNext}
            className="rounded border border-accent px-4 py-1.5 text-sm text-accent hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            Next problem →
          </button>
        </div>
      </div>
    </section>
  );
}

function ResultRow({ line }: { line: ResultLine }) {
  const { icon, color, headline } = decorate(line.state);

  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wider text-muted">
        {line.label}
      </div>
      <div className={`flex items-baseline gap-2 ${color}`}>
        <span aria-hidden>{icon}</span>
        <span className="font-medium">{headline}</span>
      </div>
      <div className="text-sm text-muted">
        Your answer: <code className="text-text">{line.userAnswer || '—'}</code>
      </div>
      {line.state !== 'correct' && line.state !== 'parse_error' && (
        <div className="text-sm text-muted">
          Correct answer:{' '}
          <code className="text-text">{line.canonicalAnswer}</code>
        </div>
      )}
      {line.message && (
        <div className="text-sm text-muted italic">{line.message}</div>
      )}
    </div>
  );
}

function decorate(state: ResultStateOrError): {
  icon: string;
  color: string;
  headline: string;
} {
  switch (state) {
    case 'correct':
      return { icon: '✅', color: 'text-ok', headline: 'Correct' };
    case 'almost':
      return { icon: '⚠️', color: 'text-warn', headline: 'Almost' };
    case 'wrong':
      return { icon: '❌', color: 'text-error', headline: 'Wrong' };
    case 'parse_error':
      return {
        icon: '❓',
        color: 'text-muted',
        headline: "Couldn't parse",
      };
  }
}
