import { problems } from './problems';
import type { Problem } from '../types/problem';

export interface RaceSet {
  id: string;
  name: string;
  blurb: string;
  problemIds: string[];
}

export const RACE_SETS: RaceSet[] = [
  {
    id: 'classic-7',
    name: 'Classic Seven',
    blurb: 'Seven problems, easy → hard. Hashing, search, DP, and two-pointer.',
    problemIds: [
      'contains-duplicate',
      'binary-search-classic',
      'valid-anagram',
      'merge-intervals',
      'house-robber',
      'three-sum',
      'coin-change',
    ],
  },
  {
    id: 'sprint',
    name: 'Sprint',
    blurb: 'Quick run through easier problems. Find your pace.',
    problemIds: [
      'ds-hashmap-lookup-average',
      'binary-search-classic',
      'ds-binary-heap-push',
      'valid-palindrome',
      'contains-duplicate',
      'same-tree',
      'climbing-stairs',
    ],
  },
  {
    id: 'circuit',
    name: 'Circuit',
    blurb: 'Hops across topics and difficulty, no single theme.',
    problemIds: [
      'ds-binary-heap-peek',
      'valid-palindrome',
      'invert-binary-tree',
      'search-rotated-sorted',
      'merge-intervals',
      'number-of-islands',
      'set-matrix-zeroes',
    ],
  },
  {
    id: 'heavy-day',
    name: 'Heavy Day',
    blurb: 'Seven hard problems back to back. No shortcuts.',
    problemIds: [
      'group-anagrams',
      'three-sum',
      'longest-substring-no-repeat',
      'top-k-frequent',
      'clone-graph',
      'coin-change',
      'twist-naive-fib',
    ],
  },
  {
    id: 'marathon',
    name: 'Marathon',
    blurb: 'Twenty-six problems, easy → hard. Pace yourself.',
    problemIds: [
      // Warmup (6 easy)
      'ds-hashmap-lookup-average',
      'binary-search-classic',
      'valid-palindrome',
      'contains-duplicate',
      'best-time-buy-sell-stock',
      'climbing-stairs',
      // Mid-pack (11 medium)
      'valid-anagram',
      'product-except-self',
      'detect-cycle-floyd',
      'merge-two-sorted-lists',
      'invert-binary-tree',
      'validate-bst',
      'level-order-traversal',
      'number-of-islands',
      'house-robber',
      'merge-intervals',
      'spiral-matrix',
      // Finish (9 hard)
      'three-sum',
      'longest-substring-no-repeat',
      'lowest-common-ancestor',
      'top-k-frequent',
      'clone-graph',
      'coin-change',
      'set-matrix-zeroes',
      'twist-naive-fib',
      'lru-cache',
    ],
  },
];

export function findRaceSet(id: string): RaceSet | undefined {
  return RACE_SETS.find((s) => s.id === id);
}

export function resolveRaceSetProblems(set: RaceSet): Problem[] {
  const out: Problem[] = [];
  for (const id of set.problemIds) {
    const p = problems.find((x) => x.id === id);
    if (!p) {
      throw new Error(`race set "${set.id}" references unknown problem "${id}"`);
    }
    out.push(p);
  }
  return out;
}
