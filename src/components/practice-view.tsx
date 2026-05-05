import { useEffect, useState } from 'react';
import { problems } from '../data/problems';
import { PromptPanel } from './prompt-panel';
import { VariablesPanel } from './variables-panel';
import { AnswerPanel } from './answer-panel';
import { ResultPanel } from './result-panel';
import { SessionStatsPanel } from './session-stats-panel';
import { RaceCallout } from './race-callout';
import { useProblemFlow } from '../hooks/use-problem-flow';
import { buildShareUrl } from '../lib/url-routing';
import { track } from '../lib/track';
import type { Language } from '../types/problem';
import type { Theme } from '../lib/theme';

interface Props {
  language: Language;
  theme: Theme;
}

export function PracticeView({ language, theme }: Props) {
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
  } = useProblemFlow(language);
  const [parseError, setParseError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

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

  const isCode = currentProblem.kind === 'code';

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        {!lastResult && <RaceCallout />}
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
        {isCode && <VariablesPanel variables={currentProblem.variables} />}
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
              !retryUsed && lastResult.lines.some((l) => l.state === 'almost')
                ? handleRetry
                : undefined
            }
          />
        ) : (
          <AnswerPanel
            fields={fields}
            onSubmit={handleSubmit}
            parseError={parseError}
            disabled={false}
          />
        )}
      </main>
      <div className="mx-auto max-w-3xl px-4 pb-4">
        <SessionStatsPanel
          lifetimeAttempts={lifetimeAttempts}
          sessionAttemptCount={sessionAttempts.length}
          totalCount={problems.length}
          solvedCount={solvedCount}
          onSelectProblem={goToProblem}
        />
      </div>
    </>
  );
}
