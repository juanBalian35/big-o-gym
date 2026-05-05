import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findRaceSet, resolveRaceSetProblems } from '../data/race-sets';
import type { Problem } from '../types/problem';
import { classifyAnswer } from '../lib/normalizer';
import { savePBIfBetter, loadPB, type RacePB } from '../lib/race-storage';
import { track } from '../lib/track';
import type { AnswerField } from '../components/answer-panel';

const PENALTY_MS = 10_000;

export interface RaceFieldSpec {
  key: string;
  label: string;
  canonical: string;
  equivalents?: string[];
}

export type RaceStatus = 'countdown' | 'running' | 'done';

export type Flash = 'right' | 'wrong' | 'almost' | 'parse_error' | null;

const COUNTDOWN_TICK_MS = 700;
const RIGHT_FLASH_MS = 1500;
const WRONG_FLASH_MS = 2500;

export interface RaceDoneSummary {
  setId: string;
  setName: string;
  finalTimeMs: number;
  wallTimeMs: number;
  penaltyMs: number;
  wrongCount: number;
  isNewBest: boolean;
  previousPB: RacePB | null;
  vsTimeMs: number | null;
}

export interface UseRaceArg {
  setId: string;
  vsTimeMs: number | null;
}

export interface UseRaceResult {
  ok: true;
  setName: string;
  status: RaceStatus;
  countdown: number;
  problems: Problem[];
  index: number;
  total: number;
  currentProblem: Problem;
  fields: AnswerField[];
  startedAt: number;
  penaltyMs: number;
  wrongCount: number;
  flash: Flash;
  parseErrorMsg: string | null;
  vsTimeMs: number | null;
  submit: (answers: Record<string, string>) => void;
  restart: () => void;
  summary: RaceDoneSummary | null;
}

export interface UseRaceMissing {
  ok: false;
}

function specsFor(problem: Problem): RaceFieldSpec[] {
  const out: RaceFieldSpec[] = [];
  if (problem.kind === 'code') {
    if (problem.method_times && problem.method_times.length > 0) {
      for (const m of problem.method_times) {
        out.push({
          key: `time-${m.method}`,
          label: `Time complexity of ${m.method}`,
          canonical: m.time_complexity,
          equivalents: m.accepted_equivalent_forms,
        });
      }
    } else {
      out.push({
        key: 'time',
        label: 'Time complexity',
        canonical: problem.time_complexity!,
        equivalents: problem.accepted_equivalent_forms?.time,
      });
    }
    out.push({
      key: 'space',
      label: 'Space complexity',
      canonical: problem.space_complexity,
      equivalents: problem.accepted_equivalent_forms?.space,
    });
  } else {
    out.push({
      key: 'time',
      label: 'Time complexity',
      canonical: problem.time_complexity,
      equivalents: problem.accepted_equivalent_forms?.time,
    });
    if (problem.space_complexity) {
      out.push({
        key: 'space',
        label: 'Space complexity',
        canonical: problem.space_complexity,
        equivalents: problem.accepted_equivalent_forms?.space,
      });
    }
  }
  return out;
}

