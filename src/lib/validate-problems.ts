import type {
  Problem,
  CodeProblem,
  DataStructureProblem,
  Difficulty,
  Category,
} from '../types/problem';

const VALID_DIFFICULTIES: ReadonlySet<Difficulty> = new Set([
  'easy',
  'medium',
  'hard',
]);

const VALID_CATEGORIES: ReadonlySet<Category> = new Set([
  'hashing',
  'dynamic-programming',
  'two-pointer',
  'sliding-window',
  'binary-search',
  'sorting',
  'trees',
  'graphs',
  'heap',
  'linked-list',
  'arrays',
  'in-place',
  'hidden-cost',
  'amortized-analysis',
  'fundamentals',
]);

const KNOWN_FUNCTION_WORDS = ['log', 'lg', 'ln', 'max', 'min'];

export function validateProblems(problems: Problem[]): void {
  if (!Array.isArray(problems)) {
    throw new Error('problems must be an array');
  }

  const seenIds = new Set<string>();

  for (const [i, p] of problems.entries()) {
    const where = `problem #${i} (id=${p?.id ?? '<missing>'})`;

    if (!p || typeof p !== 'object') {
      throw new Error(`${where}: not an object`);
    }
    if (!p.id || typeof p.id !== 'string') {
      throw new Error(`${where}: missing or invalid id`);
    }
    if (seenIds.has(p.id)) {
      throw new Error(`${where}: duplicate id`);
    }
    seenIds.add(p.id);

    if (p.kind === 'code') {
      validateCodeProblem(p, where);
    } else if (p.kind === 'datastructure') {
      validateDataStructureProblem(p, where);
    } else {
      throw new Error(
        `${where}: invalid or missing kind (must be "code" or "datastructure")`
      );
    }

    if (!p.explanation || typeof p.explanation !== 'string') {
      throw new Error(`${where}: missing explanation`);
    }
    if (!p.concept || typeof p.concept !== 'string') {
      throw new Error(`${where}: missing concept`);
    }
    if (!p.category || !VALID_CATEGORIES.has(p.category as Category)) {
      throw new Error(
        `${where}: invalid or missing category "${p.category ?? '<missing>'}"`
      );
    }
    if (!Array.isArray(p.topic_tags)) {
      throw new Error(`${where}: topic_tags must be an array`);
    }
    if (!VALID_DIFFICULTIES.has(p.difficulty)) {
      throw new Error(`${where}: invalid difficulty "${p.difficulty}"`);
    }
  }
}

