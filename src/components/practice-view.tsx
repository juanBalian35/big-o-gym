import { useEffect, useState } from 'react';
import { problems } from '../data/problems';
import { PromptPanel } from './prompt-panel';
import { AnswerPanel } from './answer-panel';
import { ResultPanel } from './result-panel';
import { SessionStatsPanel } from './session-stats-panel';
import { useProblemFlow } from '../hooks/use-problem-flow';
import { readableName } from '../lib/problem-name';
import { buildShareUrl, navigateRace } from '../lib/url-routing';
import { track } from '../lib/track';
import { RACE_SETS } from '../data/race-sets';
import { loadPB } from '../lib/race-storage';
import type { Language } from '../types/problem';
import type { Theme } from '../lib/theme';

interface Props {
  language: Language;
  theme: Theme;
  onSolvedCountChange?: (count: number) => void;
}

export function PracticeView({
  language,
  theme,
  onSolvedCountChange,
}: Props) {
  const {
    currentProblem,
    fields,
    submit,
    next,
    retry,
    goToProblem,
    lastResult,
    solvedCount,
    sessionAttempts,
    lifetimeAttempts,
    isChallengeMode,
    retryUsed,
    reflection,
    nextProblemPreview,
  } = useProblemFlow(language);
  const [parseError, setParseError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    onSolvedCountChange?.(solvedCount);
  }, [solvedCount, onSolvedCountChange]);

  // The header logo dispatches a popstate when leaving /p/<id>. Mirror the
  // pre-routing behavior: leaving challenge mode advances to a fresh problem.
  useEffect(() => {
    function onPop() {
      if (isChallengeMode && window.location.pathname === '/') {
        next();
        setParseError(null);
        setShareCopied(false);
      }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [isChallengeMode, next]);

  function handleSubmit(answers: Record<string, string>) {
    const result = submit(answers);
    if (result.hadParseError) {
      const firstParseLine = result.lines.find(
        (l) => l.state === 'parse_error'
      );
      setParseError(
        firstParseLine?.message ??
          "Couldn't parse that. Try notation like O(n) or O(n log n)."
      );
    } else {
      setParseError(null);
    }
  }

  function handleNext() {
    setParseError(null);
    setShareCopied(false);
    next();
  }

  function handleRetry() {
    setParseError(null);
    retry();
  }

  function handleRaceClick() {
    const hasAnyPB = RACE_SETS.some((s) => loadPB(s.id) !== null);
    track('race_callout_click', { has_pb: hasAnyPB });
    navigateRace(null);
  }

  async function handleShare() {
    track('share', { id: currentProblem.id });
    const url = buildShareUrl(currentProblem.id);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 pb-4 space-y-4">
        {isChallengeMode && (
          <div
            role="note"
            className="rounded-md border border-border bg-panel/60 px-4 py-2 text-xs text-muted"
          >
            <span className="text-accent">→</span> a friend sent you this
            problem
          </div>
        )}
        {reflection && !lastResult && (
          <div
            role="note"
            className="rounded-md border border-border bg-panel/60 px-4 py-2 text-xs text-muted italic"
          >
            <span className="not-italic text-accent">··</span> {reflection}
          </div>
        )}
        <PromptPanel
          problem={currentProblem}
          language={language}
          theme={theme}
        />
        {lastResult ? (
          <ResultPanel
            lines={lastResult.lines}
            explanation={currentProblem.explanation}
            concept={currentProblem.concept}
            isTricky={currentProblem.difficulty === 'hard'}
            onNext={handleNext}
            onShare={handleShare}
            shareCopied={shareCopied}
            onRetry={
              !retryUsed &&
              lastResult.lines.some(
                (l) => l.state === 'almost' || l.state === 'wrong'
              )
                ? handleRetry
                : undefined
            }
            variables={
              currentProblem.kind === 'code'
                ? currentProblem.variables
                : undefined
            }
            nextProblemName={
              nextProblemPreview ? readableName(nextProblemPreview.id) : null
            }
          />
        ) : (
          <AnswerPanel
            fields={fields}
            onSubmit={handleSubmit}
            parseError={parseError}
            disabled={false}
            variables={
              currentProblem.kind === 'code'
                ? currentProblem.variables
                : undefined
            }
          />
        )}
      <SessionStatsPanel
        lifetimeAttempts={lifetimeAttempts}
        sessionAttemptCount={sessionAttempts.length}
        totalCount={problems.length}
        solvedCount={solvedCount}
        onSelectProblem={goToProblem}
      />
      <button
        type="button"
        onClick={handleRaceClick}
        className="group flex w-full items-baseline gap-2 rounded-md border border-border bg-panel/60 px-4 py-3 text-left font-mono text-xs transition-colors hover:border-accent hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        <span className="font-semibold tracking-tight text-accent">
          race mode
        </span>
        <span className="text-[10px] uppercase tracking-wider text-accent">
          (new)
        </span>
        <span className="text-muted">
          — beat the clock, challenge your friends
        </span>
        <span className="ml-auto text-muted transition-colors group-hover:text-accent">
          →
        </span>
      </button>
    </main>
  );
}
