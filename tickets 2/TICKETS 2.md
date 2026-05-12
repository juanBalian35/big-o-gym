# Ticket 2.5 — Variable definitions on problems ✅

> Inserts between Ticket 2 (schema/seed data) and Ticket 3 (normalizer). If Ticket 2 is already done, this ticket modifies the schema and seed data; if not, it can be folded into Ticket 2.

**Goal:** Every problem declares what its complexity variables mean, so users have an unambiguous reference when typing their answer. Without this, multivariable problems are effectively unanswerable, and even single-variable problems suffer from ambiguity (is `n` the array length or the value of an integer parameter?).

## Why this is needed

For a multivariable problem like BFS on a graph, the answer depends on what variables the user is expected to use. Is the answer `O(V + E)`, `O(n + m)`, or `O(nodes + edges)`? All three are valid notations and the user has no way to know which one matches the canonical answer without being told.

Even single-variable problems benefit: `n` could mean array length, string length, the value of an integer input, or the number of nodes in a tree — and these aren't interchangeable for complexity purposes.

## Design decisions (locked, see DECISIONS.md update below)

**All variables are disclosed before submission, with their meanings.** The user lands on a problem, sees the code, sees the variables, and types their answer. No hidden variables, no "discovery moment" gating.

**Why not hide variables for "trick" problems:** Forcing the user to invent variable names creates submission anxiety and trains the wrong skill — in real interviews, conventions matter (`V`/`E` for graphs, `m`/`n` for grids). Hiding variables also means the user does two mental tasks before answering (identify quantities AND commit to symbols), which is friction at the wrong moment. The pedagogical loss from disclosure is bounded: knowing "two variables exist" doesn't tell the user how they combine, which is most of the analysis.

**Use brief english descriptions, not code expressions.** `'length of the input array'` not `'len(arr)'`. The schema has both Python and JS code, so code-form would mean two variable definitions per problem. English is also language-agnostic and lower cognitive load — the variable section should be reference material, not work.

## Schema change

Add a required field to the `Problem` type:

```ts
export interface Problem {
  // ...existing fields...
  variables: { name: string; meaning: string }[];
  // ...
}
```

- `variables` is non-empty (single-variable problems have one entry, multivariable have two or more)
- `name` is the short symbol used in the canonical answer (`n`, `m`, `k`, `v`, `e`)
- `meaning` is a brief english description ("length of the input array", "number of nodes in the tree")
- Order matters — display in the order authored

## Authoring conventions

Use brief english descriptions:

- `{ name: 'n', meaning: 'length of the input array' }`
- `{ name: 'n', meaning: 'number of nodes' }, { name: 'e', meaning: 'number of edges' }`
- `{ name: 'm', meaning: 'number of rows' }, { name: 'n', meaning: 'number of columns' }`
- `{ name: 'n', meaning: 'length of string s' }, { name: 'm', meaning: 'length of string t' }`

**Grid convention:** always `m = rows, n = columns`. Document in `CLAUDE.md`. Apply consistently across all grid problems forever — users will internalize whatever you set up.

**When english is ambiguous,** add a clarifying clause inside `meaning` rather than switching to code-form. E.g., `'value of the integer n (not array length)'` is clearer than `n = n` and clearer than swapping to `'integer n'`.

## Validation

Update `validate-problems.ts` to enforce:

- `variables` is non-empty
- Each variable has a non-empty `name` and `meaning`
- Variable names are unique within a problem
- All variable names that appear in `time_complexity`, `space_complexity`, or `accepted_equivalent_forms` are declared in `variables`

The last check catches typos like a canonical answer of `O(n*k)` when only `n` and `m` are declared.

### Implementation note for the variable-extraction check

The validator extracts variable names from canonical answer strings. The simple correct approach:

1. Lowercase the answer string
2. Strip the wrapping `O(...)` or `Θ(...)`
3. Remove known function names: `log`, `lg`, `ln`
4. Scan for single lowercase letters
5. Each letter found must appear as a `name` in `variables`

Don't try to be smart here — no AST parsing in the validator. The structured analysis lives in the normalizer (Ticket 3). The validator just needs to not be embarrassingly wrong, and the simple version above handles every realistic case in our problem set.

If a future canonical answer needs notation the simple validator can't handle (e.g., a function name we haven't listed), update the function-name allowlist. Don't escalate to AST parsing in the validator.

## UI change

Display the variables between the code panel and the answer panel. Suggested format: small monospace text, muted color.

Example rendering:

```
where:
  n = length of the input array
  m = number of distinct values
```

For single-variable problems, still show it ("n = length of input"). Consistency over cleverness — the user should never have to guess.

Style notes: muted text, smaller than the code, no heavy borders. Reference material, visible but not dominating.

## Seed data update

Update the 5 seed problems to include `variables`:

- Linear scan: `[{ name: 'n', meaning: 'length of the input array' }]`
- Nested loop O(n²): `[{ name: 'n', meaning: 'length of the input array' }]`
- Binary search: `[{ name: 'n', meaning: 'length of the sorted array' }]`
- Recursive Fibonacci: `[{ name: 'n', meaning: 'the input integer (not array length)' }]`
- BFS or matrix problem: two variables, named per the conventions above

## DECISIONS.md update

Add an entry:

> **Variable disclosure: always show all variables and their meanings before submission.** Considered hiding variables for "trick" problems to preserve a discovery moment, but rejected because: (1) forcing users to invent variable names creates submission anxiety, (2) interview conventions matter (`V`/`E` for graphs, `m`/`n` for grids) and disclosure trains those conventions, (3) the pedagogical loss is bounded — knowing the variables exist doesn't tell the user how they combine, which is most of the analysis. Trick problems compensate by leaning on code-reading difficulty (which loop bounds matter, etc.) rather than variable discovery.

## Acceptance criteria

- `Problem` type updated with required `variables` field
- All seed problems updated with appropriate variable definitions
- `validate-problems` rejects problems missing `variables` or with undeclared variable names appearing in answers
- UI displays variables clearly between the code and the answer inputs
- Variable display is styled as reference material — visible but not dominating
- `CLAUDE.md` updated with the authoring conventions (english form, grid convention, when to clarify)
- `DECISIONS.md` updated with the disclosure rationale

