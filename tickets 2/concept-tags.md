# Ticket 13 — Concept tag on every result

## Goal

Above the markdown explanation in the result panel, surface a single short label naming the underlying complexity concept the problem tests. The point is to give the user a vocabulary for what they're learning so wrong answers feel like specific gaps to study, not "I'm bad at this."

## Examples

- `amortized analysis` (dynamic-array push, LRU, hashmap)
- `dominant term in a sum` (most "drop the lower-order term" twists)
- `logarithmic recursion depth` (balanced-tree traversal)
- `hashmap collision worst case` (DS-4)
- `hidden cost in array shift` (twist-shift-in-loop)
- `branching recursion → exponential` (naive Fibonacci)

These are concept-level tags, distinct from `topic_tags` (which are categorical: "arrays", "graphs"). Authored by hand — one per problem.

## Schema

Add `concept: string` (required) to both `CodeProblem` and `DataStructureProblem`.

```ts
export interface CodeProblem {
  // ...existing...
  concept: string;
}

export interface DataStructureProblem {
  // ...existing...
  concept: string;
}
```

Validator: must be a non-empty string for every problem.

## UI

In `ResultPanel`, render the concept as a small label above the explanation block. Style: muted color, terminal-y framing — e.g. `tested concept · <name>`. Keep it visually quiet — it's reference material, not a banner.

## Acceptance criteria

- `concept` field added to both Problem variants; validator requires it
- All 56 existing problems have a concept tag
- Result panel renders the concept label above the explanation
- Tests still pass
