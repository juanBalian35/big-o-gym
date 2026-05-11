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
    console.log('[prebuild] no problems.ts yet - skipping validation/highlight.');
    return;
  }

  const { validateProblems } = await import('../src/lib/validate-problems.ts');
  const { problems } = await import('../src/data/problems.ts');
  validateProblems(problems);
  console.log(`[prebuild] validated ${problems.length} problems.`);

  const { DAILY_ORDER } = await import('../src/data/daily-order.ts');
  validateDailyOrder(problems, DAILY_ORDER);
  console.log(`[prebuild] daily-order: ${DAILY_ORDER.length} entries.`);

  const { highlightProblems } = await import('./highlight-problems.ts');
  await highlightProblems(problems);
}

// Daily order must mirror the kind:'code' subset of problems.ts exactly:
// no typos, no stale ids after a rename, no missing problems, no duplicates.
// Run only at build time so editorial drift is caught before deploy.
function validateDailyOrder(
  problems: { id: string; kind: string }[],
  order: readonly string[]
): void {
  const codeIds = new Set(
    problems.filter((p) => p.kind === 'code').map((p) => p.id)
  );
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const id of order) {
    if (!codeIds.has(id)) errors.push(`unknown id in DAILY_ORDER: ${id}`);
    if (seen.has(id)) errors.push(`duplicate id in DAILY_ORDER: ${id}`);
    seen.add(id);
  }
  for (const id of codeIds) {
    if (!seen.has(id)) errors.push(`missing id from DAILY_ORDER: ${id}`);
  }
  if (errors.length > 0) {
    throw new Error(
      `DAILY_ORDER is out of sync with problems.ts:\n  ${errors.join('\n  ')}`
    );
  }
}

main().catch((err) => {
  console.error('[prebuild] failed:', err);
  process.exit(1);
});
