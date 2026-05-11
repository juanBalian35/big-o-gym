export type Language = 'python' | 'javascript';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category =
  | 'hashing'
  | 'dynamic-programming'
  | 'two-pointer'
  | 'sliding-window'
  | 'binary-search'
  | 'sorting'
  | 'trees'
  | 'graphs'
  | 'heap'
  | 'linked-list'
  | 'arrays'
  | 'in-place'
  | 'hidden-cost'
  | 'amortized-analysis'
  | 'fundamentals';

export interface ProblemVariable {
  name: string;
  meaning: string;
}

export interface MethodTime {
  method: string;
  time_complexity: string;
  accepted_equivalent_forms?: string[];
}

export interface CodeProblem {
  kind: 'code';
  id: string;
  code: { python: string; javascript: string };
  variables: ProblemVariable[];
  // Single-method problems use this:
  time_complexity?: string;
  // Multi-method problems use this instead - one entry per method:
  method_times?: MethodTime[];
  // Always required (single overall data-structure space):
  space_complexity: string;
  accepted_equivalent_forms?: {
    time?: string[];
    space?: string[];
  };
  explanation: string;
  // Short concept tag surfaced above the explanation in the result panel.
  // Names the underlying idea ("amortized analysis", "dominant term in a
  // sum"), distinct from topic_tags which are categorical.
  concept: string;
  category: Category;
  topic_tags: string[];
  difficulty: Difficulty;
}

export interface DataStructureProblem {
  kind: 'datastructure';
  id: string;
  prompt: string;
  time_complexity: string;
  space_complexity?: string;
  accepted_equivalent_forms?: {
    time?: string[];
    space?: string[];
  };
  explanation: string;
  concept: string;
  category: Category;
  topic_tags: string[];
  difficulty: Difficulty;
}

export type Problem = CodeProblem | DataStructureProblem;
