# Ticket 11.5 — Per-method complexity questions

> Inserts between Ticket 11 (visual polish) and Ticket 12 (data structure quiz problems). Triggered by the realization that for class-shaped problems with multiple methods (LRU, Trie, MedianFinder), it's ambiguous which method's complexity is being asked. The fix is to ask for each method's time complexity individually, while keeping a single overall space complexity for the data structure.

## Goal

For a small set of class-shaped problems, ask the user for the time complexity of each method separately. Keep a single space complexity that describes the data structure as a whole.

## Why

- LRU's `get` and `put` each have a per-operation time; asking "what's the time complexity?" without naming the method is ambiguous.
- MedianFinder's `addNum` is **O(log n)** per call but `findMedian` is **O(1)**. Collapsing them into a single answer destroys the most interesting part of the problem.
- Per-method *space* is rarely asked in interviews. Per-data-structure space (e.g., O(c) for LRU capacity, O(n) for Trie total chars) is the canonical question.

## Affected problems

- `lru-cache` — methods: `get`, `put`; both O(1)
- `trie-insert-search` — methods: `insert`, `search`; both O(k)
- `find-median-stream` — methods: `addNum` (O(log n)), `findMedian` (O(1)); space O(n)

The remaining 47 problems keep the existing single-time, single-space shape.

## Schema change

Add an optional `method_times` field to `Problem`. When present, `time_complexity` becomes optional (the schema requires exactly one of the two paths).

```ts
export interface MethodTime {
  method: string;                        // e.g., 'addNum'
  time_complexity: string;
  accepted_equivalent_forms?: string[];
}

export interface Problem {
  // ...existing fields...
  time_complexity?: string;              // single-method problems
  method_times?: MethodTime[];           // multi-method problems
  // space_complexity stays required (single overall space)
}
```

Validator enforces:
- Exactly one of `time_complexity` or `method_times` is set (not both, not neither).
- Each `method_times` entry has a non-empty `method` and `time_complexity`.
- Method names within a problem are unique.
- Variable references in any complexity string (top-level or per-method) are declared in `variables`.

## UI changes

`AnswerPanel` and `ResultPanel` are refactored to accept arrays:

```ts
interface AnswerField {
  key: string;              // 'time' | 'space' | 'time-addNum' | etc.
  label: string;            // 'Time complexity' | 'Time complexity of addNum' | etc.
}

interface ResultLine {
  label: string;
  state: ResultStateOrError;
  userAnswer: string;
  canonicalAnswer: string;
  message?: string;
}
```

For single-method problems, the field array is `[time, space]` (unchanged behavior).

For multi-method problems, the field array is `[time-method1, time-method2, ..., space]`.

Submit is gated on every field being filled. Enter on any field submits when all are filled.

## Submission behavior

- All N answers submitted together in one click.
- Each is classified independently against its canonical.
- Result panel shows N rows, each labeled.
- Solved counter (in the header) increments only when **every** field is `correct`.
- Multi-method attempts are NOT saved to localStorage in this version — the existing `Attempt` schema only has `time_answer`/`space_answer`. Note in `DECISIONS.md`. Single-method attempts continue to save.

## Acceptance criteria

- Schema updated; validator rejects invalid shapes
- AnswerPanel and ResultPanel accept fields/lines arrays
- LRU, Trie, MedianFinder use `method_times`
- Multi-method problems show one input per method (plus one for space)
- Submit button disabled until all fields filled; Enter on any input submits when ready
- Result panel shows one row per question
- Solved counter increments only on full correctness across all fields
- All existing tests pass; new tests cover multi-method classification
- Bundle size doesn't regress meaningfully
