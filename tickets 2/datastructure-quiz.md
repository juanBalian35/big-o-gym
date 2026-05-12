# Ticket 12 — Data structure quiz problems (second problem type)

> Adds a second problem type alongside the existing code-reading problems. Schema and UI changes required. Slot this after Ticket 10 (App composition) and before Ticket 11 (Visual polish).

## Mini-spec

### What this adds

A second kind of problem: a short prompt asking for the complexity of a specific data structure operation, with no code shown.

Examples of prompts:
- "What's the time complexity of pushing onto a binary heap?"
- "What's the average time complexity of looking up a key in a hashmap?"
- "What's the time complexity of inserting at the head of a singly linked list?"

### Why

Identifying complexity from code requires two skills: knowing the cost of basic data structure operations, and reasoning about how surrounding code multiplies those costs. A user who flubs a code-reading problem might be failing at either layer. Standalone data structure questions isolate the first skill, train it efficiently, and break up the cognitive load of reading code snippets in succession.

These also reflect a real interview pattern — mid-algorithm, candidates are asked "what's the cost of push and pop here?" and freezing on that question signals weakness regardless of algorithm correctness.

### Mixing ratio

Roughly 10-15% of the problem pool. For the v1 launch with 50 problems, this means **5-7 data structure problems** alongside ~43-45 code-reading problems. They appear in the same random rotation as code problems — the user doesn't pick which type they get.

### Out of scope for v1.1

- Categorizing data structure problems separately in the UI ("now testing: data structures")
- Letting users choose problem type
- Stats split by problem type
- Multi-operation prompts ("what's the cost of push *and* pop combined?")

These can come later if signal warrants.

## Schema changes

The existing `Problem` type becomes a discriminated union:

```ts
export type Problem = CodeProblem | DataStructureProblem;

export interface CodeProblem {
  kind: 'code';
  id: string;
  code: { python: string; javascript: string };
  variables: { name: string; meaning: string }[];
  time_complexity: string;
  space_complexity: string;
  accepted_equivalent_forms?: { time?: string[]; space?: string[] };
  explanation: string;
  topic_tags: string[];
  difficulty: Difficulty;
}

export interface DataStructureProblem {
  kind: 'datastructure';
  id: string;
  prompt: string;              // "What's the time complexity of pushing onto a binary heap?"
  time_complexity: string;
  space_complexity?: string;   // optional — often N/A for single operations
  accepted_equivalent_forms?: { time?: string[]; space?: string[] };
  explanation: string;
  topic_tags: string[];
  difficulty: Difficulty;
}
```

**Discriminator field:** `kind: 'code' | 'datastructure'`. Existing code problems must be updated to include `kind: 'code'`. Make this a build-time required field — TypeScript will catch any missing.

**Why a discriminated union and not a single type with optional fields:** keeps the type honest. A code problem without code is invalid; a datastructure problem without `prompt` is invalid. The discriminator lets the type system enforce this, instead of relying on validators at runtime.

## Validator changes

Update `validate-problems.ts`:

- Every problem must have a valid `kind`
- For `kind: 'code'`: existing validation (code for both languages, variables, etc.)
- For `kind: 'datastructure'`: `prompt` non-empty, `time_complexity` non-empty, optional `space_complexity` if present must be non-empty
- Variable-name validation (the rule that complexity vars must be declared in `variables`) skipped for datastructure problems, since there are no `variables` and the prompt itself names the data structure
- IDs unique across both types

## UI changes

The current page has: code panel → variables → answer panel → result panel.

For datastructure problems, there's no code or variables — just a prompt. Two paths:

**Recommended path: rename "code panel" to "prompt panel" and let it render either form.**

The prompt panel becomes a generic component that renders one of:
- Code + language label + variables (for code problems)
- A short prompt as styled text (for datastructure problems)

The component decides based on `problem.kind`. The rest of the page (answer panel, result panel) stays identical because the answer flow is the same — type complexities, get graded.

**Why not two separate page layouts:** unnecessary divergence. The user experience should feel uniform — every problem is "look at thing, type complexity, see result." Different rendering of the "thing" is fine; different page structure is jarring.

### Datastructure prompt rendering

