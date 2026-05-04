# DECISIONS.md

Non-obvious choices, logged as we make them.

## Initial decisions (Ticket 1)

- **SPA over Next.js.** No SSR, no server. Pure static deploy. The product is a one-pager with no SEO surface that matters and no need for server-side rendering.
- **No auth.** Anonymous users. State lives in the browser.
- **localStorage only.** No accounts, no cross-device sync. Survives refresh on the same browser.
- **Dark theme only.** Single theme; no toggle. Terminal aesthetic.
- **Free-form input with normalizer.** Not a multiple-choice picker. Tests recall, not recognition. See SPEC.md for the normalizer rules.

## Ticket 2.5

- **Variable disclosure: always show all variables and their meanings before submission.** Considered hiding variables for "trick" problems to preserve a discovery moment, but rejected because: (1) forcing users to invent variable names creates submission anxiety, (2) interview conventions matter (V/E for graphs, m/n for grids) and disclosure trains those conventions, (3) the pedagogical loss is bounded — knowing the variables exist doesn't tell the user how they combine, which is most of the analysis. Trick problems compensate by leaning on code-reading difficulty (which loop bounds matter, etc.) rather than variable discovery.
- **English meanings, not code expressions.** `'length of the input array'`, not `'len(arr)'`. Code-form would mean two definitions per problem (one per language); english is language-agnostic and lower-cognitive-load.
- **Validator does string scanning, not AST parsing.** The build-time check that "every variable in an answer is declared" lowercases, strips `O()`/`Θ()`, removes known function names (`log`, `lg`, `ln`, `max`, `min`), then collects single lowercase letters. The structured analysis lives in the normalizer; the validator only needs to not be embarrassingly wrong.

## Ticket 11.5

- **Multi-method problems use `method_times`, not multi-question dialogs.** When a problem (LRU, Trie, MedianFinder) has multiple methods worth asking about, each method gets its own time-complexity field in the answer panel. There is still a single overall space-complexity question — per-method space is rarely asked in interviews; data-structure-wide space is the natural unit.
- **Multi-method attempts are not persisted to localStorage.** The existing `Attempt` schema has single `time_answer`/`space_answer` fields and doesn't model per-method answers. Rather than expand the schema for an MVP feature with no analytics surface, multi-method submissions are session-only (the solved counter still increments). Single-method attempts continue to save normally. If we later expose per-problem analytics, expand the schema then.

## Ticket 12

- **Two problem kinds in one rotation.** The pool mixes code-reading problems (50) with data-structure quiz problems (6) at uniform random. No UI signal of which kind is coming. Rationale: the user's task on every screen is "look at thing, type complexity" — different rendering of the "thing" is fine, but a labeled mode-shift would be jarring.
- **Storage version bumped to v2 for attempts.** The `Attempt` schema added `problem_kind` and made `language_shown`, `space_answer`, `space_result` nullable. Rather than write a migration for pre-launch users, we bumped the localStorage key (`complexity-practice:v1:attempts` → `complexity-practice:v2:attempts`) and let v1 data go stale. Preferences key stayed v1 (schema unchanged).
- **Discriminated union over optional fields.** `Problem = CodeProblem | DataStructureProblem` enforces the invariants at compile time: a code problem can't omit `code`, a datastructure problem can't omit `prompt`. The `kind` discriminator is intentionally surfaced in only three places (PromptPanel, App's variables-toggle decision, App's language-toggle decision) — downstream components (AnswerPanel, ResultPanel, classifier) don't branch on kind.

## Observability

- **Anonymous visitor ID for cross-day analytics.** Every track() event includes a `vid` prop — an opaque UUID generated client-side on first visit and stored in localStorage. It identifies a browser install, not a person. The original spec said "no per-user tracking"; this is a pragmatic step beyond a per-day rotating hash to enable week-over-week retention questions ("did this browser come back next week?") without collecting PII or fingerprinting. Clearing site data clears the vid; private browsing never persists it. PostHog also generates its own anonymous distinct_id; we keep `vid` as a redundant fallback and to make the dashboard filter explicit.
- **PostHog over Plausible.** Plausible Cloud's $9/mo floor was meaningful for an indie launch. PostHog's free tier (1M events/month) covers expected traffic with full custom-event support and identical "is the user coming back" answers. The track() helper only changed which underlying capture function it calls — events themselves and their props are unchanged. `person_profiles: 'identified_only'` keeps anonymous users out of PostHog's profile system, matching the spec's no-per-user-tracking stance.
