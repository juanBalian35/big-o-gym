import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Problem } from '../src/types/problem.ts';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, '..', 'dist');
const SITE_ORIGIN = 'https://bigogym.io';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

function readableName(id: string): string {
  return id
    .replace(/^twist-|^special-|^ds-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function staticBodyForProblem(p: Problem): string {
  if (p.kind === 'code') {
    const variables = p.variables
      .map(
        (v) =>
          `<li><code>${escapeHtml(v.name)}</code> — ${escapeHtml(v.meaning)}</li>`
      )
      .join('');
    return `
    <header>
      <h1>Big O Gym</h1>
      <p>Read the code, type the complexity, learn what trips you up.</p>
    </header>
    <main>
      <h2>${escapeHtml(readableName(p.id))}</h2>
      <p><strong>Concept:</strong> ${escapeHtml(p.concept)}</p>
      <pre><code>${escapeHtml(p.code.python)}</code></pre>
      <h3>Variables</h3>
      <ul>${variables}</ul>
      <h3>Explanation</h3>
      <p>${escapeHtml(p.explanation)}</p>
    </main>`;
  }
  return `
    <header>
      <h1>Big O Gym</h1>
      <p>Read the code, type the complexity, learn what trips you up.</p>
    </header>
    <main>
      <h2>Data structure question</h2>
      <p>${escapeHtml(p.prompt)}</p>
      <p><strong>Concept:</strong> ${escapeHtml(p.concept)}</p>
      <p>${escapeHtml(p.explanation)}</p>
    </main>`;
}

function staticBodyForHome(): string {
  return `
    <header>
      <h1>Big O Gym</h1>
      <p>Read the code, type the complexity, learn what trips you up.</p>
    </header>
    <main>
      <h2>Free interview prep for time and space complexity analysis</h2>
      <p>
        Big O Gym is a free practice tool for engineers preparing for
        technical interviews. Read a code snippet in Python or JavaScript,
        type your guess for the time and space complexity, and get instant
        feedback on whether you got it right, almost right (you forgot to
        simplify), or wrong (and why).
      </p>
      <h3>What you'll practice</h3>
      <ul>
        <li>Recognizing common complexity classes — O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ).</li>
        <li>Multivariable analysis — graph traversals (V + E), matrix problems (m · n), edit-distance (n · m).</li>
        <li>"Looks like A but is B" twists — hidden array shifts, immutable string concatenation, doubling inner loops.</li>
        <li>Amortized analysis — dynamic array push, LRU cache, hashmap operations.</li>
        <li>Per-method complexity for class-shaped problems — LRU, Trie, MedianFinder.</li>
      </ul>
      <p>56 problems. Free. No signup.</p>
    </main>`;
}

interface PageMeta {
  title: string;
  description: string;
  url: string;
  body: string;
  jsonLd?: string;
}

function applyMeta(template: string, meta: PageMeta): string {
  let out = template;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  out = replaceMeta(out, 'name', 'description', meta.description);
  out = replaceMeta(out, 'property', 'og:title', meta.title);
  out = replaceMeta(out, 'property', 'og:description', meta.description);
  out = replaceMeta(out, 'property', 'og:url', meta.url);
  out = replaceMeta(out, 'name', 'twitter:title', meta.title);
  out = replaceMeta(out, 'name', 'twitter:description', meta.description);
  if (out.includes('rel="canonical"')) {
    out = out.replace(
      /<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${escapeAttr(meta.url)}" />`
    );
  } else {
    out = out.replace(
      '</head>',
      `    <link rel="canonical" href="${escapeAttr(meta.url)}" />\n  </head>`
    );
  }
  if (meta.jsonLd) {
    out = out.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n${meta.jsonLd}\n    </script>`
    );
  }
  out = out.replace(
    '<div id="root"></div>',
    `<div id="root">${meta.body}</div>`
  );
  return out;
}

function jsonLdForProblem(p: Problem, url: string): string {
  const isCode = p.kind === 'code';
  const learningResource = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: isCode ? readableName(p.id) : 'Big O complexity quiz',
    description: isCode
      ? `Practice the time and space complexity of ${readableName(p.id)} — concept tested: ${p.concept}.`
      : p.prompt,
    url,
    educationalUse: 'practice',
    learningResourceType: isCode ? 'code reading exercise' : 'quiz question',
    teaches: p.concept,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebApplication',
      name: 'Big O Gym',
      url: SITE_ORIGIN + '/',
    },
    isAccessibleForFree: true,
  };
  return JSON.stringify(learningResource, null, 2);
}

function replaceMeta(
  src: string,
  attrKind: 'name' | 'property',
  key: string,
  value: string
): string {
  const escaped = key.replace(/:/g, '\\:');
  const re = new RegExp(
    `(<meta\\s+${attrKind}="${escaped}"\\s+content=")[^"]*(")`,
    'i'
  );
  return src.replace(re, `$1${escapeAttr(value)}$2`);
}

export async function generateStaticPages(problems: Problem[]): Promise<void> {
  const baseHtml = await readFile(join(distDir, 'index.html'), 'utf8');

  // Home page — enrich with static SEO body.
  const homeHtml = applyMeta(baseHtml, {
    title: 'Big O Gym — practice time and space complexity for interviews',
    description:
      'Free tool for practicing time and space complexity analysis on code snippets in Python and JavaScript. Designed for technical interview prep — type the answer, get instant feedback.',
    url: `${SITE_ORIGIN}/`,
    body: staticBodyForHome(),
  });
  await writeFile(join(distDir, 'index.html'), homeHtml, 'utf8');

  // Per-problem pages.
  for (const p of problems) {
    const name = readableName(p.id);
    const isCode = p.kind === 'code';
    const title = `${isCode ? name : 'Quiz'} — Big O Gym`;
    const description = isCode
      ? `Practice the time and space complexity of ${name} in Python and JavaScript. Concept tested: ${p.concept}.`
      : `${p.prompt} Practice this and 55 other complexity problems on Big O Gym.`;

    const url = `${SITE_ORIGIN}/p/${p.id}`;
    const html = applyMeta(baseHtml, {
      title,
      description,
      url,
      body: staticBodyForProblem(p),
      jsonLd: jsonLdForProblem(p, url),
    });

    const outDir = join(distDir, 'p', p.id);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), html, 'utf8');
  }

  // sitemap.xml — one entry per page.
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_ORIGIN}/`, priority: '1.0' },
    ...problems.map((p) => ({
      loc: `${SITE_ORIGIN}/p/${p.id}`,
      priority: '0.7',
    })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join('\n')}
</urlset>
`;
  await writeFile(join(distDir, 'sitemap.xml'), sitemap, 'utf8');

  console.log(
    `[postbuild] generated ${problems.length} per-problem pages + enriched home + sitemap (${urls.length} URLs).`
  );
}
