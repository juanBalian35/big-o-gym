import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { VariablesPanel } from './variables-panel';
import type { ResultState } from '../types/attempt';
import type { ProblemVariable } from '../types/problem';

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
  variables?: ProblemVariable[];
  nextProblemName?: string | null;
  nextLabel?: string;
  shareLabel?: string;
  solutionShown?: boolean;
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
  variables,
  nextProblemName,
  nextLabel = 'Next problem →',
  shareLabel = 'Copy problem link',
  solutionShown,
}: Props) {
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    nextRef.current?.focus();
  }, []);

  const hasVariables = variables && variables.length > 0;

  return (
    <section className="rounded-md border border-border bg-panel">
      {hasVariables && (
        <div className="px-4 py-3">
          <VariablesPanel variables={variables} />
        </div>
      )}
      <div
        className={`space-y-5 p-4 ${hasVariables ? 'border-t border-border' : ''}`}
      >
        {lines.map((line) =>
          solutionShown ? (
            <SolutionRow key={line.label} line={line} />
          ) : (
            <ResultRow key={line.label} line={line} />
          )
        )}

      <ExplanationBlock
        concept={concept}
        explanation={explanation}
        isTricky={isTricky}
      />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onShare}
            title="Copy a link to this exact problem"
            className="rounded border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-text hover:text-text"
          >
            {shareCopied ? 'Link copied!' : shareLabel}
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
              {nextLabel}
            </button>
          </div>
        </div>
        {nextProblemName && (
          <p className="text-right text-[11px] text-muted">
            up next:{' '}
            <code className="text-text">{nextProblemName}</code>
          </p>
        )}
      </div>
      </div>
    </section>
  );
}

function ExplanationBlock({
  concept,
  explanation,
  isTricky,
}: {
  concept: string;
  explanation: string;
  isTricky?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-accent">
          {concept}
        </h3>
        {isTricky && <span className="text-xs text-warn">▲ tricky</span>}
      </div>
      <div className="markdown text-sm leading-relaxed text-muted">
        <ReactMarkdown>{explanation}</ReactMarkdown>
      </div>
    </div>
  );
}

function ResultRow({ line }: { line: ResultLine }) {
  const { icon, headline, textColor } = decorate(line.state);
  const userDisplay =
    line.userAnswer
      ? line.state === 'parse_error'
        ? line.userAnswer
        : `O(${line.userAnswer})`
      : '-';
  const correctDisplay = line.canonicalAnswer;

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <div className={`flex items-baseline gap-2 ${textColor}`}>
          <span aria-hidden>{icon}</span>
          <span className="font-medium">{headline}</span>
        </div>
        <span className="text-[11px] uppercase tracking-wider text-muted">
          {line.label}
        </span>
      </div>
      <div className="text-sm text-muted">
        Your answer: <code className="text-text">{userDisplay}</code>
        {line.state !== 'correct' && line.state !== 'parse_error' && (
          <>
            {' · '}Correct:{' '}
            <code className="text-text">{correctDisplay}</code>
          </>
        )}
      </div>
      {line.message && (
        <div className="text-sm text-muted italic">{line.message}</div>
      )}
    </div>
  );
}

function SolutionRow({ line }: { line: ResultLine }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-[11px] uppercase tracking-wider text-muted">
        {line.label}
      </span>
      <code className="font-mono text-sm text-text">
        {line.canonicalAnswer}
      </code>
    </div>
  );
}

function decorate(state: ResultStateOrError): {
  icon: string;
  textColor: string;
  headline: string;
} {
  switch (state) {
    case 'correct':
      return { icon: '✅', textColor: 'text-ok', headline: 'Correct' };
    case 'almost':
      return { icon: '⚠️', textColor: 'text-warn', headline: 'Almost' };
    case 'wrong':
      return { icon: '❌', textColor: 'text-error', headline: 'Wrong' };
    case 'parse_error':
      return {
        icon: '❓',
        textColor: 'text-muted',
        headline: "Couldn't parse",
      };
  }
}
