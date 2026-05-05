import { useEffect, useState } from 'react';
import { Header } from './components/header';
import { PracticeView } from './components/practice-view';
import { RaceSetList } from './components/race-set-list';
import { RaceRunner } from './components/race-runner';
import { applyTheme, loadTheme, saveTheme, type Theme } from './lib/theme';
import {
  loadPreferredLanguage,
  savePreferredLanguage,
} from './lib/storage';
import {
  parseRaceRoute,
  navigateHome,
  type RaceRoute,
} from './lib/url-routing';
import type { Language } from './types/problem';

type Route =
  | { kind: 'practice' }
  | { kind: 'race-list' }
  | { kind: 'race-set'; setId: string; vsTimeMs: number | null };

function readRoute(): Route {
  const race = parseRaceRoute();
  if (race) return raceRouteToRoute(race);
  return { kind: 'practice' };
}

function raceRouteToRoute(r: RaceRoute): Route {
  if (r.kind === 'list') return { kind: 'race-list' };
  return { kind: 'race-set', setId: r.setId, vsTimeMs: r.vsTimeMs };
}

export function App() {
  const [route, setRoute] = useState<Route>(() => readRoute());
  const [language, setLanguageState] = useState<Language>(() =>
    loadPreferredLanguage()
  );
  const [theme, setThemeState] = useState<Theme>(() => loadTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    function onPop() {
      setRoute(readRoute());
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function handleThemeChange(next: Theme) {
    setThemeState(next);
    saveTheme(next);
  }

  function handleLanguageChange(next: Language) {
    setLanguageState(next);
    savePreferredLanguage(next);
  }

  function handleTitleClick() {
    if (route.kind !== 'practice') {
      navigateHome();
      return;
    }
    if (
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/p/')
    ) {
      // Practice view watches the URL via its own hook, but the simplest way
      // to "go home" from a /p/<id> link is a real navigation.
      navigateHome();
    }
  }

  // Code-language toggle is only meaningful when a code problem is on screen.
  const showLanguageToggle =
    route.kind === 'practice' || route.kind === 'race-set';

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        onTitleClick={handleTitleClick}
        showLanguageToggle={showLanguageToggle}
      />
      {route.kind === 'practice' && (
        <PracticeView language={language} theme={theme} />
      )}
      {route.kind === 'race-list' && <RaceSetList />}
      {route.kind === 'race-set' && (
        <RaceRunner
          key={`${route.setId}-${route.vsTimeMs ?? 'solo'}`}
          setId={route.setId}
          vsTimeMs={route.vsTimeMs}
          language={language}
          theme={theme}
        />
      )}
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
