# Tickets — Complexity Practice Tool MVP

> Ordered for serial execution. Each ticket is scoped to be completable independently with the prior tickets done. Acceptance criteria are explicit so Claude Code can verify completion.

---

## Ticket 1 — Project setup ✅

**Goal:** A working Vite + React + TypeScript + Tailwind project deployed to a live URL.

**Tasks:**
- Initialize a new Vite project with React + TypeScript template
- Add Tailwind CSS following the official Vite + Tailwind guide
- Configure TypeScript with strict mode enabled
- Set up Vitest for unit testing (we'll need it for the normalizer)
- Set up ESLint + Prettier with sensible defaults
- Create a basic `App.tsx` showing "Complexity Practice — Coming Soon" so deployment can be verified
- Set up the project for static deployment to either Cloudflare Pages or Vercel
- Create a `README.md` with setup instructions
- Create a `CLAUDE.md` documenting project conventions (see "CLAUDE.md content" below)
- Create a `DECISIONS.md` to log non-obvious choices as we go (start it with: SPA over Next.js, no auth, localStorage only, dark theme only, free-form input with normalizer)

**File structure:**
```
src/
  components/    # React components
  lib/           # Pure logic (normalizer goes here)
  data/          # problems.ts and content
  hooks/         # custom React hooks
  types/         # shared TS types
  App.tsx
  main.tsx
  index.css      # Tailwind directives
```

**CLAUDE.md content (initial version):**
- Stack: Vite + React + TypeScript + Tailwind. No Next.js, no SSR.
- No backend, no database, no auth. localStorage only.
- Dark theme only. Monospace, terminal-ish aesthetic.
- TypeScript strict mode. No `any` without explicit justification.
- Tests required for `lib/normalizer/` — pure logic, no excuses.
- React components in `components/`, one component per file, named exports.
- Tailwind for all styling. No CSS modules, no styled-components.
- File naming: `kebab-case` for files, `PascalCase` for components.

**Acceptance criteria:**
- `npm run dev` starts the dev server without errors
- `npm run build` produces a working static build
- `npm run test` runs Vitest (no tests yet but the runner works)
- The project deploys successfully and "Coming Soon" is visible on the live URL
- `CLAUDE.md` and `DECISIONS.md` exist with the content above

---

## Ticket 2 — Problem schema and seed data ✅

**Goal:** A typed problem schema, build-time validation, and 5 hand-authored seed problems for testing the rest of the app.

**Tasks:**
- Create `src/types/problem.ts` with the `Problem` type matching the spec:
  ```ts
  export type Language = 'python' | 'javascript';
  export type Difficulty = 'easy' | 'medium' | 'hard';

  export interface Problem {
    id: string;
    code: { python: string; javascript: string };
    time_complexity: string;
    space_complexity: string;
    accepted_equivalent_forms?: {
      time?: string[];
      space?: string[];
    };
    explanation: string;        // markdown
    topic_tags: string[];
    difficulty: Difficulty;
  }
  ```
- Create `src/types/attempt.ts` with the `Attempt` type:
  ```ts
  export type ResultState = 'correct' | 'almost' | 'wrong';

  export interface Attempt {
    problem_id: string;
    language_shown: Language;
    time_answer: string;
    space_answer: string;
    time_result: ResultState;
    space_result: ResultState;
    timestamp: string;  // ISO date
  }
  ```
- Create `src/data/problems.ts` exporting `export const problems: Problem[] = [...]` with 5 seed problems covering: a clear O(n), a clear O(n²) nested loop, a binary search O(log n), a recursive Fibonacci O(2ⁿ), and a multivariable problem (BFS-style O(V + E) or matrix O(m · n)). Each must have both Python and JS code versions.
- Create `src/lib/validate-problems.ts` — a function that runtime-validates the problems array (unique IDs, non-empty code for both languages, non-empty explanation, valid difficulty enum). Throw on invalid.
- Add a `prebuild` script in `package.json` that runs the validator before building. Build fails if validation fails.

**Acceptance criteria:**
- `problems.ts` exists with 5 problems, all fields populated
- Type errors if any problem is malformed at compile time
- `npm run build` runs `validate-problems` and fails if a problem is invalid (test by temporarily corrupting one)
- All 5 problems have plausible code in both Python and JavaScript with the same complexity

---

## Ticket 3 — Complexity normalizer (the core) ✅

**Goal:** A pure TypeScript module that parses a complexity expression, simplifies it, and classifies a user's answer as correct / almost / wrong against a canonical answer.

**This is the most important ticket. Build it in isolation with comprehensive tests before any UI work.**

**Tasks:**
- Create `src/lib/normalizer/` directory with:
  - `tokenizer.ts` — converts input string to tokens
  - `parser.ts` — converts tokens to AST
  - `simplifier.ts` — applies simplification rules to AST
  - `comparator.ts` — compares two simplified ASTs for equality
  - `classifier.ts` — top-level entry point: takes user input + canonical answer, returns `{ result: ResultState, message?: string }`
  - `index.ts` — public exports
  - `__tests__/` directory with extensive Vitest test files

**AST shape (suggestion, refine as needed):**
```ts
type Node =
  | { type: 'const'; value: number }
  | { type: 'var'; name: string }
  | { type: 'sum'; terms: Node[] }
  | { type: 'product'; factors: Node[] }
  | { type: 'power'; base: Node; exponent: Node }
  | { type: 'log'; arg: Node };  // base normalized away
```

**Required test cases (minimum — add more as edge cases come up):**

*Syntactic equivalence (should be `correct`):*
- `O(n)` vs `n` → correct
- `O(n)` vs `O( n )` → correct
- `O(N)` vs `O(n)` → correct (case)
- `O(n^2)` vs `O(n²)` → correct
- `O(n*n)` vs `O(n²)` → correct
- `O(n log n)` vs `O(n*log(n))` → correct
- `O(log n)` vs `O(log₂ n)` → correct
- `O(log n)` vs `O(lg n)` → correct
- `O(log n)` vs `O(ln n)` → correct (interview convention: base doesn't matter)
- `Θ(n)` vs `O(n)` → correct (MVP treats as same)

*Simplifications (should be `almost`):*
- `O(2n)` vs `O(n)` → almost, message mentions dropping the constant
- `O(5)` vs `O(1)` → almost
- `O(n + log n)` vs `O(n)` → almost, message mentions dropping the dominated term
- `O(n² + n)` vs `O(n²)` → almost
- `O(3n²)` vs `O(n²)` → almost
- `O(2^n + n²)` vs `O(2^n)` → almost (exponential dominates polynomial)

*Wrong answers:*
- `O(n)` vs `O(n²)` → wrong
- `O(log n)` vs `O(n)` → wrong
- `O(n²)` vs `O(n log n)` → wrong

*Multivariable (no dominance):*
- `O(n + m)` vs `O(n + m)` → correct
- `O(m + n)` vs `O(n + m)` → correct (commutative)
- `O(n*m)` vs `O(m*n)` → correct
- `O(n + m)` vs `O(max(n, m))` → wrong (without `accepted_equivalent_forms`)

*Edge cases:*
- Empty string → parse error, not a wrong answer
- "linear" → parse error, not a wrong answer
- `O(n^n)` and `O(n!)` parse and compare correctly
- Whitespace-only input → parse error

**Classifier signature:**
```ts
export function classifyAnswer(
  userInput: string,
  canonicalAnswer: string,
  acceptedEquivalents?: string[]
): { result: 'correct' | 'almost' | 'wrong' | 'parse_error'; message?: string };
```

**Acceptance criteria:**
- All test cases pass
- Test coverage is high — every simplification rule and every comparison branch covered
- The module has zero React or DOM dependencies — pure logic only
- Public API documented in `index.ts` with JSDoc comments

---

## Ticket 4 — localStorage persistence layer ✅

**Goal:** A typed wrapper around localStorage for attempts and user preferences, with safe handling of missing data and parse errors.

**Tasks:**
- Create `src/lib/storage/` with:
  - `attempts.ts` — `loadAttempts(): Attempt[]`, `saveAttempt(a: Attempt): void`, `clearAttempts(): void`
  - `preferences.ts` — `loadPreferredLanguage(): Language`, `savePreferredLanguage(lang: Language): void`. Default is `'python'` if nothing stored.
  - `index.ts` — public exports
- Wrap all localStorage access in try/catch. If localStorage is unavailable (private browsing, disabled), gracefully fall back to in-memory state (the user can still play, they just lose data on reload).
- Use a versioned key prefix: `complexity-practice:v1:attempts`, `complexity-practice:v1:preferences`. Lets us migrate cleanly later.
- Add tests for the storage module using a localStorage mock.

**Acceptance criteria:**
- Tests pass for all CRUD operations
- Loading from empty storage returns sensible defaults (empty array for attempts, `'python'` for language)
- Corrupted JSON in storage is detected and the storage is reset rather than crashing the app
- The module has no React dependencies — usable from anywhere

---

## Ticket 5 — Code panel component ✅

**Goal:** A component that renders a syntax-highlighted code snippet given a `Problem` and the current language.

**Tasks:**
- Create `src/components/code-panel.tsx`
- Props: `{ problem: Problem; language: Language }`
- Renders the correct language's code, syntax-highlighted using Shiki
- **Build-time pre-rendering:** create `scripts/highlight-problems.ts` that runs at build time, takes `problems.ts`, and produces `problems-highlighted.ts` with pre-rendered HTML for each (problem, language) pair. The component renders the pre-rendered HTML via `dangerouslySetInnerHTML`, avoiding shipping Shiki to the browser.
- Use a dark theme (Shiki's `github-dark` or `one-dark-pro` are good defaults — pick one)
- Style the container: monospace, generous padding, rounded corners, subtle border. Match the terminal aesthetic.
- Show a small label above the code with the language name

**Acceptance criteria:**
- Both Python and JavaScript snippets render with correct syntax highlighting
- Bundle does not include Shiki runtime (verify by inspecting build output)
- Switching `language` prop updates the displayed snippet correctly
- Container has appropriate dark-theme styling matching the terminal aesthetic

---

## Ticket 6 — Answer panel component ✅

**Goal:** Two text inputs for time and space complexity, with submit gating and notation hints.

**Tasks:**
- Create `src/components/answer-panel.tsx`
- Props: `{ onSubmit: (answers: { time: string; space: string }) => void; disabled?: boolean }`
- Two labeled text inputs: "Time complexity" and "Space complexity"
- Below each input, a small muted hint: `examples: O(n), O(n log n), O(n + m), O(n²)`
- A "Submit" button below both inputs, disabled when either field is empty or when `disabled` prop is true
- Inputs are monospace
- Pressing Enter in either input submits if both fields are filled
- Reset internal state when `disabled` transitions from true to false (so the inputs clear when moving to the next problem)

**Acceptance criteria:**
- Submit is disabled until both fields have content
- Enter key submits when both fields are filled
- Visual style matches the terminal aesthetic — monospace inputs, dark backgrounds, subtle borders
- Component is keyboard-navigable (tab between inputs, tab to submit)
- Inputs clear when the parent transitions back to "ready for next problem" state

---

## Ticket 7 — Result panel component ✅

**Goal:** Display the outcome of a submission with appropriate styling for the three states.

**Tasks:**
- Create `src/components/result-panel.tsx`
- Props:
  ```ts
  {
    timeResult: { state: ResultState | 'parse_error'; userAnswer: string; canonicalAnswer: string; message?: string };
    spaceResult: { state: ResultState | 'parse_error'; userAnswer: string; canonicalAnswer: string; message?: string };
    explanation: string;  // markdown
    onNext: () => void;
  }
  ```
- For each of time and space, render:
  - Status icon: ✅ correct (green), ⚠️ almost (amber), ❌ wrong (red), ❓ parse error (neutral)
  - "Your answer: `<userAnswer>`"
  - "Correct answer: `<canonicalAnswer>`" — only shown if not correct
  - The `message` (if present) — for "almost" results explaining what to simplify
- Below both results, render the `explanation` markdown. Use a markdown renderer like `react-markdown` (acceptable dependency for this).
- A "Next problem" button at the bottom

**Acceptance criteria:**
- All three (four including parse_error) states render with distinct colors and icons
- Markdown in explanation renders correctly (headings, lists, inline code, code blocks)
- Component is purely presentational — no localStorage, no problem-selection logic
- "Next problem" button calls `onNext` when clicked

---

## Ticket 8 — Problem selection logic ✅

**Goal:** A function and hook that picks the next problem given the current attempt history.

**Tasks:**
- Create `src/lib/problem-selection.ts`:
  ```ts
  export function selectNextProblem(
    allProblems: Problem[],
    lastShownProblemId: string | null
  ): Problem;
  ```
- Logic: pick a random problem, but never the same as `lastShownProblemId`. If only one problem exists, return it (edge case for tests).
- Create `src/hooks/use-problem-flow.ts`:
  - Manages current problem state, current language, submission state, attempt history
  - Exposes: `currentProblem`, `language`, `setLanguage`, `submit(answers)`, `next()`, `lastResult`
  - Uses the storage module to load and save attempts and language preference
  - Uses the normalizer to classify answers
- Add tests for the selection logic (mock the random source for determinism).

**Acceptance criteria:**
- `selectNextProblem` never returns the same problem twice in a row
- The hook correctly orchestrates: load preferences → pick problem → accept submission → save attempt → wait for next() → pick new problem
- Language preference changes persist across reloads
- Tests pass for the selection function with deterministic randomness

---

## Ticket 9 — Header with language toggle ✅

**Goal:** A simple top bar with the product name and a Python/JavaScript toggle.

**Tasks:**
- Create `src/components/header.tsx`
- Props: `{ language: Language; onLanguageChange: (lang: Language) => void }`
- Left side: product name (decide on naming during this ticket — placeholder "ComplexityPractice" is fine, can be renamed later)
- Right side: a two-state toggle for `python | javascript`
- Toggle is keyboard-accessible (clickable buttons, not custom widgets)
- Active language is visually distinct from inactive
- Match the terminal aesthetic — monospace, minimal chrome

**Acceptance criteria:**
- Clicking the toggle calls `onLanguageChange` with the new language
- The active language is visually distinct
- Header is fixed at the top of the viewport but doesn't overlap content
- Keyboard-accessible

---

## Ticket 10 — App composition (the main page) ✅

**Goal:** Wire everything together into the working single-page app.

**Tasks:**
- Update `src/App.tsx` to compose the full experience:
  - `Header` at the top with language state from `useProblemFlow`
  - Below the header: `CodePanel` showing the current problem
  - Below the code: `AnswerPanel` if no submission yet, `ResultPanel` if there's a result
  - Layout: centered content, max-width container, generous vertical spacing
- The page should work end-to-end: load → see code → type answers → submit → see result → click next → see new code
- Handle the parse_error case from the normalizer: show the error message inline in the answer panel and let the user retype, *don't* save it as an attempt

**Acceptance criteria:**
- Full loop works: read code → submit → see result → next problem
- Language toggle changes the code snippet immediately, doesn't reset typed answers if mid-problem
- Parse errors don't count as attempts and don't advance the problem
- Visual polish: spacing, typography, color palette all consistent with the terminal aesthetic
- App works on a fresh browser with empty localStorage
- App works after a refresh — language preference persists

---

## Ticket 11 — Visual polish pass ✅ (analytics snippet stubbed; flip on after first deploy)

**Goal:** A focused pass on the visual design once everything is functional.

**Tasks:**
- Pick a primary accent color and apply consistently
- Audit spacing, line heights, font sizes for visual rhythm
- Ensure the result-state colors (green/amber/red) are accessible against the dark background
- Check the page on a 1280px-wide laptop screen and a 1920px-wide monitor — make sure it doesn't look stretched or cramped
- Make sure the page is *not broken* on mobile (content is readable, inputs are usable) even if not optimized
- Add a favicon and a basic page title
- Add Plausible (or alternative) analytics snippet

**Acceptance criteria:**
- The page has been visually reviewed against the terminal aesthetic intent
- Result states are clearly distinguishable
- Mobile is functional, even if not pretty
- Favicon shows in the browser tab
- Analytics is firing on production deploys

---

## Parallel work — content authoring

**This happens alongside tickets 5-11, not after. It's its own pipeline.**

**Goal:** 50 well-authored problems by launch.

**Tasks:**
- Develop a personal authoring rhythm: a few problems per session, both languages each
- Audit the topic distribution as you go: aim for the spec's distribution (overrepresent common interview complexities, multivariable, "looks like A but is B")
- Have someone else (a friend, ideally an engineer) do a sanity pass on a sample of 10 problems before launch — fresh eyes catch ambiguities you can't see
- Track problems in a simple list with topic and difficulty so you can see the distribution

**Acceptance criteria for launch:**
- 50 problems in `problems.ts`
- All pass `validate-problems`
- Topic distribution roughly matches spec (no more than 60% of problems share a single complexity class)
- At least 5 problems have non-trivial multivariable answers
- At least 5 problems are "looks like A but is actually B" type
- A reviewer (not Juan) has spot-checked at least 10 problems for clarity
