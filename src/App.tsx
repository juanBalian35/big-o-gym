import { useEffect, useState } from 'react';
import { Header } from './components/header';
import { SessionStatsPanel } from './components/session-stats-panel';
import { applyTheme, loadTheme, saveTheme, type Theme } from './lib/theme';
import { problems } from './data/problems';
import { PromptPanel } from './components/prompt-panel';
import { VariablesPanel } from './components/variables-panel';
import { AnswerPanel } from './components/answer-panel';
import { ResultPanel } from './components/result-panel';
import { useProblemFlow } from './hooks/use-problem-flow';
import { buildShareUrl } from './lib/url-routing';
import { track } from './lib/track';

export function App() {
  const {
    currentProblem,
    language,
    setLanguage,
    fields,
    submit,
    next,
    retry,
    goToProblem,
    lastResult,
    solvedCount,
    sessionAttempts,
    isChallengeMode,
    retryUsed,
    reflection,
  } = useProblemFlow();
  const [parseError, setParseError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [theme, setThemeState] = useState<Theme>(() => loadTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function handleThemeChange(next: Theme) {
    setThemeState(next);
    saveTheme(next);
  }

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

  function handleTitleClick() {
    // Only act when we're on a /p/<id> URL — the logo "goes home" by
    // exiting the per-problem path and returning to the random rotation.
    // On / it's a no-op (so the user doesn't lose a half-typed answer).
    if (
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/p/')
    ) {
      handleNext();
    }
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
      // Clipboard unavailable (insecure context, denied permission). Fall
      // back to a prompt so the user can copy manually.
      window.prompt('Copy this link:', url);
    }
  }

  const isCode = currentProblem.kind === 'code';

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={handleThemeChange}
        onTitleClick={handleTitleClick}
        showLanguageToggle={isCode}
      />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
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
          sessionAttempts={sessionAttempts}
          totalCount={problems.length}
          solvedCount={solvedCount}
          onSelectProblem={goToProblem}
        />
      </div>
      <footer className="mx-auto max-w-3xl px-4 pb-8 pt-2 text-xs text-muted">
        made by{' '}
        <a
          href="https://x.com/j3balian"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text hover:text-accent underline-offset-2 hover:underline"
        >
          @j3balian
        </a>
      </footer>
    </div>
  );
}
