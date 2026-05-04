# CLAUDE.md — Project conventions

- Stack: Vite + React + TypeScript + Tailwind. No Next.js, no SSR.
- No backend, no database, no auth. localStorage only.
- Dark theme only. Monospace, terminal-ish aesthetic.
- TypeScript strict mode. No `any` without explicit justification.
- Tests required for `lib/normalizer/` — pure logic, no excuses.
- React components in `components/`, one component per file, named exports.
- Tailwind for all styling. No CSS modules, no styled-components.
- File naming: `kebab-case` for files, `PascalCase` for components.

## Problem authoring conventions

There are two `kind`s of problem — both go in the same `problems.ts` array and feed the same random rotation:

- **`kind: 'code'`** — show a snippet, ask for time + space complexity. Has `code` (python/javascript), `variables` (declared per below), `time_complexity` (or `method_times[]` for multi-method classes), and `space_complexity`.
- **`kind: 'datastructure'`** — show a short prompt naming a data structure operation; ask for time and (optionally) space. Has `prompt`, `time_complexity`, optional `space_complexity`. No `variables`, no `code`.

Variable conventions apply only to code problems:

- Every problem declares its `variables` (non-empty). Each entry has a short `name` (single letter, lowercase) and a brief english `meaning`.
- Use english descriptions, not code expressions: `'length of the input array'`, not `'len(arr)'`.
- **Grid convention:** `m = number of rows`, `n = number of columns`. Apply consistently across every grid problem.
- **Common conventions:** `n` = array/string length, `v` and `e` = graph vertices and edges, `n` and `m` = two strings (n for the first, m for the second).
- When english is ambiguous (e.g., `n` = array length vs. integer value), add a clarifying clause inside the `meaning` string. Don't switch to code-form.
- Every variable that appears in `time_complexity`, `space_complexity`, or `accepted_equivalent_forms` MUST be declared in `variables` — the build-time validator enforces this.
