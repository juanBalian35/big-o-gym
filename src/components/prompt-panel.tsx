import { useEffect, useState } from 'react';
import type { Language, Problem } from '../types/problem';
import type { HighlightedProblem } from '../data/problems-highlighted';
import type { Theme } from '../lib/theme';
import { buildShareUrl } from '../lib/url-routing';
import { track } from '../lib/track';

interface Props {
  problem: Problem;
  language: Language;
  theme: Theme;
}

let cachedMap: Record<string, HighlightedProblem> | null = null;
let pending: Promise<Record<string, HighlightedProblem>> | null = null;

function loadHighlights(): Promise<Record<string, HighlightedProblem>> {
  if (cachedMap) return Promise.resolve(cachedMap);
  if (!pending) {
    pending = import('../data/problems-highlighted').then((m) => {
      cachedMap = m.highlightedProblems;
      return cachedMap;
    });
  }
  return pending;
}

export function PromptPanel({ problem, language, theme }: Props) {
  if (problem.kind === 'datastructure') {
    return (
      <section className="rounded-md border border-border bg-panel">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-xs uppercase tracking-wider text-muted">
            data structure question
          </span>
          <CopyLinkSlug id={problem.id} />
        </div>
        <div className="px-6 py-8 text-base leading-relaxed">
          {problem.prompt}
        </div>
      </section>
    );
  }

  return <CodeView problem={problem} language={language} theme={theme} />;
}

function CodeView({
  problem,
  language,
  theme,
}: {
  problem: Extract<Problem, { kind: 'code' }>;
  language: Language;
  theme: Theme;
}) {
  const [highlightMap, setHighlightMap] = useState<
    Record<string, HighlightedProblem> | null
  >(cachedMap);

  useEffect(() => {
    if (cachedMap) return;
    let cancelled = false;
    loadHighlights().then((map) => {
      if (!cancelled) setHighlightMap(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const html = highlightMap?.[problem.id]?.[language]?.[theme];

  return (
    <section className="rounded-md border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs uppercase tracking-wider text-muted">
          {language}
        </span>
        <CopyLinkSlug id={problem.id} />
      </div>
      <div className="code-panel-body p-4 text-sm leading-relaxed overflow-x-auto">
        {html ? (
          <div
            className="shiki-host"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="font-mono text-text whitespace-pre">
            {problem.code[language]}
          </pre>
        )}
      </div>
    </section>
  );
}

function CopyLinkSlug({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const slug = id.replace(/-/g, '_');

  async function handleCopy() {
    const url = buildShareUrl(id);
    track('share', { id });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy link to this problem"
      className="font-mono text-xs text-muted transition-colors hover:text-accent"
    >
      {copied ? 'link copied!' : slug}
    </button>
  );
}