function validateCodeProblem(p: CodeProblem, where: string): void {
  if (!p.code || typeof p.code !== 'object') {
    throw new Error(`${where}: missing code object`);
  }
  if (!p.code.python || typeof p.code.python !== 'string') {
    throw new Error(`${where}: missing python code`);
  }
  if (!p.code.javascript || typeof p.code.javascript !== 'string') {
    throw new Error(`${where}: missing javascript code`);
  }

  const hasSingleTime =
    p.time_complexity !== undefined && p.time_complexity !== '';
  const hasMethodTimes =
    Array.isArray(p.method_times) && p.method_times.length > 0;

  if (hasSingleTime && hasMethodTimes) {
    throw new Error(
      `${where}: cannot set both time_complexity and method_times`
    );
  }
  if (!hasSingleTime && !hasMethodTimes) {
    throw new Error(
      `${where}: must set either time_complexity or method_times`
    );
  }
  if (hasSingleTime && typeof p.time_complexity !== 'string') {
    throw new Error(`${where}: time_complexity must be a string`);
  }

  if (hasMethodTimes) {
    const seenMethods = new Set<string>();
    for (const [mi, m] of p.method_times!.entries()) {
      if (!m || typeof m !== 'object') {
        throw new Error(`${where}: method_times[${mi}] is not an object`);
      }
      if (!m.method || typeof m.method !== 'string') {
        throw new Error(
          `${where}: method_times[${mi}] missing method name`
        );
      }
      if (
        !m.time_complexity ||
        typeof m.time_complexity !== 'string'
      ) {
        throw new Error(
          `${where}: method_times[${mi}] (method="${m.method}") missing time_complexity`
        );
      }
      if (seenMethods.has(m.method)) {
        throw new Error(`${where}: duplicate method name "${m.method}"`);
      }
      seenMethods.add(m.method);
    }
  }

  if (!p.space_complexity || typeof p.space_complexity !== 'string') {
    throw new Error(`${where}: missing space_complexity`);
  }

  if (!Array.isArray(p.variables) || p.variables.length === 0) {
    throw new Error(`${where}: variables must be a non-empty array`);
  }
  const seenNames = new Set<string>();
  for (const [vi, v] of p.variables.entries()) {
    if (!v || typeof v !== 'object') {
      throw new Error(`${where}: variables[${vi}] is not an object`);
    }
    if (!v.name || typeof v.name !== 'string') {
      throw new Error(`${where}: variables[${vi}] missing name`);
    }
    if (!v.meaning || typeof v.meaning !== 'string') {
      throw new Error(
        `${where}: variables[${vi}] (name="${v.name}") missing meaning`
      );
    }
    if (seenNames.has(v.name)) {
      throw new Error(`${where}: duplicate variable name "${v.name}"`);
    }
    seenNames.add(v.name);
  }

  if (p.accepted_equivalent_forms) {
    const aef = p.accepted_equivalent_forms;
    if (aef.time && !Array.isArray(aef.time)) {
      throw new Error(
        `${where}: accepted_equivalent_forms.time must be array`
      );
    }
    if (aef.space && !Array.isArray(aef.space)) {
      throw new Error(
        `${where}: accepted_equivalent_forms.space must be array`
      );
    }
  }

  const referenced = new Set<string>();
  if (hasSingleTime) {
    addReferencedVars(p.time_complexity!, referenced);
  }
  if (hasMethodTimes) {
    for (const m of p.method_times!) {
      addReferencedVars(m.time_complexity, referenced);
      if (m.accepted_equivalent_forms) {
        for (const eq of m.accepted_equivalent_forms) {
          addReferencedVars(eq, referenced);
        }
      }
    }
  }
  addReferencedVars(p.space_complexity, referenced);
  if (p.accepted_equivalent_forms?.time) {
    for (const eq of p.accepted_equivalent_forms.time) {
      addReferencedVars(eq, referenced);
    }
  }
  if (p.accepted_equivalent_forms?.space) {
    for (const eq of p.accepted_equivalent_forms.space) {
      addReferencedVars(eq, referenced);
    }
  }
  for (const ref of referenced) {
    if (!seenNames.has(ref)) {
      throw new Error(
        `${where}: variable "${ref}" appears in an answer but is not declared in variables`
      );
    }
  }
}

function validateDataStructureProblem(
  p: DataStructureProblem,
  where: string
): void {
  if (!p.prompt || typeof p.prompt !== 'string') {
    throw new Error(`${where}: missing prompt`);
  }
  if (!p.time_complexity || typeof p.time_complexity !== 'string') {
    throw new Error(`${where}: missing time_complexity`);
  }
  if (
    p.space_complexity !== undefined &&
    (typeof p.space_complexity !== 'string' || p.space_complexity === '')
  ) {
    throw new Error(
      `${where}: space_complexity, if present, must be a non-empty string`
    );
  }
  if (p.accepted_equivalent_forms) {
    const aef = p.accepted_equivalent_forms;
    if (aef.time && !Array.isArray(aef.time)) {
      throw new Error(
        `${where}: accepted_equivalent_forms.time must be array`
      );
    }
    if (aef.space && !Array.isArray(aef.space)) {
      throw new Error(
        `${where}: accepted_equivalent_forms.space must be array`
      );
    }
  }
  // Variable-name validation does not apply to datastructure problems —
  // they don't declare variables; the prompt itself names the data structure.
}

export function addReferencedVars(
  expression: string,
  out: Set<string>
): void {
  let s = expression.toLowerCase();
  s = s.replace(/[oθ]\s*\(/g, '(');
  for (const word of KNOWN_FUNCTION_WORDS) {
    s = s.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
  }
  for (const ch of s) {
    if (/[a-z]/.test(ch)) out.add(ch);
  }
}
