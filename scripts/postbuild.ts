import { problems } from '../src/data/problems.ts';
import { generateStaticPages } from './generate-static-pages.ts';

async function main() {
  await generateStaticPages(problems);
}

main().catch((err) => {
  console.error('[postbuild] failed:', err);
  process.exit(1);
});