export function useRace({
  setId,
  vsTimeMs,
}: UseRaceArg): UseRaceResult | UseRaceMissing {
  const set = findRaceSet(setId);
  const problemsForSet = useMemo<Problem[] | null>(
    () => (set ? resolveRaceSetProblems(set) : null),
    [set]
  );

  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<RaceStatus>('countdown');
  const [countdown, setCountdown] = useState<number>(3);
  const [penaltyMs, setPenaltyMs] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [flash, setFlash] = useState<Flash>(null);
  const [parseErrorMsg, setParseErrorMsg] = useState<string | null>(null);
  const [summary, setSummary] = useState<RaceDoneSummary | null>(null);
  // Set when the countdown finishes — until then it's a placeholder that
  // doesn't drive any visible timer.
  const startedAtRef = useRef<number>(Date.now());

  const startedTrackRef = useRef(false);
  useEffect(() => {
    if (!set || startedTrackRef.current) return;
    startedTrackRef.current = true;
    track('race_start', { set_id: set.id, vs: vsTimeMs ?? 0 });
  }, [set, vsTimeMs]);

  // Countdown ticker: 3 → 2 → 1 → start running.
  useEffect(() => {
    if (status !== 'countdown') return;
    if (countdown > 1) {
      const id = window.setTimeout(
        () => setCountdown((c) => c - 1),
        COUNTDOWN_TICK_MS
      );
      return () => window.clearTimeout(id);
    }
    // Countdown is at 1 — show it for one tick, then go.
    const id = window.setTimeout(() => {
      startedAtRef.current = Date.now();
      setStatus('running');
    }, COUNTDOWN_TICK_MS);
    return () => window.clearTimeout(id);
  }, [status, countdown]);

  const flashTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  // Refs read by the abandon listener — avoids stale closures so the event
  // captures the user's actual progress at the moment they leave.
  const statusRef = useRef(status);
  const indexRef = useRef(index);
  const penaltyMsRef = useRef(penaltyMs);
  const wrongCountRef = useRef(wrongCount);
  const abandonFiredRef = useRef(false);
  useEffect(() => {
    statusRef.current = status;
    indexRef.current = index;
    penaltyMsRef.current = penaltyMs;
    wrongCountRef.current = wrongCount;
  });

  useEffect(() => {
    if (!set) return;
    function fireAbandon() {
      if (abandonFiredRef.current) return;
      if (statusRef.current !== 'running') return;
      abandonFiredRef.current = true;
      track('race_abandon', {
        set_id: set!.id,
        problem_index: indexRef.current,
        total: problemsForSet?.length ?? 0,
        time_ms_so_far:
          Date.now() - startedAtRef.current + penaltyMsRef.current,
        wrong_count: wrongCountRef.current,
      });
    }
    window.addEventListener('pagehide', fireAbandon);
    return () => {
      window.removeEventListener('pagehide', fireAbandon);
      // Cleanup runs on unmount (route change, key change, etc.). Fire too —
      // pagehide alone misses in-app navigation.
      fireAbandon();
    };
  }, [set, problemsForSet]);

  const submit = useCallback(
    (answers: Record<string, string>) => {
      if (!set || !problemsForSet || status !== 'running') return;
      const current = problemsForSet[index]!;
      const specs = specsFor(current);

      const classifications = specs.map((spec) => ({
        spec,
        result: classifyAnswer(
          answers[spec.key] ?? '',
          spec.canonical,
          spec.equivalents
        ),
      }));

      const allCorrect = classifications.every(
        (c) => c.result.result === 'correct'
      );
      const hadParse = classifications.some(
        (c) => c.result.result === 'parse_error'
      );
      const hadAlmost = classifications.some(
        (c) => c.result.result === 'almost'
      );

      track('race_submit', {
        set_id: set.id,
        problem_id: current.id,
        problem_index: index,
        all_correct: allCorrect,
        had_parse_error: hadParse,
        had_almost: hadAlmost,
      });

      if (allCorrect) {
        // Brief green flash on the new problem (or final result).
        setFlash('right');
        setParseErrorMsg(null);
        if (flashTimeoutRef.current !== null) {
          window.clearTimeout(flashTimeoutRef.current);
        }
        flashTimeoutRef.current = window.setTimeout(() => {
          setFlash(null);
        }, RIGHT_FLASH_MS);
        const nextIndex = index + 1;
        if (nextIndex >= problemsForSet.length) {
          const wallTimeMs = Date.now() - startedAtRef.current;
          const finalTimeMs = wallTimeMs + penaltyMs;
          const { isNewBest, previous } = savePBIfBetter(set.id, finalTimeMs);
          track('race_complete', {
            set_id: set.id,
            time_ms: finalTimeMs,
            wall_ms: wallTimeMs,
            penalty_ms: penaltyMs,
            wrong_count: wrongCount,
            new_best: isNewBest,
          });
          if (isNewBest) {
            track('race_pb', { set_id: set.id, time_ms: finalTimeMs });
          }
          setSummary({
            setId: set.id,
            setName: set.name,
            finalTimeMs,
            wallTimeMs,
            penaltyMs,
            wrongCount,
            isNewBest,
            previousPB: previous,
            vsTimeMs,
          });
          setStatus('done');
        } else {
          setIndex(nextIndex);
        }
        return;
      }

      // Penalty path.
      const newFlash: Flash = hadParse ? 'parse_error' : hadAlmost ? 'almost' : 'wrong';
      setFlash(newFlash);
      setParseErrorMsg(
        hadParse
          ? "Couldn't parse that. Try notation like O(n) or O(n log n)."
          : null
      );
      setPenaltyMs((p) => p + PENALTY_MS);
      setWrongCount((w) => w + 1);

      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }
      flashTimeoutRef.current = window.setTimeout(() => {
        setFlash(null);
      }, WRONG_FLASH_MS);
    },
    [set, problemsForSet, status, index, penaltyMs, wrongCount, vsTimeMs]
  );

  const restart = useCallback(() => {
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    setIndex(0);
    setStatus('countdown');
    setCountdown(3);
    setPenaltyMs(0);
    setWrongCount(0);
    setFlash(null);
    setParseErrorMsg(null);
    setSummary(null);
    startedAtRef.current = Date.now();
    abandonFiredRef.current = false;
    if (set) track('race_start', { set_id: set.id, vs: vsTimeMs ?? 0 });
  }, [set, vsTimeMs]);

  if (!set || !problemsForSet) return { ok: false };

  const currentProblem = problemsForSet[Math.min(index, problemsForSet.length - 1)]!;
  const fields: AnswerField[] = specsFor(currentProblem).map((s) => ({
    key: s.key,
    label: s.label,
  }));

  return {
    ok: true,
    setName: set.name,
    status,
    countdown,
    problems: problemsForSet,
    index,
    total: problemsForSet.length,
    currentProblem,
    fields,
    startedAt: startedAtRef.current,
    penaltyMs,
    wrongCount,
    flash,
    parseErrorMsg,
    vsTimeMs,
    submit,
    restart,
    summary,
  };
}

export { loadPB };
