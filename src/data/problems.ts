import type { Problem } from '../types/problem';

export const problems: Problem[] = [
  // ===== Arrays & Hashing (6) =====
  {
    kind: 'code',
    id: 'two-sum',
    code: {
      python: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
      javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    explanation:
      'Single linear pass with a hash lookup at each step — **O(n)** time. The map stores at most `n` entries, giving **O(n)** auxiliary space. The hash map turns the inner search from O(n) into O(1).',
    concept: 'hashmap as a complement lookup',
    topic_tags: ['arrays', 'hashmap'],
    difficulty: 'easy',
    variables: [{ name: 'n', meaning: 'length of the input array nums' }],
  },
  {
    kind: 'code',
    id: 'contains-duplicate',
    code: {
      python: `def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
      javascript: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    explanation:
      'One pass with O(1) set membership and insertion — **O(n)** time. The set holds up to `n` elements in the worst case, **O(n)** space. The naive nested-loop alternative is O(n²); the hash set buys linearity.',
    concept: 'set membership for O(1) lookups',
    topic_tags: ['arrays', 'hashset'],
    difficulty: 'easy',
    variables: [{ name: 'n', meaning: 'length of the input array nums' }],
  },
  {
    kind: 'code',
    id: 'valid-anagram',
    code: {
      python: `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    counts = [0] * 26
    for c in s:
        counts[ord(c) - ord('a')] += 1
    for c in t:
        counts[ord(c) - ord('a')] -= 1
        if counts[ord(c) - ord('a')] < 0:
            return False
    return True`,
      javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const counts = new Array(26).fill(0);
  for (const c of s) counts[c.charCodeAt(0) - 97]++;
  for (const c of t) {
    const idx = c.charCodeAt(0) - 97;
    if (--counts[idx] < 0) return false;
  }
  return true;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'Two linear passes over the strings — **O(n)** time. The counter array is fixed at 26 slots regardless of input, so space is **O(1)**. If the alphabet were unbounded the answer would shift to O(n) space.',
    concept: 'fixed-alphabet counting collapses to constant space',
    topic_tags: ['strings', 'counting'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'length of either input string (they must match)' }],
  },
  {
    kind: 'code',
    id: 'group-anagrams',
    code: {
      python: `def group_anagrams(strs):
    groups = {}
    for s in strs:
        key = ''.join(sorted(s))
        groups.setdefault(key, []).append(s)
    return list(groups.values())`,
      javascript: `function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}`,
    },
    time_complexity: 'O(n * k log k)',
    space_complexity: 'O(n * k)',
    accepted_equivalent_forms: {
      time: ['O(n · k log k)', 'O(nk log k)'],
      space: ['O(n · k)', 'O(nk)'],
    },
    explanation:
      'For each of the `n` strings we sort its characters (**O(k log k)**), giving total time **O(n · k log k)**. The map stores all `n` strings keyed by their sorted form, so total characters held is **O(n · k)**. A counting-array key changes time to O(n · k) but the sort version is canonical.',
    concept: 'multivariable cost: per-string sort over n strings',
    topic_tags: ['arrays', 'strings', 'hashmap', 'multivariable'],
    difficulty: 'hard',
    variables: [
      { name: 'n', meaning: 'number of strings in the input' },
      { name: 'k', meaning: 'maximum length of any single string' },
    ],
  },
  {
    kind: 'code',
    id: 'product-except-self',
    code: {
      python: `def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        out[i] *= right
        right *= nums[i]
    return out`,
      javascript: `function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) {
    out[i] = left;
    left *= nums[i];
  }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    accepted_equivalent_forms: {
      space: ['O(n)'],
    },
    explanation:
      'Two linear passes — **O(n)** time. By convention the output array is excluded from auxiliary space, so this is **O(1)** auxiliary; only `left` and `right` accumulators are kept. (If you count the output, it is O(n).)',
    concept: 'prefix/suffix accumulation in two passes',
    topic_tags: ['arrays', 'prefix-suffix'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'length of the input array nums' }],
  },
  {
    kind: 'code',
    id: 'max-subarray-kadane',
    code: {
      python: `def max_subarray(nums):
    best = current = nums[0]
    for x in nums[1:]:
        current = max(x, current + x)
        best = max(best, current)
    return best`,
      javascript: `function maxSubarray(nums) {
  let best = nums[0];
  let current = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }
  return best;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'Kadane scans once, keeping a single running best — **O(n)** time, **O(1)** space. The naive O(n²) brute force becomes linear once you notice the running max only needs the previous endpoint, not all of them.',
    concept: 'rolling DP with O(1) state',
    topic_tags: ['arrays', 'kadane', 'dp'],
    difficulty: 'easy',
    variables: [{ name: 'n', meaning: 'length of the input array nums' }],
  },

  // ===== Two Pointers (3) =====
  {
    kind: 'code',
    id: 'valid-palindrome',
    code: {
      python: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True`,
      javascript: `function isPalindrome(s) {
  const isAlnum = (c) => /[a-zA-Z0-9]/.test(c);
  let left = 0, right = s.length - 1;
  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'The two pointers together cover each character at most once — **O(n)** total. Only two indices are tracked, so space is **O(1)**. The nested skip-loops can fool you into thinking it is quadratic, but the inner work is amortized over the outer.',
    concept: 'amortized inner loop in a two-pointer scan',
    topic_tags: ['strings', 'two-pointers'],
    difficulty: 'easy',
    variables: [{ name: 'n', meaning: 'length of the input string' }],
  },
  {
    kind: 'code',
    id: 'three-sum',
    code: {
      python: `def three_sum(nums):
    nums.sort()
    res = []
    n = len(nums)
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s == 0:
                res.append([nums[i], nums[lo], nums[hi]])
                while lo < hi and nums[lo] == nums[lo + 1]:
                    lo += 1
                while lo < hi and nums[hi] == nums[hi - 1]:
                    hi -= 1
                lo += 1
                hi -= 1
            elif s < 0:
                lo += 1
            else:
                hi -= 1
    return res`,
      javascript: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  const n = nums.length;
  for (let i = 0; i < n - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let lo = i + 1, hi = n - 1;
    while (lo < hi) {
      const s = nums[i] + nums[lo] + nums[hi];
      if (s === 0) {
        res.push([nums[i], nums[lo], nums[hi]]);
        while (lo < hi && nums[lo] === nums[lo + 1]) lo++;
        while (lo < hi && nums[hi] === nums[hi - 1]) hi--;
        lo++; hi--;
      } else if (s < 0) {
        lo++;
      } else {
        hi--;
      }
    }
  }
  return res;
}`,
    },
    time_complexity: 'O(n²)',
    space_complexity: 'O(1)',
    accepted_equivalent_forms: {
      time: ['O(n^2)'],
      space: ['O(n)'],
    },
    explanation:
      'Sorting is **O(n log n)**, then for each `i` the two-pointer scan is **O(n)** — quadratic dominates, total **O(n²)**. Auxiliary space is **O(1)** if we ignore the output and the in-place sort; some sort implementations use O(log n) stack.',
    concept: 'sort + two-pointer reduces a dimension',
    topic_tags: ['arrays', 'two-pointers', 'sorting'],
    difficulty: 'hard',
    variables: [{ name: 'n', meaning: 'length of the input array nums' }],
  },
  {
    kind: 'code',
    id: 'container-with-most-water',
    code: {
      python: `def max_area(heights):
    left, right = 0, len(heights) - 1
    best = 0
    while left < right:
        h = min(heights[left], heights[right])
        best = max(best, h * (right - left))
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    return best`,
      javascript: `function maxArea(heights) {
  let left = 0, right = heights.length - 1;
  let best = 0;
  while (left < right) {
    const h = Math.min(heights[left], heights[right]);
    best = Math.max(best, h * (right - left));
    if (heights[left] < heights[right]) left++;
    else right--;
  }
  return best;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'Pointers move toward each other, each step advancing one of them — **O(n)** total iterations. Only two indices and one running max are kept, **O(1)** space. The greedy choice (always advance the shorter side) is what unlocks linearity.',
    concept: 'monotone two-pointer convergence',
    topic_tags: ['arrays', 'two-pointers', 'greedy'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'length of the heights array' }],
  },

  // ===== Sliding Window (3) =====
  {
    kind: 'code',
    id: 'best-time-buy-sell-stock',
    code: {
      python: `def max_profit(prices):
    min_price = float('inf')
    best = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > best:
            best = p - min_price
    return best`,
      javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let best = 0;
  for (const p of prices) {
    if (p < minPrice) minPrice = p;
    else if (p - minPrice > best) best = p - minPrice;
  }
  return best;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'A single pass tracking the running minimum and the best gap so far — **O(n)** time, **O(1)** space. The brute-force "all pairs" version is O(n²); recognizing that you only need the min-so-far on the left is the trick.',
    concept: 'running minimum with running best',
    topic_tags: ['arrays', 'sliding-window', 'dp'],
    difficulty: 'easy',
    variables: [{ name: 'n', meaning: 'length of the prices array' }],
  },
  {
    kind: 'code',
    id: 'longest-substring-no-repeat',
    code: {
      python: `def length_of_longest_substring(s):
    seen = {}
    left = 0
    best = 0
    for right, c in enumerate(s):
        if c in seen and seen[c] >= left:
            left = seen[c] + 1
        seen[c] = right
        best = max(best, right - left + 1)
    return best`,
      javascript: `function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (seen.has(c) && seen.get(c) >= left) {
      left = seen.get(c) + 1;
    }
    seen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(c)',
    accepted_equivalent_forms: {
      space: ['O(n)', 'O(1)'],
    },
    explanation:
      'Each character enters and leaves the window at most once — **O(n)** time. The map holds at most one entry per distinct character, bounded by **O(min(n, c))** where `c` is the alphabet size; treating `c` as a constant gives **O(1)**. Either form is defensible.',
    concept: 'sliding window with bounded auxiliary state',
    topic_tags: ['strings', 'sliding-window', 'hashmap'],
    difficulty: 'hard',
    variables: [
      { name: 'n', meaning: 'length of the input string' },
      { name: 'c', meaning: 'size of the character set / alphabet' },
    ],
  },
  {
    kind: 'code',
    id: 'longest-repeating-char-replacement',
    code: {
      python: `def character_replacement(s, k):
    counts = {}
    left = 0
    max_count = 0
    best = 0
    for right, c in enumerate(s):
        counts[c] = counts.get(c, 0) + 1
        max_count = max(max_count, counts[c])
        while right - left + 1 - max_count > k:
            counts[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
      javascript: `function characterReplacement(s, k) {
  const counts = new Map();
  let left = 0, maxCount = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    counts.set(c, (counts.get(c) || 0) + 1);
    maxCount = Math.max(maxCount, counts.get(c));
    while (right - left + 1 - maxCount > k) {
      counts.set(s[left], counts.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'The window shifts forward only — each index enters and leaves at most once, giving **O(n)** time despite the inner while-loop. The counts map holds at most one entry per alphabet character, so space is **O(1)** for a fixed alphabet. The subtle part: `max_count` is never decremented, but the overall answer remains correct because the window size only matters at its peak.',
    concept: 'amortized window growth',
    topic_tags: ['strings', 'sliding-window'],
    difficulty: 'hard',
    variables: [{ name: 'n', meaning: 'length of the input string' }],
  },

  // ===== Binary Search (3) =====
  {
    kind: 'code',
    id: 'binary-search-classic',
    code: {
      python: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      javascript: `function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    },
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    explanation:
      'Each iteration halves the search range, so the loop runs at most ⌈log₂ n⌉ times — **O(log n)** time. Constant variables only, **O(1)** space. The array must already be sorted.',
    concept: 'halving the search space',
    topic_tags: ['arrays', 'binary-search'],
    difficulty: 'easy',
    variables: [{ name: 'n', meaning: 'length of the sorted input array' }],
  },
  {
    kind: 'code',
    id: 'search-rotated-sorted',
    code: {
      python: `def search_rotated(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[lo] <= arr[mid]:
            if arr[lo] <= target < arr[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if arr[mid] < target <= arr[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
      javascript: `function searchRotated(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[lo] <= arr[mid]) {
      if (arr[lo] <= target && target < arr[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (arr[mid] < target && target <= arr[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
    },
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    explanation:
      'Even with the rotation, each iteration eliminates half the search space — **O(log n)** time, **O(1)** space. The branching is more involved but the halving is preserved.',
    concept: 'halving despite a structural irregularity',
    topic_tags: ['arrays', 'binary-search'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'length of the rotated sorted array' }],
  },
  {
    kind: 'code',
    id: 'find-min-rotated-sorted',
    code: {
      python: `def find_min(arr):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] > arr[hi]:
            lo = mid + 1
        else:
            hi = mid
    return arr[lo]`,
      javascript: `function findMin(arr) {
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] > arr[hi]) lo = mid + 1;
    else hi = mid;
  }
  return arr[lo];
}`,
    },
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    explanation:
      'Binary-search variant comparing `mid` to `hi` to decide which half holds the rotation point — **O(log n)** time, **O(1)** space. The naive linear scan would be O(n).',
    concept: 'binary search on a comparison invariant',
    topic_tags: ['arrays', 'binary-search'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'length of the rotated sorted array' }],
  },

  // ===== Linked List (4) =====
  {
    kind: 'code',
    id: 'reverse-linked-list',
    code: {
      python: `def reverse_list(head):
    prev = None
    cur = head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev`,
      javascript: `function reverseList(head) {
  let prev = null, cur = head;
  while (cur) {
    const nxt = cur.next;
    cur.next = prev;
    prev = cur;
    cur = nxt;
  }
  return prev;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'Single traversal flipping each pointer — **O(n)** time. Three reused locals, **O(1)** space. The recursive form uses O(n) stack and is sometimes accepted; this iterative form is canonical.',
    concept: 'in-place pointer reversal',
    topic_tags: ['linked-list'],
    difficulty: 'easy',
    variables: [{ name: 'n', meaning: 'number of nodes in the list' }],
  },
  {
    kind: 'code',
    id: 'detect-cycle-floyd',
    code: {
      python: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
      javascript: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'The fast pointer moves twice per step; if a cycle exists, the gap between fast and slow shrinks by one each round — they meet within **O(n)** steps. Two pointers only, **O(1)** space. The hash-set alternative is O(n) space.',
    concept: 'tortoise-and-hare meets in O(n)',
    topic_tags: ['linked-list', 'two-pointers'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'number of nodes in the list' }],
  },
  {
    kind: 'code',
    id: 'merge-two-sorted-lists',
    code: {
      python: `def merge_two_lists(a, b):
    dummy = ListNode()
    tail = dummy
    while a and b:
        if a.val < b.val:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next`,
      javascript: `function mergeTwoLists(a, b) {
  const dummy = { next: null };
  let tail = dummy;
  while (a && b) {
    if (a.val < b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}`,
    },
    time_complexity: 'O(n + m)',
    space_complexity: 'O(1)',
    explanation:
      'Each node from each list is visited exactly once and re-linked in place — **O(n + m)** time. We allocate only the dummy head, **O(1)** auxiliary space. (No new nodes are created; the result is woven from existing ones.)',
    concept: 'linear merge over two sorted streams',
    topic_tags: ['linked-list', 'multivariable'],
    difficulty: 'medium',
    variables: [
      { name: 'n', meaning: 'length of the first list' },
      { name: 'm', meaning: 'length of the second list' },
    ],
  },
  {
    kind: 'code',
    id: 'lru-cache',
    code: {
      python: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)`,
      javascript: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}`,
    },
    method_times: [
      { method: 'get', time_complexity: 'O(1)' },
      { method: 'put', time_complexity: 'O(1)' },
    ],
    space_complexity: 'O(c)',
    explanation:
      'Both `get` and `put` use only O(1) hash and pointer operations — **O(1)** per operation. The cache holds at most `c` entries (the capacity), giving **O(c)** space overall. The trick: a hashmap alone is not enough — you also need ordering, which is what makes the doubly-linked-list pairing necessary in a hand-rolled implementation.',
    concept: 'hashmap + doubly linked list for O(1) per operation',
    topic_tags: ['linked-list', 'hashmap', 'design', 'amortized'],
    difficulty: 'hard',
    variables: [{ name: 'c', meaning: 'capacity of the cache' }],
  },

  // ===== Trees (6) =====
  {
    kind: 'code',
    id: 'invert-binary-tree',
    code: {
      python: `def invert_tree(node):
    if not node:
        return None
    node.left, node.right = invert_tree(node.right), invert_tree(node.left)
    return node`,
      javascript: `function invertTree(node) {
  if (!node) return null;
  const left = invertTree(node.right);
  const right = invertTree(node.left);
  node.left = left;
  node.right = right;
  return node;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    accepted_equivalent_forms: {
      space: ['O(log n)', 'O(n)'],
    },
    explanation:
      'Each node is visited once and has its children swapped — **O(n)** time. Auxiliary space is the recursion depth, **O(h)** — that is `O(log n)` for a balanced tree and `O(n)` for a degenerate one.',
    concept: 'tree recursion: nodes vs stack depth',
    topic_tags: ['trees', 'recursion'],
    difficulty: 'medium',
    variables: [
      { name: 'n', meaning: 'number of nodes in the tree' },
      { name: 'h', meaning: 'height of the tree' },
    ],
  },
  {
    kind: 'code',
    id: 'max-depth-binary-tree',
    code: {
      python: `def max_depth(node):
    if not node:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))`,
      javascript: `function maxDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    accepted_equivalent_forms: {
      space: ['O(log n)', 'O(n)'],
    },
    explanation:
      'Every node is visited exactly once, **O(n)** time. The recursion stack depth is the tree height **O(h)** — `log n` balanced, `n` degenerate.',
    concept: 'tree recursion: nodes vs stack depth',
    topic_tags: ['trees', 'recursion'],
    difficulty: 'medium',
    variables: [
      { name: 'n', meaning: 'number of nodes in the tree' },
      { name: 'h', meaning: 'height of the tree' },
    ],
  },
  {
    kind: 'code',
    id: 'same-tree',
    code: {
      python: `def is_same_tree(p, q):
    if not p and not q:
        return True
    if not p or not q:
        return False
    if p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`,
      javascript: `function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q) return false;
  if (p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    accepted_equivalent_forms: {
      space: ['O(log n)', 'O(n)'],
    },
    explanation:
      'In the worst case (trees identical) every node is visited — **O(n)** time. Recursion stack uses **O(h)** space; balanced is `log n`, skewed is `n`. Early exit on mismatch only improves the constant, not the asymptotic.',
    concept: 'tree recursion: nodes vs stack depth',
    topic_tags: ['trees', 'recursion'],
    difficulty: 'easy',
    variables: [
      { name: 'n', meaning: 'number of nodes in either tree' },
      { name: 'h', meaning: 'height of the trees' },
    ],
  },
  {
    kind: 'code',
    id: 'validate-bst',
    code: {
      python: `def is_valid_bst(node, lo=float('-inf'), hi=float('inf')):
    if not node:
        return True
    if not (lo < node.val < hi):
        return False
    return (is_valid_bst(node.left, lo, node.val) and
            is_valid_bst(node.right, node.val, hi))`,
      javascript: `function isValidBST(node, lo = -Infinity, hi = Infinity) {
  if (!node) return true;
  if (node.val <= lo || node.val >= hi) return false;
  return isValidBST(node.left, lo, node.val)
      && isValidBST(node.right, node.val, hi);
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    accepted_equivalent_forms: {
      space: ['O(log n)', 'O(n)'],
    },
    explanation:
      'Each node is checked once with O(1) bounds work — **O(n)** time. Recursion depth is the tree height **O(h)** — `log n` balanced, `n` skewed.',
    concept: 'tree recursion with bounds carried in args',
    topic_tags: ['trees', 'recursion', 'bst'],
    difficulty: 'medium',
    variables: [
      { name: 'n', meaning: 'number of nodes in the tree' },
      { name: 'h', meaning: 'height of the tree' },
    ],
  },
  {
    kind: 'code',
    id: 'level-order-traversal',
    code: {
      python: `from collections import deque

def level_order(root):
    if not root:
        return []
    res = []
    q = deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        res.append(level)
    return res`,
      javascript: `function levelOrder(root) {
  if (!root) return [];
  const res = [];
  let q = [root];
  while (q.length) {
    const level = [];
    const next = [];
    for (const node of q) {
      level.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    res.push(level);
    q = next;
  }
  return res;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    explanation:
      'Each node is enqueued and dequeued once — **O(n)** time. The queue can hold up to `n/2` nodes (the widest level) so space is **O(n)**, not O(h).',
    concept: 'BFS queue width matches the widest level',
    topic_tags: ['trees', 'bfs', 'queue'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'number of nodes in the tree' }],
  },
  {
    kind: 'code',
    id: 'lowest-common-ancestor',
    code: {
      python: `def lca(root, p, q):
    if not root or root == p or root == q:
        return root
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:
        return root
    return left or right`,
      javascript: `function lca(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lca(root.left, p, q);
  const right = lca(root.right, p, q);
  if (left && right) return root;
  return left || right;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    accepted_equivalent_forms: {
      space: ['O(log n)', 'O(n)'],
    },
    explanation:
      'In the worst case the recursion visits every node — **O(n)** time. Recursion depth equals tree height **O(h)** — `log n` balanced, `n` degenerate. The post-order pattern (recurse first, decide after) is the trick that makes this concise.',
    concept: 'post-order recursion deciding from below',
    topic_tags: ['trees', 'recursion'],
    difficulty: 'hard',
    variables: [
      { name: 'n', meaning: 'number of nodes in the tree' },
      { name: 'h', meaning: 'height of the tree' },
    ],
  },

  // ===== Tries / Heap (3) =====
  {
    kind: 'code',
    id: 'trie-insert-search',
    code: {
      python: `class Trie:
    def __init__(self):
        self.children = {}
        self.end = False

    def insert(self, word):
        node = self
        for c in word:
            if c not in node.children:
                node.children[c] = Trie()
            node = node.children[c]
        node.end = True

    def search(self, word):
        node = self
        for c in word:
            if c not in node.children:
                return False
            node = node.children[c]
        return node.end`,
      javascript: `class Trie {
  constructor() {
    this.children = new Map();
    this.end = false;
  }
  insert(word) {
    let node = this;
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new Trie());
      node = node.children.get(c);
    }
    node.end = true;
  }
  search(word) {
    let node = this;
    for (const c of word) {
      if (!node.children.has(c)) return false;
      node = node.children.get(c);
    }
    return node.end;
  }
}`,
    },
    method_times: [
      { method: 'insert', time_complexity: 'O(k)' },
      { method: 'search', time_complexity: 'O(k)' },
    ],
    space_complexity: 'O(n)',
    explanation:
      'Both insert and search walk one node per character — **O(k)** time per operation, where `k` is the length of the word. The trie as a whole holds one node per distinct prefix; total nodes are bounded by total characters across all inserted words, giving **O(n)** space overall.',
    concept: 'operation cost vs structure size',
    topic_tags: ['tries', 'strings'],
    difficulty: 'medium',
    variables: [
      { name: 'k', meaning: 'length of the word being inserted or searched' },
      { name: 'n', meaning: 'total characters across all inserted words' },
    ],
  },
  {
    kind: 'code',
    id: 'top-k-frequent',
    code: {
      python: `import heapq
from collections import Counter

def top_k_frequent(nums, k):
    counts = Counter(nums)
    heap = []
    for num, freq in counts.items():
        heapq.heappush(heap, (freq, num))
        if len(heap) > k:
            heapq.heappop(heap)
    return [num for _, num in heap]`,
      javascript: `function topKFrequent(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) || 0) + 1);

  // min-heap keyed by frequency, capped at size k
  const heap = new MinHeap();
  for (const [num, freq] of counts) {
    heap.push([freq, num]);
    if (heap.size() > k) heap.pop();
  }
  return heap.toArray().map(([, num]) => num);
}`,
    },
    time_complexity: 'O(n log k)',
    space_complexity: 'O(n + k)',
    explanation:
      'Counting all numbers is **O(n)**; pushing each of the up-to-`n` distinct counts into a size-`k` heap costs **O(log k)** per push, total **O(n log k)**. The counts map holds up to `n` distinct values; the heap holds `k` — total space **O(n + k)**.',
    concept: 'bounded heap keeps the log factor small',
    topic_tags: ['arrays', 'heap', 'hashmap', 'multivariable'],
    difficulty: 'hard',
    variables: [
      { name: 'n', meaning: 'length of the input array nums' },
      { name: 'k', meaning: 'number of top-frequency elements to return' },
    ],
  },
  {
    kind: 'code',
    id: 'find-median-stream',
    code: {
      python: `import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap (store negated)
        self.hi = []  # min-heap

    def add_num(self, num):
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def find_median(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2`,
      javascript: `class MedianFinder {
  constructor() {
    this.lo = new MaxHeap();  // lower half
    this.hi = new MinHeap();  // upper half
  }
  addNum(num) {
    this.lo.push(num);
    this.hi.push(this.lo.pop());
    if (this.hi.size() > this.lo.size()) {
      this.lo.push(this.hi.pop());
    }
  }
  findMedian() {
    if (this.lo.size() > this.hi.size()) return this.lo.peek();
    return (this.lo.peek() + this.hi.peek()) / 2;
  }
}`,
    },
    method_times: [
      { method: 'addNum', time_complexity: 'O(log n)' },
      { method: 'findMedian', time_complexity: 'O(1)' },
    ],
    space_complexity: 'O(n)',
    explanation:
      '`addNum` does a constant number of heap pushes/pops, each **O(log n)** — so per-add time is **O(log n)**. `findMedian` only peeks both heap tops in **O(1)**. The two heaps together hold all `n` elements seen so far, giving **O(n)** total space.',
    concept: 'two heaps balance for log-time insertion',
    topic_tags: ['heap', 'design', 'two-heaps'],
    difficulty: 'hard',
    variables: [{ name: 'n', meaning: 'number of elements added so far' }],
  },

  // ===== Graphs (4) =====
  {
    kind: 'code',
    id: 'number-of-islands',
    code: {
      python: `def num_islands(grid):
    if not grid:
        return 0
    m, n = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or c < 0 or r >= m or c >= n or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(m):
        for c in range(n):
            if grid[r][c] == '1':
                dfs(r, c)
                count += 1
    return count`,
      javascript: `function numIslands(grid) {
  if (!grid.length) return 0;
  const m = grid.length, n = grid[0].length;
  let count = 0;
  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === '1') {
        dfs(r, c);
        count++;
      }
    }
  }
  return count;
}`,
    },
    time_complexity: 'O(m * n)',
    space_complexity: 'O(m * n)',
    accepted_equivalent_forms: {
      time: ['O(m · n)', 'O(mn)'],
      space: ['O(m · n)', 'O(mn)'],
    },
    explanation:
      'Each cell is visited at most once across all DFS calls — total time **O(m · n)**. The recursion stack can grow to the size of the largest island, which in the worst case is the whole grid — **O(m · n)** auxiliary space.',
    concept: 'amortized DFS over a grid',
    topic_tags: ['graphs', 'grid', 'dfs', 'multivariable'],
    difficulty: 'medium',
    variables: [
      { name: 'm', meaning: 'number of rows in the grid' },
      { name: 'n', meaning: 'number of columns in the grid' },
    ],
  },
  {
    kind: 'code',
    id: 'clone-graph',
    code: {
      python: `def clone_graph(node):
    if not node:
        return None
    visited = {}

    def dfs(cur):
        if cur in visited:
            return visited[cur]
        clone = Node(cur.val)
        visited[cur] = clone
        for nb in cur.neighbors:
            clone.neighbors.append(dfs(nb))
        return clone

    return dfs(node)`,
      javascript: `function cloneGraph(node) {
  if (!node) return null;
  const visited = new Map();
  function dfs(cur) {
    if (visited.has(cur)) return visited.get(cur);
    const clone = { val: cur.val, neighbors: [] };
    visited.set(cur, clone);
    for (const nb of cur.neighbors) clone.neighbors.push(dfs(nb));
    return clone;
  }
  return dfs(node);
}`,
    },
    time_complexity: 'O(v + e)',
    space_complexity: 'O(v)',
    explanation:
      'Each vertex is cloned once and each edge is traversed once (twice in an undirected graph, still O(e)) — total time **O(V + E)**. The visited map holds one entry per vertex; the recursion stack is bounded by the longest path, also at most `V` — **O(V)** auxiliary.',
    concept: 'graph traversal: vertex + edge cost',
    topic_tags: ['graphs', 'dfs', 'hashmap', 'multivariable'],
    difficulty: 'hard',
    variables: [
      { name: 'v', meaning: 'number of vertices (graph nodes)' },
      { name: 'e', meaning: 'number of edges' },
    ],
  },
  {
    kind: 'code',
    id: 'course-schedule',
    code: {
      python: `def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        graph[b].append(a)
    UNVISITED, VISITING, DONE = 0, 1, 2
    state = [UNVISITED] * num_courses

    def dfs(node):
        if state[node] == VISITING:
            return False
        if state[node] == DONE:
            return True
        state[node] = VISITING
        for nb in graph[node]:
            if not dfs(nb):
                return False
        state[node] = DONE
        return True

    for i in range(num_courses):
        if not dfs(i):
            return False
    return True`,
      javascript: `function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) graph[b].push(a);
  const state = new Array(numCourses).fill(0);
  function dfs(node) {
    if (state[node] === 1) return false;  // cycle
    if (state[node] === 2) return true;
    state[node] = 1;
    for (const nb of graph[node]) {
      if (!dfs(nb)) return false;
    }
    state[node] = 2;
    return true;
  }
  for (let i = 0; i < numCourses; i++) {
    if (!dfs(i)) return false;
  }
  return true;
}`,
    },
    time_complexity: 'O(v + e)',
    space_complexity: 'O(v + e)',
    explanation:
      'Each vertex is visited once via the three-color DFS, each edge traversed once — **O(V + E)** time. The adjacency list itself is **O(V + E)** space; the recursion stack is bounded by `V`. Combined: **O(V + E)**.',
    concept: 'graph traversal: vertex + edge cost',
    topic_tags: ['graphs', 'dfs', 'cycle-detection', 'multivariable'],
    difficulty: 'hard',
    variables: [
      { name: 'v', meaning: 'number of vertices (courses)' },
      { name: 'e', meaning: 'number of edges (prerequisites)' },
    ],
  },
  {
    kind: 'code',
    id: 'pacific-atlantic',
    code: {
      python: `def pacific_atlantic(heights):
    if not heights:
        return []
    m, n = len(heights), len(heights[0])
    pac, atl = set(), set()

    def dfs(r, c, visited, prev):
        if ((r, c) in visited or r < 0 or c < 0
                or r >= m or c >= n or heights[r][c] < prev):
            return
        visited.add((r, c))
        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            dfs(r + dr, c + dc, visited, heights[r][c])

    for r in range(m):
        dfs(r, 0, pac, 0)
        dfs(r, n - 1, atl, 0)
    for c in range(n):
        dfs(0, c, pac, 0)
        dfs(m - 1, c, atl, 0)
    return [list(cell) for cell in pac & atl]`,
      javascript: `function pacificAtlantic(heights) {
  if (!heights.length) return [];
  const m = heights.length, n = heights[0].length;
  const pac = new Set(), atl = new Set();
  function dfs(r, c, visited, prev) {
    const key = r * n + c;
    if (visited.has(key) || r < 0 || c < 0 || r >= m || c >= n
        || heights[r][c] < prev) return;
    visited.add(key);
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      dfs(r + dr, c + dc, visited, heights[r][c]);
    }
  }
  for (let r = 0; r < m; r++) {
    dfs(r, 0, pac, 0);
    dfs(r, n - 1, atl, 0);
  }
  for (let c = 0; c < n; c++) {
    dfs(0, c, pac, 0);
    dfs(m - 1, c, atl, 0);
  }
  const out = [];
  for (const k of pac) if (atl.has(k)) out.push([Math.floor(k / n), k % n]);
  return out;
}`,
    },
    time_complexity: 'O(m * n)',
    space_complexity: 'O(m * n)',
    accepted_equivalent_forms: {
      time: ['O(m · n)', 'O(mn)'],
      space: ['O(m · n)', 'O(mn)'],
    },
    explanation:
      'Two DFS traversals from the borders, each visiting every cell at most once — **O(m · n)** time. Both visited sets together hold up to `m · n` cells, and recursion stack matches; **O(m · n)** auxiliary.',
    concept: 'multi-source DFS from grid boundary',
    topic_tags: ['graphs', 'grid', 'dfs', 'multivariable'],
    difficulty: 'hard',
    variables: [
      { name: 'm', meaning: 'number of rows in the grid' },
      { name: 'n', meaning: 'number of columns in the grid' },
    ],
  },

  // ===== Dynamic Programming (5) =====
  {
    kind: 'code',
    id: 'climbing-stairs',
    code: {
      python: `def climb_stairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
      javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'A single linear loop computing each step from the prior two — **O(n)** time. Only two rolling variables are kept, **O(1)** space. The naive recursive form (without memo) is the classic O(2ⁿ) trap.',
    concept: 'rolling DP with O(1) state',
    topic_tags: ['dp', 'fibonacci'],
    difficulty: 'easy',
    variables: [{ name: 'n', meaning: 'number of stairs (the input integer)' }],
  },
  {
    kind: 'code',
    id: 'house-robber',
    code: {
      python: `def rob(nums):
    prev = curr = 0
    for x in nums:
        prev, curr = curr, max(curr, prev + x)
    return curr`,
      javascript: `function rob(nums) {
  let prev = 0, curr = 0;
  for (const x of nums) {
    [prev, curr] = [curr, Math.max(curr, prev + x)];
  }
  return curr;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'One linear pass with two rolling DP values — **O(n)** time, **O(1)** space. The full DP table form is also O(n) space, but the rolling variables collapse it.',
    concept: 'rolling DP with O(1) state',
    topic_tags: ['dp'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'length of the houses array' }],
  },
  {
    kind: 'code',
    id: 'coin-change',
    code: {
      python: `def coin_change(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if a - c >= 0:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != amount + 1 else -1`,
      javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (a - c >= 0) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === amount + 1 ? -1 : dp[amount];
}`,
    },
    time_complexity: 'O(n * t)',
    space_complexity: 'O(t)',
    accepted_equivalent_forms: {
      time: ['O(n · t)', 'O(nt)'],
    },
    explanation:
      'The DP fills `t + 1` cells; for each cell it tries all `n` coins — **O(n · t)** total. The DP array has `t + 1` entries, **O(t)** space. The dominant variable is the target value, not the input length — a classic pseudopolynomial.',
    concept: 'pseudopolynomial DP — value drives the cost',
    topic_tags: ['dp', 'multivariable'],
    difficulty: 'hard',
    variables: [
      { name: 'n', meaning: 'number of coin denominations' },
      { name: 't', meaning: 'target amount' },
    ],
  },
  {
    kind: 'code',
    id: 'longest-increasing-subseq',
    code: {
      python: `def length_of_lis(nums):
    n = len(nums)
    if n == 0:
        return 0
    dp = [1] * n
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
      javascript: `function lengthOfLIS(nums) {
  const n = nums.length;
  if (n === 0) return 0;
  const dp = new Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return Math.max(...dp);
}`,
    },
    time_complexity: 'O(n²)',
    space_complexity: 'O(n)',
    accepted_equivalent_forms: {
      time: ['O(n^2)'],
    },
    explanation:
      'Two nested loops over the array — **O(n²)** time. The DP array is **O(n)** space. There is an O(n log n) variant using binary search on a tails array; this O(n²) form is the textbook canonical.',
    concept: 'quadratic DP over index pairs',
    topic_tags: ['dp'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'length of the input array nums' }],
  },
  {
    kind: 'code',
    id: 'word-break',
    code: {
      python: `def word_break(s, word_dict):
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    for i in range(1, n + 1):
        for word in word_dict:
            wlen = len(word)
            if wlen <= i and dp[i - wlen] and s[i - wlen:i] == word:
                dp[i] = True
                break
    return dp[n]`,
      javascript: `function wordBreak(s, wordDict) {
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i++) {
    for (const word of wordDict) {
      const wlen = word.length;
      if (wlen <= i && dp[i - wlen] && s.slice(i - wlen, i) === word) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}`,
    },
    time_complexity: 'O(n² * m)',
    space_complexity: 'O(n)',
    accepted_equivalent_forms: {
      time: ['O(n^2 · m)', 'O(n^2 m)', 'O(n² · m)'],
    },
    explanation:
      'For each of the `n` positions we try every dictionary word (`m` of them), and the substring comparison is up to `n` characters — **O(n² · m)** time. The DP array holds `n + 1` booleans, **O(n)** space.',
    concept: 'DP × dictionary scan, multivariable',
    topic_tags: ['dp', 'strings', 'multivariable'],
    difficulty: 'hard',
    variables: [
      { name: 'n', meaning: 'length of the input string s' },
      { name: 'm', meaning: 'number of words in the dictionary' },
    ],
  },

  // ===== Intervals (2) =====
  {
    kind: 'code',
    id: 'merge-intervals',
    code: {
      python: `def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])
    res = []
    for start, end in intervals:
        if res and start <= res[-1][1]:
            res[-1][1] = max(res[-1][1], end)
        else:
            res.append([start, end])
    return res`,
      javascript: `function mergeIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [];
  for (const [start, end] of intervals) {
    if (res.length && start <= res[res.length - 1][1]) {
      res[res.length - 1][1] = Math.max(res[res.length - 1][1], end);
    } else {
      res.push([start, end]);
    }
  }
  return res;
}`,
    },
    time_complexity: 'O(n log n)',
    space_complexity: 'O(n)',
    explanation:
      'Sorting dominates — **O(n log n)**. The sweep itself is linear. Output (and sort scratch) take **O(n)** space.',
    concept: 'sort dominates a linear sweep',
    topic_tags: ['intervals', 'sorting'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'number of input intervals' }],
  },
  {
    kind: 'code',
    id: 'insert-interval',
    code: {
      python: `def insert(intervals, new_interval):
    res = []
    i, n = 0, len(intervals)
    while i < n and intervals[i][1] < new_interval[0]:
        res.append(intervals[i])
        i += 1
    while i < n and intervals[i][0] <= new_interval[1]:
        new_interval[0] = min(new_interval[0], intervals[i][0])
        new_interval[1] = max(new_interval[1], intervals[i][1])
        i += 1
    res.append(new_interval)
    while i < n:
        res.append(intervals[i])
        i += 1
    return res`,
      javascript: `function insertInterval(intervals, newInterval) {
  const res = [];
  let i = 0;
  const n = intervals.length;
  while (i < n && intervals[i][1] < newInterval[0]) res.push(intervals[i++]);
  while (i < n && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
  }
  res.push(newInterval);
  while (i < n) res.push(intervals[i++]);
  return res;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    explanation:
      'A single sweep over already-sorted intervals — **O(n)** time. The result list holds up to `n + 1` intervals, **O(n)** space. No sorting needed because the input is sorted by hypothesis.',
    concept: 'linear sweep on already-sorted input',
    topic_tags: ['intervals'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'number of input intervals' }],
  },

  // ===== Matrix (2) =====
  {
    kind: 'code',
    id: 'set-matrix-zeroes',
    code: {
      python: `def set_zeroes(matrix):
    m, n = len(matrix), len(matrix[0])
    first_row_zero = any(matrix[0][c] == 0 for c in range(n))
    first_col_zero = any(matrix[r][0] == 0 for r in range(m))
    for r in range(1, m):
        for c in range(1, n):
            if matrix[r][c] == 0:
                matrix[r][0] = 0
                matrix[0][c] = 0
    for r in range(1, m):
        for c in range(1, n):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0
    if first_row_zero:
        for c in range(n):
            matrix[0][c] = 0
    if first_col_zero:
        for r in range(m):
            matrix[r][0] = 0`,
      javascript: `function setZeroes(matrix) {
  const m = matrix.length, n = matrix[0].length;
  let firstRowZero = false, firstColZero = false;
  for (let c = 0; c < n; c++) if (matrix[0][c] === 0) firstRowZero = true;
  for (let r = 0; r < m; r++) if (matrix[r][0] === 0) firstColZero = true;
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      if (matrix[r][c] === 0) {
        matrix[r][0] = 0;
        matrix[0][c] = 0;
      }
    }
  }
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;
    }
  }
  if (firstRowZero) for (let c = 0; c < n; c++) matrix[0][c] = 0;
  if (firstColZero) for (let r = 0; r < m; r++) matrix[r][0] = 0;
}`,
    },
    time_complexity: 'O(m * n)',
    space_complexity: 'O(1)',
    accepted_equivalent_forms: {
      time: ['O(m · n)', 'O(mn)'],
    },
    explanation:
      'A constant number of passes over the grid — **O(m · n)** time. By using the first row and column as marker storage we avoid the O(m + n) auxiliary array, achieving **O(1)** auxiliary space.',
    concept: 'in-place markers replace auxiliary array',
    topic_tags: ['matrix', 'multivariable'],
    difficulty: 'hard',
    variables: [
      { name: 'm', meaning: 'number of rows in the matrix' },
      { name: 'n', meaning: 'number of columns in the matrix' },
    ],
  },
  {
    kind: 'code',
    id: 'spiral-matrix',
    code: {
      python: `def spiral_order(matrix):
    if not matrix:
        return []
    m, n = len(matrix), len(matrix[0])
    res = []
    top, bottom = 0, m - 1
    left, right = 0, n - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
    return res`,
      javascript: `function spiralOrder(matrix) {
  if (!matrix.length) return [];
  const m = matrix.length, n = matrix[0].length;
  const res = [];
  let top = 0, bottom = m - 1, left = 0, right = n - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) res.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) res.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) res.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) res.push(matrix[r][left]);
      left++;
    }
  }
  return res;
}`,
    },
    time_complexity: 'O(m * n)',
    space_complexity: 'O(1)',
    accepted_equivalent_forms: {
      time: ['O(m · n)', 'O(mn)'],
      space: ['O(m · n)'],
    },
    explanation:
      'Each cell is visited exactly once — **O(m · n)** time. Auxiliary space is **O(1)** if we exclude the output; counting the output makes it O(m · n).',
    concept: 'single pass over a grid',
    topic_tags: ['matrix', 'multivariable'],
    difficulty: 'medium',
    variables: [
      { name: 'm', meaning: 'number of rows in the matrix' },
      { name: 'n', meaning: 'number of columns in the matrix' },
    ],
  },

  // ===== "Looks like X but is Y" twists (6) =====
  {
    kind: 'code',
    id: 'twist-half-bound-nested',
    code: {
      python: `def count_smaller_pairs(arr):
    count = 0
    n = len(arr)
    for i in range(n):
        for j in range(i):
            if arr[j] < arr[i]:
                count += 1
    return count`,
      javascript: `function countSmallerPairs(arr) {
  let count = 0;
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) count++;
    }
  }
  return count;
}`,
    },
    time_complexity: 'O(n²)',
    space_complexity: 'O(1)',
    accepted_equivalent_forms: {
      time: ['O(n^2)'],
    },
    explanation:
      'It looks like "half" of a quadratic loop because `j < i`, but the total comparisons are `0 + 1 + ... + (n-1) = n(n-1)/2` which is still **O(n²)** after dropping the constant. Space is **O(1)**.',
    concept: "constant factor doesn't change the class",
    topic_tags: ['twist', 'nested-loops'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'length of the input array' }],
  },
  {
    kind: 'code',
    id: 'twist-doubling-inner',
    code: {
      python: `def count_doublings(arr):
    n = len(arr)
    count = 0
    for i in range(n):
        j = 1
        while j < n:
            count += 1
            j *= 2
    return count`,
      javascript: `function countDoublings(arr) {
  const n = arr.length;
  let count = 0;
  for (let i = 0; i < n; i++) {
    let j = 1;
    while (j < n) {
      count++;
      j *= 2;
    }
  }
  return count;
}`,
    },
    time_complexity: 'O(n log n)',
    space_complexity: 'O(1)',
    explanation:
      'Looks quadratic at first glance — two nested loops — but the inner loop multiplies `j` by 2 each step, so it runs **O(log n)** times, not `n`. Outer × inner = **O(n log n)**. Space is **O(1)**.',
    concept: 'doubling makes the inner loop logarithmic',
    topic_tags: ['twist', 'nested-loops', 'logarithmic'],
    difficulty: 'hard',
    variables: [{ name: 'n', meaning: 'length of the input array' }],
  },
  {
    kind: 'code',
    id: 'twist-shift-in-loop',
    code: {
      python: `def double_all(arr):
    result = []
    while arr:
        x = arr.pop(0)
        result.append(x * 2)
    return result`,
      javascript: `function doubleAll(arr) {
  const result = [];
  while (arr.length) {
    const x = arr.shift();
    result.push(x * 2);
  }
  return result;
}`,
    },
    time_complexity: 'O(n²)',
    space_complexity: 'O(n)',
    accepted_equivalent_forms: {
      time: ['O(n^2)'],
    },
    explanation:
      'Looks linear — single while-loop, one element handled per iteration — but `arr.shift()` (and Python `arr.pop(0)`) is **O(n)** because every remaining element shifts left. `n` iterations × O(n) per shift = **O(n²)**. Output list takes **O(n)** space.',
    concept: 'hidden cost: array shift is O(n)',
    topic_tags: ['twist', 'hidden-cost'],
    difficulty: 'hard',
    variables: [{ name: 'n', meaning: 'length of the input array' }],
  },
  {
    kind: 'code',
    id: 'twist-string-concat',
    code: {
      python: `def join_words(words):
    result = ''
    for w in words:
        result = result + w
    return result`,
      javascript: `function joinWords(words) {
  let result = '';
  for (const w of words) {
    result = result + w;
  }
  return result;
}`,
    },
    time_complexity: 'O(n²)',
    space_complexity: 'O(n)',
    accepted_equivalent_forms: {
      time: ['O(n^2)'],
    },
    explanation:
      'Looks linear — one `+=` per word — but each concatenation copies the entire result so far because strings are immutable. Summing 1 + 2 + ... + n character copies is **O(n²)**. Final string holds `n` chars, **O(n)** space. The fix is `"".join(words)` / `words.join("")` which is O(n).',
    concept: 'hidden cost: immutable string concatenation',
    topic_tags: ['twist', 'strings', 'hidden-cost'],
    difficulty: 'hard',
    variables: [
      { name: 'n', meaning: 'total length of the concatenated result' },
    ],
  },
  {
    kind: 'code',
    id: 'twist-memoized-recursion',
    code: {
      python: `def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n < 2:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]`,
      javascript: `function fibMemo(n, memo = new Map()) {
  if (memo.has(n)) return memo.get(n);
  if (n < 2) return n;
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    explanation:
      'Looks like the classic exponential Fibonacci, but the memo turns it into **O(n)** time — each subproblem `fib(k)` is computed exactly once. Memo plus call stack add up to **O(n)** auxiliary. The structure of the recursion is identical to the naive form; the memo changes everything.',
    concept: 'memoization collapses exponential to linear',
    topic_tags: ['twist', 'recursion', 'memoization', 'dp'],
    difficulty: 'hard',
    variables: [{ name: 'n', meaning: 'value of the input integer' }],
  },
  {
    kind: 'code',
    id: 'twist-naive-fib',
    code: {
      python: `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
      javascript: `function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}`,
    },
    time_complexity: 'O(2^n)',
    space_complexity: 'O(n)',
    explanation:
      'Two recursive calls per invocation with no memo grows the call tree to roughly 2ⁿ nodes — **O(2ⁿ)** time (more tightly Θ(φⁿ)). Despite the exponential call count, the recursion stack only goes `n` deep at any one time — **O(n)** space.',
    concept: 'branching recursion → exponential',
    topic_tags: ['twist', 'recursion', 'exponential'],
    difficulty: 'medium',
    variables: [
      { name: 'n', meaning: 'value of the input integer (not array length)' },
    ],
  },

  // ===== Pedagogical specials (3) =====
  {
    kind: 'code',
    id: 'special-dynamic-array-push',
    code: {
      python: `def build_list(n):
    arr = []
    for i in range(n):
        arr.append(i)
    return arr`,
      javascript: `function buildList(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(i);
  }
  return arr;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    explanation:
      'Each push is **O(1) amortized** — most are constant-time, but occasional resizes copy everything. Across `n` pushes the total copy work is bounded by 2n (geometric), so the function as a whole is **O(n)** time. The final array holds `n` elements, **O(n)** space. Worst-case-per-push is O(n), but amortized analysis is what matters here.',
    concept: 'amortized analysis',
    topic_tags: ['amortized', 'pedagogical'],
    difficulty: 'hard',
    variables: [{ name: 'n', meaning: 'number of pushes / final array size' }],
  },
  {
    kind: 'code',
    id: 'special-early-return-sorted',
    code: {
      python: `def contains_target(sorted_arr, target):
    for x in sorted_arr:
        if x == target:
            return True
        if x > target:
            return False
    return False`,
      javascript: `function containsTarget(sortedArr, target) {
  for (const x of sortedArr) {
    if (x === target) return true;
    if (x > target) return false;
  }
  return false;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    explanation:
      'The early return makes some inputs return in O(1) — but big-O describes the **worst case**: target absent and larger than every element. Worst case is **O(n)**. The best case is O(1), the average depends on distribution. Big-O conventions ignore best/average unless stated.',
    concept: 'worst case vs best case',
    topic_tags: ['pedagogical', 'best-vs-worst'],
    difficulty: 'medium',
    variables: [{ name: 'n', meaning: 'length of the sorted input array' }],
  },
  {
    kind: 'code',
    id: 'special-balanced-bst-traversal',
    code: {
      python: `def in_order(node, out):
    if not node:
        return
    in_order(node.left, out)
    out.append(node.val)
    in_order(node.right, out)

def traverse(root):
    out = []
    in_order(root, out)
    return out`,
      javascript: `function inOrder(node, out) {
  if (!node) return;
  inOrder(node.left, out);
  out.push(node.val);
  inOrder(node.right, out);
}

function traverse(root) {
  const out = [];
  inOrder(root, out);
  return out;
}`,
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(log n)',
    explanation:
      'Every node is visited once — **O(n)** time. The recursion stack grows with tree depth: for a **balanced** BST the depth is `log n`, so auxiliary space is **O(log n)**. For a degenerate (chain) tree it would be O(n) — the balanced assumption is the whole lesson here.',
    concept: 'balanced ⇒ logarithmic stack depth',
    topic_tags: ['pedagogical', 'trees', 'recursion'],
    difficulty: 'hard',
    variables: [{ name: 'n', meaning: 'number of nodes in the balanced tree' }],
  },

  // ===== Data structure quiz problems (6) =====
  {
    kind: 'datastructure',
    id: 'ds-binary-heap-push',
    prompt:
      'What is the time complexity of pushing a value onto a binary heap?',
    time_complexity: 'O(log n)',
    explanation:
      'A binary heap is a complete binary tree of height **log n**. Push appends the new value at the bottom and bubbles it up by repeated parent comparisons — at most one swap per level, so **O(log n)** comparisons and swaps.',
    concept: 'tree-height bound on heap operations',
    topic_tags: ['data-structures', 'heap'],
    difficulty: 'easy',
  },
  {
    kind: 'datastructure',
    id: 'ds-binary-heap-peek',
    prompt:
      'What is the time complexity of peeking at the top (max or min) of a binary heap?',
    time_complexity: 'O(1)',
    explanation:
      'The top element is always at the root, which is index 0 of the underlying array. No traversal, no swaps — a constant-time array read, **O(1)**.',
    concept: 'constant-time access at the heap root',
    topic_tags: ['data-structures', 'heap'],
    difficulty: 'easy',
  },
  {
    kind: 'datastructure',
    id: 'ds-hashmap-lookup-average',
    prompt:
      'What is the average-case time complexity of looking up a key in a hashmap?',
    time_complexity: 'O(1)',
    explanation:
      'On average, the hash function distributes keys across buckets so each bucket holds a constant number of entries. Lookup hashes the key and walks the bucket — **O(1)** expected. (Worst case is O(n) when every key collides into one bucket — see the related problem.)',
    concept: 'expected O(1) for distributed keys',
    topic_tags: ['data-structures', 'hashmap'],
    difficulty: 'easy',
  },
  {
    kind: 'datastructure',
    id: 'ds-hashmap-lookup-worst',
    prompt:
      'What is the worst-case time complexity of looking up a key in a hashmap?',
    time_complexity: 'O(n)',
    explanation:
      'In the pathological case where every key hashes to the same bucket, the bucket becomes a linear list of `n` entries and lookup walks all of them — **O(n)**. Average case is O(1) (see the related problem); production hashmaps use techniques like tree-bucketed chaining (Java HashMap) or robin-hood probing to keep this from biting in practice, but the asymptotic worst case stands.',
    concept: 'hashmap collision worst case',
    topic_tags: ['data-structures', 'hashmap'],
    difficulty: 'medium',
  },
  {
    kind: 'datastructure',
    id: 'ds-linked-list-head-insert',
    prompt:
      'What is the time complexity of inserting a node at the head of a singly linked list?',
    time_complexity: 'O(1)',
    explanation:
      'Allocate the new node, point its `next` at the current head, then update the head pointer to the new node. No traversal, **O(1)**. The contrast with arrays — where head insertion is O(n) due to shifting — is one of the main reasons linked lists exist.',
    concept: 'constant-time pointer manipulation',
    topic_tags: ['data-structures', 'linked-list'],
    difficulty: 'medium',
  },
  {
    kind: 'datastructure',
    id: 'ds-dynamic-array-append',
    prompt:
      'What is the amortized time complexity of appending to a dynamic array (e.g. Python list, JavaScript Array)?',
    time_complexity: 'O(1)',
    accepted_equivalent_forms: {
      time: ['O(1) amortized'],
    },
    explanation:
      'Most appends are constant-time writes to an internal buffer. Occasionally the buffer fills and the array doubles, copying all existing elements — that single append is O(n). But because the buffer doubles, those expensive appends are rare enough that the **amortized** cost across `n` appends is bounded by 2n total writes — **O(1) amortized per append**. The worst-case-per-append is O(n); make sure the question is asking for amortized when you give this answer.',
    concept: 'amortized analysis',
    topic_tags: ['data-structures', 'amortized', 'dynamic-array'],
    difficulty: 'hard',
  },
];
