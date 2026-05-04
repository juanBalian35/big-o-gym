import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { problems } from '../data/problems';
import type { Language, Problem } from '../types/problem';
import type { Attempt } from '../types/attempt';
import { selectNextProblem } from '../lib/problem-selection';
import {
  loadPreferredLanguage,
  savePreferredLanguage,
  saveAttempt,
} from '../lib/storage';
import {
  classifyAnswer,
  type ClassificationResult,
} from '../lib/normalizer';
import {
  findChallengeProblem,
  clearChallengeHash,
} from '../lib/url-routing';
import {
  reflect,
  type SessionAttempt,
} from '../lib/session-reflection';
import { track } from '../lib/track';
import type { AnswerField } from '../components/answer-panel';
import type { ResultLine } from '../components/result-panel';

export interface SubmissionResult {
  lines: ResultLine[];
  hadParseError: boolean;
}

const EASY_RAMP_COUNT = 2;

interface PickResult {
  problem: Problem;
  resetSeen: boolean;
}

function pickForSessionIndex(
  prevId: string | null,
  shownIndex: number,
  seenIds: Set<string>
): PickResult {
  // First N problems: easy code-reading only. Datastructure quizzes are a
  // rarer flavor and never lead off the session.
  const inRamp = shownIndex < EASY_RAMP_COUNT;
  const rampPool = problems.filter(
    (p) => p.kind === 'code' && p.difficulty === 'easy'
  );
  const fullPool = problems;
  const pool = inRamp && rampPool.length > 0 ? rampPool : fullPool;

  const unseen = pool.filter((p) => !seenIds.has(p.id));
  if (unseen.length > 0) {
    return {
      problem: selectNextProblem(unseen, prevId),
      resetSeen: false,
    };
  }

  // Every problem in this pool has been seen. Reset and serve a fresh cycle.
  return {
    problem: selectNextProblem(fullPool, prevId),
    resetSeen: true,
  };
}

interface FieldSpec {
  key: string;
  label: string;
  canonical: string;
  equivalents?: string[];
}

function specsFor(problem: Problem): FieldSpec[] {
  const specs: FieldSpec[] = [];

  if (problem.kind === 'code') {
    if (problem.method_times && problem.method_times.length > 0) {
      for (const m of problem.method_times) {
        specs.push({
          key: `time-${m.method}`,
          label: `Time complexity of ${m.method}`,
          canonical: m.time_complexity,
          equivalents: m.accepted_equivalent_forms,
        });
      }
    } else {
      specs.push({
        key: 'time',
        label: 'Time complexity',
        canonical: problem.time_complexity!,
        equivalents: problem.accepted_equivalent_forms?.time,
      });
    }
    specs.push({
      key: 'space',
      label: 'Space complexity',
      canonical: problem.space_complexity,
      equivalents: problem.accepted_equivalent_forms?.space,
    });
  } else {
    specs.push({
      key: 'time',
      label: 'Time complexity',
      canonical: problem.time_complexity,
      equivalents: problem.accepted_equivalent_forms?.time,
    });
    if (problem.space_complexity) {
      specs.push({
        key: 'space',
        label: 'Space complexity',
        canonical: problem.space_complexity,
        equivalents: problem.accepted_equivalent_forms?.space,
      });
    }
  }

  return specs;
}