Style the prompt as muted, large monospace text, similar to a code block but without syntax highlighting. Centered or left-aligned, vertically generous spacing. No "where" block underneath, no language toggle (the language toggle in the header should be hidden or disabled when a datastructure problem is shown — it's not relevant).

**Edge case to handle:** if the user toggles language while a datastructure problem is on screen, the toggle is a no-op visually (no code to switch) but the preference still saves for the next code problem they see. The simplest implementation is to hide the toggle on datastructure problems.

### Space complexity input

For datastructure problems where `space_complexity` is undefined, hide the space input entirely. Only the time input is shown. Submit button is enabled when the time input is filled.

For datastructure problems where `space_complexity` is defined, behave like code problems (both inputs required).

The result panel similarly hides the space row if no space answer was expected.

## Attempt schema update

The `Attempt` type needs to handle the optional space:

```ts
export interface Attempt {
  problem_id: string;
  problem_kind: 'code' | 'datastructure';
  language_shown: Language | null;  // null for datastructure problems
  time_answer: string;
  space_answer: string | null;       // null if not asked
  time_result: ResultState;
  space_result: ResultState | null;  // null if not asked
  timestamp: string;
}
```

This is a backwards-compatible change for existing localStorage data only if you haven't shipped — which you have. So you also need a migration: any existing attempts in localStorage missing `problem_kind` get defaulted to `'code'`, missing `language_shown` defaulted from a sensible inference, missing nullable fields preserved as their existing values.

Or simpler: bump the localStorage key version (`complexity-practice:v1:attempts` → `complexity-practice:v2:attempts`) and let v1 data go stale. Users lose their attempt history but don't see broken behavior. Given you're pre-real-launch, this is acceptable. Document in `DECISIONS.md`.

## Content for launch

Author **6 datastructure problems** alongside the 50 code problems (so the launch pool is 56 total). Suggested:

| # | Prompt | Time | Space | Difficulty |
|---|---|---|---|---|
| DS-1 | Time complexity of pushing onto a binary heap | O(log n) | — | easy |
| DS-2 | Time complexity of peeking at the top of a binary heap | O(1) | — | easy |
| DS-3 | Average time complexity of hashmap key lookup | O(1) | — | easy |
| DS-4 | Worst-case time complexity of hashmap key lookup | O(n) | — | medium |
| DS-5 | Time complexity of inserting at the head of a singly linked list | O(1) | — | medium |
| DS-6 | Amortized time complexity of appending to a dynamic array (e.g., Python list, JS array) | O(1) | — | hard |

Author with the same care as code problems. Each `explanation` is 2-4 sentences explaining *why* — for the heap question, mention the tree height being log n; for the amortized array, mention occasional resize doubling.

For DS-3 vs DS-4 (average vs worst hashmap lookup), the explanations should reference each other so users who get one wrong are pointed at the distinction.

Use `accepted_equivalent_forms` for DS-6 to accept "O(1)", "O(1) amortized", and possibly "O(n) worst case" with a note in the explanation about which framing is being asked.

## CLAUDE.md update

Add a section on the two problem types and the authoring conventions for each.

## Acceptance criteria

- `Problem` is a discriminated union with `kind` field; both variants typecheck strictly
- Validator handles both kinds, rejecting invalid examples of each
- Existing 50 code problems updated with `kind: 'code'`
- 6 datastructure problems authored and added to `problems.ts`
- Prompt panel renders both kinds correctly; layout doesn't shift jarringly between problem types
- Language toggle hidden on datastructure problems; preference still persists for next code problem
- Space complexity input hidden when not asked; submit gating respects this
- Attempt schema handles nullable fields; localStorage migration or version bump implemented
- All existing tests still pass; new tests added for datastructure-problem flow
- Result percentage calculation in stats footer (if you ever add it back) accounts for nullable space results — don't divide by zero

## Things to watch during implementation

The `kind` discriminator will tempt the model to add `if (problem.kind === 'code')` checks throughout the codebase. Push back on this — most components shouldn't care which kind it is. Ideally the prompt panel is the only place that branches on `kind`. Everything downstream (answer panel, result panel, classifier) treats the answer flow uniformly.

The optional `space_complexity` is a real source of bugs. Every place that previously assumed a space answer exists needs to be audited. The classifier returns a result for both fields; what does it return when there's no space field? Probably the cleanest answer: the answer panel only collects what's needed, and the classifier is only called for fields that were collected. The result panel renders only what was classified. Don't pass `null` through the classifier and handle it there.

When in doubt about which problem type appears more often in the random selection, just let it be uniform random over all 56 problems — don't bias toward one type. The 6/56 ratio is enough to feel like a flavor variation rather than the dominant content.
