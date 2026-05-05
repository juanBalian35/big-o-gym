import type { Language } from '../types/problem';
import type { Theme } from '../lib/theme';

function DumbbellLogo() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="20"
      height="20"
      shape-rendering="crispEdges"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* left O weight */}
      <rect x="2" y="8" width="8" height="2" className="fill-accent" />
      <rect x="2" y="22" width="8" height="2" className="fill-accent" />
      <rect x="2" y="10" width="2" height="12" className="fill-accent" />
      <rect x="8" y="10" width="2" height="12" className="fill-accent" />
      {/* bar */}
      <rect x="10" y="14" width="12" height="4" className="fill-text" />
      {/* right O weight */}
      <rect x="22" y="8" width="8" height="2" className="fill-accent" />
      <rect x="22" y="22" width="8" height="2" className="fill-accent" />
      <rect x="22" y="10" width="2" height="12" className="fill-accent" />
      <rect x="28" y="10" width="2" height="12" className="fill-accent" />
    </svg>
  );
}

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  onTitleClick?: () => void;
  showLanguageToggle?: boolean;
  solvedCount?: number;
  totalCount?: number;
}

export function Header({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  onTitleClick,
  showLanguageToggle = true,
  solvedCount,
  totalCount,
}: Props) {
  const showProgress =
    typeof solvedCount === 'number' && typeof totalCount === 'number';
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onTitleClick}
          disabled={!onTitleClick}
          aria-label={onTitleClick ? 'Go to home' : undefined}
          className="flex min-w-0 flex-col leading-tight text-left disabled:cursor-default"
        >
          <div className="flex items-center gap-2 min-w-0">
            <DumbbellLogo />
            <h1 className="truncate text-sm font-semibold tracking-tight">
              big-o-gym
            </h1>
            {showProgress && (
              <span className="ml-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted tabular-nums">
                <span className="text-text">{solvedCount}</span>
                <span className="opacity-60"> / {totalCount}</span>
              </span>
            )}
          </div>
          <p className="hidden sm:block text-[10px] text-muted mt-0.5 opacity-80">
            Read the code, type the complexity, learn what trips you up.
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          {showLanguageToggle && (
            <LanguageToggle
              language={language}
              onLanguageChange={onLanguageChange}
            />
          )}
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        </div>
      </div>
    </header>
  );
}

function ThemeToggle({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}) {
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => onThemeChange(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="rounded border border-border px-2 py-1 text-sm font-bold text-muted hover:text-text transition-colors"
    >
      {theme === 'dark' ? '◐' : '○'}
    </button>
  );
}

function LanguageToggle({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Code language"
      className="flex rounded border border-border overflow-hidden text-xs"
    >
      <ToggleButton
        active={language === 'python'}
        onClick={() => onLanguageChange('python')}
      >
        python
      </ToggleButton>
      <ToggleButton
        active={language === 'javascript'}
        onClick={() => onLanguageChange('javascript')}
      >
        javascript
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1 transition-colors ${
        active
          ? 'bg-accent/15 text-accent'
          : 'text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}