export function useProblemFlow() {
  const [language, setLanguageState] = useState<Language>(() =>
    loadPreferredLanguage()
  );

  const [initialChallenge] = useState<Problem | null>(() =>
    findChallengeProblem()
  );

  const [initialProblem] = useState<Problem>(
    () =>
      initialChallenge ??
      pickForSessionIndex(null, 0, new Set<string>()).problem
  );

  const [currentProblem, setCurrentProblem] = useState<Problem>(initialProblem);
  const [isChallengeMode, setIsChallengeMode] = useState(
    initialChallenge !== null
  );
  const [shownCount, setShownCount] = useState(initialChallenge ? 0 : 1);
  const [seenIds, setSeenIds] = useState<Set<string>>(
    () => new Set([initialProblem.id])
  );
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);
  const [retryUsed, setRetryUsed] = useState(false);
  const [sessionAttempts, setSessionAttempts] = useState<SessionAttempt[]>(
    []
  );
  const [reflection, setReflection] = useState<string | null>(null);

  const fields: AnswerField[] = specsFor(currentProblem).map((s) => ({
    key: s.key,
    label: s.label,
  }));

  const challengeAnnouncedRef = useRef(false);
  useEffect(() => {
    if (initialChallenge && !challengeAnnouncedRef.current) {
      challengeAnnouncedRef.current = true;
      track('challenge_arrived', { id: initialChallenge.id });
    }
  }, [initialChallenge]);

  // Solved count derived from latest-result-per-problem-id. This way a
  // successful redo flips a previously-missed problem into solved.
  const solvedCount = useMemo(() => {
    const latest = new Map<string, boolean>();
    for (const a of sessionAttempts) latest.set(a.problemId, a.allCorrect);
    let n = 0;
    for (const v of latest.values()) if (v) n++;
    return n;
  }, [sessionAttempts]);

  // Snapshot of session state used by the pagehide listener. Updated every
  // render so the listener (registered once) always sees the latest values.
  const sessionRef = useRef({
    solvedCount: 0,
    attempts: 0,
    lastProblemId: currentProblem.id,
    lastProblemKind: currentProblem.kind,
    lastProblemDifficulty: currentProblem.difficulty,
    lastProblemConcept: currentProblem.concept,
  });
  sessionRef.current = {
    solvedCount,
    attempts: sessionAttempts.length,
    lastProblemId: currentProblem.id,
    lastProblemKind: currentProblem.kind,
    lastProblemDifficulty: currentProblem.difficulty,
    lastProblemConcept: currentProblem.concept,
  };

  useEffect(() => {
    const onHide = () => {
      const s = sessionRef.current;
      // Only emit when the session has actually started (at least one
      // problem shown). Avoids noise for users who hit the page and bail
      // before any state worth reporting exists.
      if (s.attempts === 0 && s.solvedCount === 0) {
        // Still useful to know the page-load-and-leave case — emit a
        // minimal event so we can distinguish bounces from sessions.
        track('session_end', {
          solved: 0,
          attempts: 0,
          last_problem_id: s.lastProblemId,
          last_problem_kind: s.lastProblemKind,
          last_problem_difficulty: s.lastProblemDifficulty,
          last_problem_concept: s.lastProblemConcept,
        });
        return;
      }
      track('session_end', {
        solved: s.solvedCount,
        attempts: s.attempts,
        last_problem_id: s.lastProblemId,
        last_problem_kind: s.lastProblemKind,
        last_problem_difficulty: s.lastProblemDifficulty,
        last_problem_concept: s.lastProblemConcept,
      });
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  useEffect(() => {
    track('problem_shown', {
      id: currentProblem.id,
      kind: currentProblem.kind,
      difficulty: currentProblem.difficulty,
    });
  }, [currentProblem.id, currentProblem.kind, currentProblem.difficulty]);

  useEffect(() => {
    if (reflection) {
      track('reflection_shown', { attempts: sessionAttempts.length });
    }
    // We only want to fire when reflection transitions to a new value, so
    // sessionAttempts.length is intentionally omitted from the dep list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reflection]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    savePreferredLanguage(lang);
  }, []);

  const submit = useCallback(
    (answers: Record<string, string>): SubmissionResult => {
      const specs = specsFor(currentProblem);

      const classifications = specs.map((spec) => {
        const userAnswer = answers[spec.key] ?? '';
        const c: ClassificationResult = classifyAnswer(
          userAnswer,
          spec.canonical,
          spec.equivalents
        );
        return { spec, userAnswer, c };
      });

      const hadParseError = classifications.some(
        ({ c }) => c.result === 'parse_error'
      );

      if (hadParseError) {
        track('parse_error', { id: currentProblem.id });
      } else {
        const allCorrect = classifications.every(
          ({ c }) => c.result === 'correct'
        );
        track('submit', {
          id: currentProblem.id,
          kind: currentProblem.kind,
          difficulty: currentProblem.difficulty,
          all_correct: allCorrect,
          retry: retryUsed,
          challenge: isChallengeMode,
        });
        if (allCorrect) {
          track('solved', {
            id: currentProblem.id,
            difficulty: currentProblem.difficulty,
            retry: retryUsed,
            challenge: isChallengeMode,
          });
        }
      }

      const lines: ResultLine[] = classifications.map(
        ({ spec, userAnswer, c }) => ({
          label: spec.label,
          state: c.result,
          userAnswer,
          canonicalAnswer: spec.canonical,
          message: c.message,
        })
      );

      const result: SubmissionResult = { lines, hadParseError };

      if (!hadParseError) {
        const allCorrect = classifications.every(
          ({ c }) => c.result === 'correct'
        );

        // Record into the session-attempt log used by the every-5 reflection
        // and the session-stats panel. Skipped for challenge mode (one-off)
        // and for retries (the original attempt is already recorded).
        if (!isChallengeMode && !retryUsed) {
          setSessionAttempts((prev) => [
            ...prev,
            {
              problemId: currentProblem.id,
              concept: currentProblem.concept,
              difficulty: currentProblem.difficulty,
              allCorrect,
            },
          ]);
        }

        // Persist to localStorage only outside challenge mode and only when
        // the shape fits the Attempt schema (not multi-method). Multi-method,
        // challenge, and retry submissions are session-only by design — the
        // first attempt is the recorded one.
        const isSingleTime =
          currentProblem.kind === 'datastructure' ||
          (currentProblem.kind === 'code' && !currentProblem.method_times);
        if (!isChallengeMode && !retryUsed && isSingleTime) {
          const time = classifications.find((c) => c.spec.key === 'time')!;
          const space = classifications.find((c) => c.spec.key === 'space');
          const attempt: Attempt = {
            problem_id: currentProblem.id,
            problem_kind: currentProblem.kind,
            language_shown:
              currentProblem.kind === 'code' ? language : null,
            time_answer: time.userAnswer,
            space_answer: space ? space.userAnswer : null,
            time_result: time.c.result as Attempt['time_result'],
            space_result: space
              ? (space.c.result as Attempt['time_result'])
              : null,
            timestamp: new Date().toISOString(),
          };
          saveAttempt(attempt);
        }

        setLastResult(result);
      }

      return result;
    },
    [currentProblem, language, isChallengeMode, retryUsed]
  );

  const next = useCallback(() => {
    setLastResult(null);
    setRetryUsed(false);
    if (isChallengeMode) {
      setIsChallengeMode(false);
      clearChallengeHash();
    }
    // Reflection fires when the session attempt count just crossed a
    // multiple of 5 (i.e., the user has now finished 5/10/15/... real
    // attempts and is about to see the next problem).
    if (sessionAttempts.length > 0 && sessionAttempts.length % 5 === 0) {
      setReflection(reflect(sessionAttempts));
    } else {
      setReflection(null);
    }

    const { problem: nextProblem, resetSeen } = pickForSessionIndex(
      currentProblem.id,
      shownCount,
      seenIds
    );
    setCurrentProblem(nextProblem);
    setShownCount(shownCount + 1);
    setSeenIds(
      resetSeen
        ? new Set([nextProblem.id])
        : new Set([...seenIds, nextProblem.id])
    );
  }, [isChallengeMode, sessionAttempts, currentProblem, shownCount, seenIds]);

  const retry = useCallback(() => {
    track('retry', { id: currentProblem.id });
    setLastResult(null);
    setRetryUsed(true);
  }, [currentProblem.id]);

  // Programmatic in-app navigation to a specific problem. Used by the
  // session-stats panel to redo a missed problem without losing session
  // state. Unlike URL-mounted challenge mode, this is a normal attempt — a
  // successful redo updates the session log, the localStorage attempt log,
  // and the derived solved count.
  const goToProblem = useCallback((id: string) => {
    const target = problems.find((p) => p.id === id);
    if (!target) return;
    setCurrentProblem(target);
    setIsChallengeMode(false);
    setLastResult(null);
    setRetryUsed(false);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/p/${id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return {
    currentProblem,
    language,
    setLanguage,
    fields,
    submit,
    next,
    retry,
    goToProblem,
    lastResult,
    solvedCount,
    sessionAttempts,
    isChallengeMode,
    retryUsed,
    reflection,
  };
}
