// Order of problems served as the daily. The picker steps through this list
// one entry per UTC day (cycling at the end), so editing this array is the
// authoritative way to control which problem appears on which day. No hash,
// no randomness - the only contract is "next day = next entry, wrap at end".
//
// Constraints enforced at build time (scripts/validate-and-highlight.ts):
//  - every id here must reference an existing kind:'code' problem in
//    problems.ts (no typos, no stale entries after a rename)
//  - every kind:'code' problem must appear here exactly once (no missing,
//    no duplicates)
// Add new problems to the end of this array (or wherever in the rotation
// you want them to first appear).

export const DAILY_ORDER: readonly string[] = [
  'two-sum',
  'contains-duplicate',
  'valid-anagram',
  'group-anagrams',
  'product-except-self',
  'max-subarray-kadane',
  'valid-palindrome',
  'three-sum',
  'container-with-most-water',
  'best-time-buy-sell-stock',
  'longest-substring-no-repeat',
  'longest-repeating-char-replacement',
  'binary-search-classic',
  'search-rotated-sorted',
  'find-min-rotated-sorted',
  'reverse-linked-list',
  'detect-cycle-floyd',
  'merge-two-sorted-lists',
  'lru-cache',
  'invert-binary-tree',
  'max-depth-binary-tree',
  'same-tree',
  'validate-bst',
  'level-order-traversal',
  'lowest-common-ancestor',
  'trie-insert-search',
  'top-k-frequent',
  'find-median-stream',
  'number-of-islands',
  'clone-graph',
  'course-schedule',
  'pacific-atlantic',
  'climbing-stairs',
  'house-robber',
  'coin-change',
  'longest-increasing-subseq',
  'word-break',
  'merge-intervals',
  'insert-interval',
  'bubble-sort',
  'insertion-sort',
  'merge-sort',
  'heap-sort',
  'set-matrix-zeroes',
  'spiral-matrix',
  'twist-half-bound-nested',
  'twist-doubling-inner',
  'twist-shift-in-loop',
  'twist-string-concat',
  'twist-memoized-recursion',
  'twist-naive-fib',
  'special-dynamic-array-push',
  'special-early-return-sorted',
  'special-balanced-bst-traversal',
];
