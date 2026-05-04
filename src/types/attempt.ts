import type { Language } from './problem';

export type ResultState = 'correct' | 'almost' | 'wrong';

export interface Attempt {
  problem_id: string;
  problem_kind: 'code' | 'datastructure';
  language_shown: Language | null;
  time_answer: string;
  space_answer: string | null;
  time_result: ResultState;
  space_result: ResultState | null;
  timestamp: string;
}
