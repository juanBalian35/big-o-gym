import { ParseError } from './ast';
import { tokenize } from './tokenizer';
import { parse } from './parser';
import { simplifyTop, makeTracker, type Tracker } from './simplifier';
import { canonicalize } from './comparator';

export type ClassificationResult = {
  result: 'correct' | 'almost' | 'wrong' | 'parse_error';
  message?: string;
};

/**
 * Classify a user's complexity answer against a canonical answer.
 *
 * - `correct` - user's normalized form matches canonical without applying
 *   any "lossy" simplification (drop constant / drop dominated term).
 * - `almost` - matches after applying at least one lossy simplification.
 * - `wrong`  - doesn't match even after simplification, and doesn't match
 *   any of the optional `acceptedEquivalents`.
 * - `parse_error` - user input couldn't be parsed.
 */
export function classifyAnswer(
  userInput: string,
  canonicalAnswer: string,
  acceptedEquivalents?: string[]
): ClassificationResult {
  let userTracker: Tracker;
  let userCanonical: string;

  try {
    userTracker = makeTracker();
    userCanonical = normalize(userInput, userTracker);
  } catch (e) {
    if (e instanceof ParseError) {
      return {
        result: 'parse_error',
        message:
          "Couldn't parse that. Try notation like O(n) or O(n log n).",
      };
    }
    throw e;
  }

  const canonicalForms: string[] = [];
  try {
    canonicalForms.push(normalize(canonicalAnswer, makeTracker()));
  } catch {
    // canonical itself is unparseable - fall through; only equivalents may match
  }
  if (acceptedEquivalents) {
    for (const eq of acceptedEquivalents) {
      try {
        canonicalForms.push(normalize(eq, makeTracker()));
      } catch {
        // skip unparseable equivalents
      }
    }
  }

  if (canonicalForms.includes(userCanonical)) {
    if (userTracker.droppedConstant || userTracker.droppedDominated) {
      return { result: 'almost', message: buildAlmostMessage(userTracker) };
    }
    return { result: 'correct' };
  }

  return { result: 'wrong' };
}

function normalize(input: string, t: Tracker): string {
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const simplified = simplifyTop(ast, t);
  return canonicalize(simplified);
}

function buildAlmostMessage(t: Tracker): string {
  if (t.droppedConstant && t.droppedDominated) {
    return 'Almost - drop the constant and the dominated term.';
  }
  if (t.droppedConstant) {
    return 'Almost - drop the constant coefficient.';
  }
  return 'Almost - drop the dominated lower-order term.';
}
