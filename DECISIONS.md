# DECISIONS.md

Non-obvious choices, logged as we make them.

## Initial decisions (Ticket 1)

- **SPA over Next.js.** No SSR, no server. Pure static deploy. The product is a one-pager with no SEO surface that matters and no need for server-side rendering.
- **No auth.** Anonymous users. State lives in the browser.
- **localStorage only.** No accounts, no cross-device sync. Survives refresh on the same browser.
- **Dark theme only.** Single theme; no toggle. Terminal aesthetic.
- **Free-form input with normalizer.** Not a multiple-choice picker. Tests recall, not recognition. See SPEC.md for the normalizer rules.

## Ticket 2.5

- **Variable disclosure: always show all variables and their meanings before submission.** Considered hiding variables for "trick" problems to preserve a discovery moment, but rejected because: (1) forcing users to invent variable names creates submission anxiety, (2) interview conventions matter (V/E for graphs, m/n for grids) and disclosure trains those conventions, (3) the pedagogical loss is bounded - knowing the variables exist doesn't tell the user how they combine, which is most of the analysis. Trick problems compensate by leaning on code-reading difficulty (which loop bounds matter, etc.) rather than variable discovery.
- **English meanings, not code expressions.** `'length of the input array'`, not `'len(arr)'`. Code-form would mean two definitions per problem (one per language); english is language-agnostic and lower-cognitive-load.
- **Validator does string scanning, not AST parsing.** The build-time check that "every variable in an answer is declared" lowercases, strips `O()`/`Θ()`, removes known function names (`log`, `lg`, `ln`, `max`, `min`), then collects single lowercase letters. The structured analysis lives in the normalizer; the validator only needs to not be embarrassingly wrong.

## Ticket 11.5

- **Multi-method problems use `method_times`, not multi-question dialogs.** When a problem (LRU, Trie, MedianFinder) has multiple methods worth asking about, each method gets its own time-complexity field in the answer panel. There is still a single overall space-complexity question - per-method space is rarely asked in interviews; data-structure-wide space is the natural unit.
- **Multi-method attempts are not persisted to localStorage.** The existing `Attempt` schema has single `time_answer`/`space_answer` fields and doesn't model per-method answers. Rather than expand the schema for an MVP feature with no analytics surface, multi-method submissions are session-only (the solved counter still increments). Single-method attempts continue to save normally. If we later expose per-problem analytics, expand the schema then.

## Ticket 12

- **Two problem kinds in one rotation.** The pool mixes code-reading problems (50) with data-structure quiz problems (6) at uniform random. No UI signal of which kind is coming. Rationale: the user's task on every screen is "look at thing, type complexity" - different rendering of the "thing" is fine, but a labeled mode-shift would be jarring.
- **Storage version bumped to v2 for attempts.** The `Attempt` schema added `problem_kind` and made `language_shown`, `space_answer`, `space_result` nullable. Rather than write a migration for pre-launch users, we bumped the localStorage key (`complexity-practice:v1:attempts` → `complexity-practice:v2:attempts`) and let v1 data go stale. Preferences key stayed v1 (schema unchanged).
- **Discriminated union over optional fields.** `Problem = CodeProblem | DataStructureProblem` enforces the invariants at compile time: a code problem can't omit `code`, a datastructure problem can't omit `prompt`. The `kind` discriminator is intentionally surfaced in only three places (PromptPanel, App's variables-toggle decision, App's language-toggle decision) - downstream components (AnswerPanel, ResultPanel, classifier) don't branch on kind.

## Daily problem

- **`/daily` is a sticky route, not a query flag.** Bookmarkable, shareable, indexed in the sitemap with priority 0.9. Reload keeps the user on the daily; "Back to practice mode" navigates to `/` and remounts PracticeView with a fresh random pick. Earlier prototype used `/?daily=1` (one-shot consumed flag) - rejected because it broke bookmarking and shareability.
- **Order is an explicit array, not a hash.** `src/data/daily-order.ts` lists every code-problem id in the rotation order. The picker is `daysSinceEpoch(UTC) % DAILY_ORDER.length`. Original implementation was `hash(dateKey) % pool.length` - rejected because it produced ~2 consecutive-day collisions per year (same problem two days in a row) and gave us no editorial control. The array approach guarantees zero adjacencies, makes the curriculum a config knob, and the prebuild validates the array exactly mirrors the kind:'code' subset of `problems.ts`.
- **UTC date everywhere.** `dateKey` returns `toISOString().slice(0, 10)`, which is UTC by construction. Two users at the same UTC moment see the same daily regardless of timezone. The visible date in the indicator banner shows the UTC date so the boundary is at least legible to PT/ET users. Considered local-date semantics - rejected because it would mean different friends see different dailies and "share daily" links would be ambiguous.
- **Daily credit only fires on `/daily`.** Solving today's problem incidentally during random practice does NOT mark the daily done. The daily is a return surface, not a "credit me for this problem" record - forcing the user to come back to `/daily` protects the retention loop. Cost is occasional "wait, I already did this" friction, accepted in exchange for the habit anchor.
- **Streak fallback to yesterday.** `getCurrentStreak()` walks back from today, but if today isn't solved it starts from yesterday so the chain the user can extend is still surfaced. Without this, the streak chip and "keep your N-day streak" copy would show 0/blank until the user solved today's problem - misleading on the very screen meant to motivate them.

## Observability

- **Anonymous visitor ID for cross-day analytics.** Every track() event includes a `vid` prop - an opaque UUID generated client-side on first visit and stored in localStorage. It identifies a browser install, not a person. The original spec said "no per-user tracking"; this is a pragmatic step beyond a per-day rotating hash to enable week-over-week retention questions ("did this browser come back next week?") without collecting PII or fingerprinting. Clearing site data clears the vid; private browsing never persists it. PostHog also generates its own anonymous distinct_id; we keep `vid` as a redundant fallback and to make the dashboard filter explicit.
- **PostHog over Plausible.** Plausible Cloud's $9/mo floor was meaningful for an indie launch. PostHog's free tier (1M events/month) covers expected traffic with full custom-event support and identical "is the user coming back" answers. The track() helper only changed which underlying capture function it calls - events themselves and their props are unchanged. `person_profiles: 'identified_only'` keeps anonymous users out of PostHog's profile system, matching the spec's no-per-user-tracking stance.
