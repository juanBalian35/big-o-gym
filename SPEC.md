# Complexity Practice Tool — MVP Spec

> v1.0. Author: Juan + Claude. All open questions resolved. This is the spec we build from.

## What this is

A web tool where engineers practice identifying the time and space complexity of code snippets, primarily as interview prep. Educational first; light competitive/social texture comes later.

## Who it's for

Engineers actively preparing for technical interviews — early-career to mid-level, comfortable reading code in mainstream languages. Not students learning algorithms for the first time, not senior engineers reviewing fundamentals. The voice and difficulty calibration target someone who has done some LeetCode and wants to sharpen the analysis side.

## The core loop

1. User lands on the site. No signup, no friction. Sees a code snippet immediately.
2. User reads the snippet and types an answer for time complexity and space complexity.
3. App tells them whether they were correct, almost correct (right idea but didn't simplify), or wrong on each, and shows a written explanation of the correct answer.
4. User clicks "next" and gets another problem.
5. Progress persists in localStorage so it survives across visits on the same browser/device.

That's the whole MVP. No sessions, no streaks, no leaderboards, no skill map. Just: read code, type complexity, learn why.

## Explicitly out of scope for MVP

These are real features for later versions, not forever-no's. Listing them so they stay out of v1:

- User accounts, authentication, cross-device sync
- Email, notifications, re-engagement
- Skill taxonomy / topic tags exposed to user (tags exist in data, hidden in UI)
- Calibration / confidence ratings
- Percentile comparisons ("X% of users got this right")
- Streaks, daily problems, leaderboards
- Friend groups, sharing
- Stats / accuracy footer (no UI surface for personal progress in MVP)
- Mobile-optimized UI (must not be broken on mobile, but desktop-first)
- Light/dark mode toggle (dark only)
- Hints, multi-guess feedback, progressive reveals
- Difficulty levels exposed to user
- Θ vs O distinction (deferred to a future "analysis beyond interviews" track)
- Practical runtime follow-ups ("what's the biggest N that finishes in 1s?") — strong v2 feature

## Domain model

Two entities.

**Problem**
- `id`: string, stable identifier
- `code`: object `{ python: string, javascript: string }` — both languages required for every problem
- `time_complexity`: canonical string, e.g. `O(n log n)`
- `space_complexity`: canonical string, e.g. `O(n)`
- `accepted_equivalent_forms`: optional object with `time` and `space` arrays of additional canonical strings that should count as fully correct (used for semantic equivalences the normalizer can't infer, e.g. `O(n + m)` vs `O(max(n, m))`). Empty/omitted for most problems.
- `explanation`: markdown string, 2-4 sentences explaining why the complexities are what they are. Single explanation per problem — the complexity reasoning is language-agnostic.
- `topic_tags`: string array, e.g. `["recursion", "binary-search"]` — used internally for content authoring, not shown to user in MVP
- `difficulty`: enum `easy | medium | hard` — used internally, not shown

Authoring discipline: the Python and JavaScript versions of a problem must have the *same* complexity. Watch for language-specific gotchas (e.g., `arr.shift()` is O(n) in JS, `deque.popleft()` is O(1) in Python — these are different complexities, not parallel implementations).

**Attempt** (stored in localStorage)
- `problem_id`: string
- `language_shown`: enum `python | javascript`
- `time_answer`: string, what the user submitted (raw)
- `space_answer`: string, what the user submitted (raw)
- `time_result`: enum `correct | almost | wrong`
- `space_result`: enum `correct | almost | wrong`
- `timestamp`: ISO date string

No sessions, no scores, no derived state in storage — derive everything from the attempt log on the fly when needed.

**User preferences** (stored in localStorage, separate key)
- `preferred_language`: enum `python | javascript`. Defaults to `python` on first visit. User can toggle from the UI.

## The complexity input

**Decision: free-form text input with a normalizer.**

Both fields (time and space) are text inputs. The user types their answer in any reasonable notation. A normalizer parses the input, simplifies it, and compares against the canonical answer.

Three response states:
- ✅ **Correct.** User's answer matches the canonical answer (after syntactic normalization that doesn't involve dropping terms — e.g., `O(n*n)` → `O(n²)` is still correct).
- ⚠️ **Almost.** User's answer simplifies to the canonical answer, but the simplification involved dropping a constant or a dominated term. E.g., user wrote `O(2n)`, answer is `O(n)`. Feedback message: "Almost — drop the constant: O(2n) simplifies to O(n)."
- ❌ **Wrong.** User's answer doesn't match even after simplification. Show the canonical answer and the explanation.

This input format aligns with the educational-first goal: it tests recall (the skill interviews actually probe) rather than recognition from a list. It also unlocks multivariable problems (graph algorithms, matrix problems, edit-distance-style problems), which represent a substantial fraction of legitimate interview content.

UI affordance: a small hint under each field showing accepted notation, e.g. `examples: O(n), O(n log n), O(n + m), O(n²)`. No dropdown, no autocomplete in MVP.

## The normalizer (sub-spec)

This is the most novel engineering in the MVP and warrants its own spec section.

### Accepted input grammar

A complexity expression is composed of:
- Constants: positive integers (`1`, `2`, `100`)
- Variables: single lowercase letters (`n`, `m`, `k`, `v`, `e`)
- Operators: `+`, `*`, `·`, `^`, juxtaposition (e.g. `n log n` means `n * log(n)`)
- Functions: `log` (with optional base subscript, treated as base-2 for normalization purposes — the base doesn't affect big-O), `log₂`, `log_2`, `lg`, `ln`
- Exponent shortcuts: `²`, `³`, `^2`, `^3`, etc.
- Optional outer wrapping: `O(...)`, `o(...)`. Stripped if present.

Whitespace is ignored. Capitalization of variables is normalized to lowercase (`N` → `n`).

### Simplification rules

Applied in order:
1. **Drop constants.** `O(2n)` → `O(n)`. `O(5)` → `O(1)`. Constant *coefficients* drop; constants as the entire expression become `O(1)`.
2. **Drop dominated terms in sums.** `O(n + log n)` → `O(n)`. `O(n² + n)` → `O(n²)`. Comparison uses standard big-O ordering on single-variable terms. For multivariable sums where neither dominates (e.g. `O(n + m)`), keep both.
3. **Normalize log bases.** `O(log₂ n)`, `O(log_2 n)`, `O(lg n)`, `O(ln n)`, `O(log n)` all normalize to `O(log n)`.
4. **Normalize multiplication notation.** `n * n`, `n · n`, `nn` (juxtaposition) → `n²`. `n * log n` and `n log n` are equivalent.
5. **Normalize exponent notation.** `n^2`, `n²` → `n²` (pick one as canonical for display).

### "Correct" vs "almost" classification

After normalization, the input becomes a canonical AST. Compare against the problem's canonical answer (also normalized).

- If they match AND no rules from {drop constants, drop dominated terms} were applied during simplification of the user input → **correct**.
- If they match AND at least one of {drop constants, drop dominated terms} was applied → **almost**. Show what was simplified.
- If they don't match → **wrong**. Also check `accepted_equivalent_forms`; if user's normalized input matches any of those, treat as correct.

Rules 3, 4, 5 (log bases, multiplication, exponent notation) are syntactic rewrites, not simplifications. They don't trigger "almost" — applying them and matching is fully correct.

### What the normalizer does NOT handle

- Semantic equivalences like `O(n + m)` vs `O(max(n, m))`. These are handled per-problem via `accepted_equivalent_forms`.
- `Θ` vs `O` distinction. Treat `Θ(...)` and `O(...)` identically for MVP. (Future: separate track.)
- Amortized vs worst-case annotations like "O(1) amortized." Strip the annotation; treat as `O(1)`. Note in explanation if the distinction matters for the problem.
- Expressions outside the grammar (e.g., `O(n!)` is in scope; `O(n^n)` is in scope; `O(α(n))` for inverse Ackermann is out of scope — no v1 problem needs it).

### Failure modes

If the normalizer can't parse the input (e.g., user typed "linear" or "fast"), surface a friendly error: "Couldn't parse that. Try notation like O(n) or O(n log n)." Don't count it as a wrong answer — let them retype. This is the only re-try path in the MVP.

## The page (the entire UI)

One page. Components on it:

1. **Header.** Product name on the left. Language toggle on the right (Python / JavaScript). Toggle changes the displayed code snippet for the current and future problems; persists to localStorage.
2. **Code panel.** The current problem's snippet in the user's preferred language, syntax-highlighted, monospace, generously sized.
3. **Answer panel.** Two labeled text inputs: "Time complexity" and "Space complexity," with notation hints underneath. A "Submit" button below them, disabled until both are filled.
4. **Result panel.** Hidden until submit. After submit, shows:
   - For each of time and space: status (✅ correct / ⚠️ almost / ❌ wrong), the user's answer, the canonical answer.
   - For "almost" results, a one-line explanation of what to simplify.
   - The full explanation, rendered as markdown.
   - A "Next problem" button.

That's the entire UI. No tabs, no modals, no settings, no profile, no stats footer.

## Behavior details

- **Problem selection.** Random from the pool, with the constraint that the user shouldn't see the same problem twice in a row. After the user has attempted every problem in the pool at least once, behavior is: keep serving random ones, no special "you've completed everything" state in MVP.
- **Submission is final per problem.** No "try again" within a problem (except for normalizer parse failures — see above). Wrong is wrong; user reads the explanation and moves on. They can re-encounter the problem later via the random selection.
- **No timer.** MVP has no timer.
- **Language toggle mid-problem.** If the user toggles language while a problem is displayed, the snippet updates immediately to the other language version. Doesn't reset their typed answer.

## Content

Hand-authored TypeScript file shipped with the app. Target for launch: **50 problems**, with the content pipeline designed to scale to 100+ post-launch if the product earns growth.

Each problem must include both Python and JavaScript versions of the code, plus one language-agnostic explanation written by Juan. Voice is tutor-like: brief, clear, willing to call out the common mistake.

The pool should include:

- Single-variable canonical-ladder problems (binary search, simple loops, recursion)
- Multivariable problems (BFS/DFS on graphs with V and E, matrix problems with m × n, edit-distance-shaped problems with two strings)
- "Looks like A but is actually B" problems (nested loop that's actually linear; recursive function that's actually polynomial via memoization)
- Problems where space and time complexities differ in instructive ways

Distribution should overrepresent the common interview complexities (O(n), O(n log n), O(n²), O(V + E), O(m · n)) and underrepresent the rare ones (O(n!), O(n³)).

### Content pipeline requirements

The MVP authoring workflow must support scaling to 100+ problems comfortably:
- Adding a new problem = single PR adding one entry to the problems file
- Schema validation runs at build time — invalid problems fail the build
- Optional CLI helper to scaffold a new problem entry (nice-to-have, not blocking)

## Technical choices

- **Framework:** Vite + React + TypeScript. Pure SPA — no backend, no SSR. Deploy as static files.
- **Styling:** Tailwind. No component library; the UI is small enough to build by hand and keeps bundle size minimal.
- **Syntax highlighting:** Shiki, pre-rendered at build time via a build script that processes `problems.ts` into highlighted HTML. Avoids shipping the Shiki runtime to the browser. Must support both Python and JavaScript.
- **State:** React state for current-problem flow, localStorage for persistence and language preference. No global state library, no server, no database.
- **Normalizer:** Custom, written in TypeScript. Hand-rolled recursive-descent parser → AST → simplifier → canonical-form comparison. ~300-500 lines including tests. Tests are not optional for this module — it's the core IP.
- **Content:** Single `problems.ts` (TypeScript for type safety on the schema) checked into the repo. Adding a new problem = a PR.
- **Deployment:** Cloudflare Pages or Vercel — both work for static Vite output. Pick whichever is more familiar.
- **Analytics:** Plausible or similar privacy-respecting analytics, just for "are people coming back" signal. No per-user tracking.

## Visual design

Clean, monospace-heavy, low-chrome. Vaguely terminal/IDE aesthetic — fits the audience and is fast to build. Single dark theme. Accent color for ✅ (green), ⚠️ (amber), ❌ (red). The code panel and answer panel should feel like the focus; everything else recedes.

No animations, no transitions beyond what's necessary for readability. The product feels serious and respectful of the user's time.

## Success criteria for the MVP

The MVP is "successful" if, after sharing it with ~50-100 engineers (Reddit, Hacker News, dev Twitter), it produces:

- A noticeable fraction of users completing 5+ problems in a session (signals the loop is engaging)
- A noticeable fraction returning within a week (signals it's worth coming back)
- Qualitative feedback that the explanations are useful and the difficulty feels right

If those signals are weak, the answer isn't to add features — it's to revisit whether the core loop is right at all. If they're strong, the next features to consider are: more problems (50 → 100+), skill tags exposed to user, lightweight progress visualization, the practical-runtime follow-up question, and (only then) the daily-problem / social hooks.
