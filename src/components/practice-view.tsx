import { useEffect, useState } from 'react';
import { problems } from '../data/problems';
import { PromptPanel } from './prompt-panel';
import { AnswerPanel } from './answer-panel';
import { ResultPanel } from './result-panel';
import { SessionStatsPanel } from './session-stats-panel';
import { useProblemFlow } from '../hooks/use-problem-flow';
import { readableName } from '../lib/problem-name';
import {
  buildShareUrl,
  navigateHome,
  navigateRace,
  navigateToDaily,
} from '../lib/url-routing';
import { track } from '../lib/track';
import { RACE_SETS } from '../data/race-sets';
import { loadPB } from '../lib/race-storage';
import type { Language } from '../types/problem';
import type { Theme } from '../lib/theme';

interface Props {
  language: Language;
  theme: Theme;
  isDaily?: boolean;
  onSolvedCountChange?: (count: number) => void;
}

export function PracticeView({
  language,
  theme,
  isDaily = false,
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
    raceNudge,
    welcomeBack,
    dailyDate,
    dailySolvedToday,
    dailyHasStreak,
    dailyStreak,
    nextProblemPreview,
    revealSolution,
  } = useProblemFlow(language, isDaily);
  const streakCopy = dailyHasStreak
    ? `keep your ${dailyStreak}-day streak`
    : 'start a daily streak';
  const [parseError, setParseError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    onSolvedCountChange?.(solvedCount);
  }, [solvedCount, onSolvedCountChange]);

  // Fire nudge_shown when the race nudge first becomes visible (between
  // problems, before the user has submitted again).
  const nudgeVisible = raceNudge !== null && lastResult === null;
  useEffect(() => {
    if (nudgeVisible) {
      track('nudge_shown', { kind: 'try_races', solved_count: solvedCount });
    }
  }, [nudgeVisible, solvedCount]);

  // First-impression hint: brand-new visitor (no lifetime attempts yet) on a
  // normal practice problem. Tells them what they're supposed to do before
  // they bounce on the input field.
  const firstVisitHint =
    lifetimeAttempts.length === 0 &&
    sessionAttempts.length === 0 &&
    !isChallengeMode &&
    !isDaily &&
    !lastResult;
  useEffect(() => {
    if (firstVisitHint) {
      track('nudge_shown', { kind: 'first_visit' });
    }
  }, [firstVisitHint]);

  // Daily-problem banner: shown until the user solves today's daily, except
  // when they're already in /daily mode, in challenge mode, or seeing the
  // first-visit hint (a brand-new user shouldn't be hit with daily-streak
  // language they haven't earned context for yet). Also yields to reflection
  // and to the race nudge.
  const dailyVisible =
    !dailySolvedToday &&
    !isChallengeMode &&
    !isDaily &&
    !firstVisitHint &&
    !reflection &&
    raceNudge === null;
  useEffect(() => {
    if (dailyVisible) {
      track('nudge_shown', { kind: 'daily' });
    }
  }, [dailyVisible]);

  // Welcome-back banner impression tracking - paired with the existing
  // nudge_shown events so all banner surfaces are measurable.
  const welcomeBackVisible = welcomeBack !== null;
  useEffect(() => {
    if (welcomeBackVisible) {
      track('nudge_shown', { kind: 'welcome_back' });
    }
  }, [welcomeBackVisible]);

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
    track('share', { id: currentProblem.id, kind: isDaily ? 'daily' : 'problem' });
    // Daily shares the bare /daily URL - recipients land on whatever today's
    // problem is, not the specific id (which would just funnel them into
    // challenge mode for a stale problem tomorrow).
    const url = isDaily
      ? `${window.location.origin}/daily`
      : buildShareUrl(currentProblem.id);
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
        {isDaily && !isChallengeMode && (
          <div
            role="note"
            className="rounded-md border border-border bg-panel/60 px-4 py-2 text-xs text-muted"
          >
            <span className="text-accent">→</span> today's problem
            <span className="opacity-60"> · {dailyDate}</span>
            {dailySolvedToday && (
              <span className="text-accent"> · solved</span>
            )}
          </div>
        )}
        {dailyVisible && (
          <div
            role="note"
            className="rounded-md border border-border bg-panel/60 px-4 py-2 text-xs text-muted italic"
          >
            <span className="not-italic text-accent">··</span> today's problem
            not solved yet -{' '}
            <button
              type="button"
              onClick={() => {
                track('nudge_clicked', { kind: 'daily' });
                navigateToDaily();
              }}
              className="not-italic text-accent underline underline-offset-2 hover:opacity-80"
            >
              solve to {streakCopy}
            </button>
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
        {welcomeBack && (
          <div
            role="note"
            className="rounded-md border border-border bg-panel/60 px-4 py-2 text-xs text-muted italic"
          >
            <span className="not-italic text-accent">··</span> {welcomeBack}
          </div>
        )}
        {firstVisitHint && (
          <div
            role="note"
            className="rounded-md border border-accent/40 bg-accent/5 px-4 py-2 text-xs text-muted"
          >
            <span className="text-accent">→</span> read the code below, then
            type its time and space complexity (e.g. n, n log n, n²). we'll
            grade after you submit.
          </div>
        )}
        {nudgeVisible && (
          <div
            role="note"
            className="rounded-md border border-border bg-panel/60 px-4 py-2 text-xs text-muted italic"
          >
            <span className="not-italic text-accent">··</span> {raceNudge} -{' '}
            <button
              type="button"
              onClick={() => {
                track('nudge_clicked', {
                  kind: 'try_races',
                  solved_count: solvedCount,
                });
                navigateRace(null);
              }}
              className="not-italic text-accent underline underline-offset-2 hover:opacity-80"
            >
              race a set against the clock
            </button>
          </div>
        )}
        <PromptPanel
          problem={currentProblem}
          language={language}
          theme={theme}
        />
        {isDaily && dailySolvedToday && !lastResult ? (
          <section className="rounded-md border border-border bg-panel p-6 space-y-3 text-center">
            <p className="text-sm text-accent">
              ★ today's daily is done
            </p>
            <p className="text-sm text-muted">
              {dailyStreak > 0
                ? `${dailyStreak}-day streak going. Come back tomorrow for the next problem.`
                : 'Come back tomorrow for the next problem.'}
            </p>
            <button
              type="button"
              onClick={navigateHome}
              className="rounded border border-accent px-4 py-1.5 text-sm text-accent hover:bg-accent/10"
            >
              Back to practice mode →
            </button>
          </section>
        ) : lastResult ? (
          <ResultPanel
            lines={lastResult.lines}
            explanation={currentProblem.explanation}
            concept={currentProblem.concept}
            isTricky={currentProblem.difficulty === 'hard'}
            onNext={isDaily ? navigateHome : handleNext}
            onShare={handleShare}
            shareCopied={shareCopied}
            onRetry={
              !retryUsed &&
              !lastResult.solutionShown &&
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
              isDaily
                ? null
                : nextProblemPreview
                  ? readableName(nextProblemPreview.id)
                  : null
            }
            nextLabel={isDaily ? 'Back to practice mode →' : undefined}
            shareLabel={isDaily ? 'Share daily problem' : undefined}
            solutionShown={lastResult.solutionShown}
          />
        ) : (
          <AnswerPanel
            fields={fields}
            onSubmit={handleSubmit}
            onShowSolution={
              isDaily || isChallengeMode ? undefined : revealSolution
            }
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
      {!isDaily && (
        <button
          type="button"
          onClick={dailySolvedToday ? undefined : navigateToDaily}
          disabled={dailySolvedToday}
          className={`group flex w-full items-baseline gap-2 rounded-md border border-border bg-panel/60 px-4 py-3 text-left font-mono text-xs transition-colors focus:outline-none ${
            dailySolvedToday
              ? 'cursor-default opacity-60'
              : 'hover:border-accent hover:bg-accent/5 focus:ring-2 focus:ring-accent/40'
          }`}
        >
          <span className="font-semibold tracking-tight text-accent">
            daily problem
          </span>
          <span className="text-muted">
            {dailySolvedToday
              ? '- solved! come back tomorrow'
              : `- today's pick, solve it to ${streakCopy}`}
          </span>
          {!dailySolvedToday && (
            <span className="ml-auto text-muted transition-colors group-hover:text-accent">
              →
            </span>
          )}
        </button>
      )}
      {isDaily && (
        <button
          type="button"
          onClick={navigateHome}
          className="group flex w-full items-baseline gap-2 rounded-md border border-border bg-panel/60 px-4 py-3 text-left font-mono text-xs transition-colors hover:border-accent hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <span className="font-semibold tracking-tight text-accent">
            practice mode
          </span>
          <span className="text-muted">- random problems, no clock</span>
          <span className="ml-auto text-muted transition-colors group-hover:text-accent">
            →
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={handleRaceClick}
        className="group flex w-full items-baseline gap-2 rounded-md border border-border bg-panel/60 px-4 py-3 text-left font-mono text-xs transition-colors hover:border-accent hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        <span className="font-semibold tracking-tight text-accent">
          race mode
        </span>
        <span className="text-muted">
          - beat the clock, challenge your friends
        </span>
        <span className="ml-auto text-muted transition-colors group-hover:text-accent">
          →
        </span>
      </button>
    </main>
  );
}
