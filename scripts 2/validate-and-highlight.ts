// This script runs at build time (prebuild). It will:
//   1. Validate problems.ts via lib/validate-problems.ts
//   2. Pre-render Shiki HTML for each (problem, language) pair into
//      src/data/problems-highlighted.ts
//
// Implemented incrementally as later tickets land.
// Until problems.ts exists, this is a no-op so `npm run build` works.

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const problemsPath = join(here, '..', 'src', 'data', 'problems.ts');

async function main() {
  if (!existsSync(problemsPath)) {
    console.log('[prebuild] no problems.ts yet — skipping validation/highlight.');
    return;
  }

  const { validateProblems } = await import('../src/lib/validate-problems.ts');
  const { problems } = await import('../src/data/problems.ts');
  validateProblems(problems);
  console.log(`[prebuild] validated ${problems.length} problems.`);

  const { highlightProblems } = await import('./highlight-problems.ts');
  await highlightProblems(problems);
}

main().catch((err) => {
  console.error('[prebuild] failed:', err);
  process.exit(1);
});
