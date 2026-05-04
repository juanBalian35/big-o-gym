import { ParseError } from './ast';

export type Token =
  | { kind: 'NUM'; value: number }
  | { kind: 'VAR'; name: string }
  | { kind: 'LOG' }
  | { kind: 'PLUS' }
  | { kind: 'STAR' }
  | { kind: 'CARET' }
  | { kind: 'LPAREN' }
  | { kind: 'RPAREN' }
  | { kind: 'BANG' };

const VALID_VARS = new Set([
  'n',
  'm',
  'k',
  'v',
  'e',
  'h',
  'c',
  'p',
  'q',
  'r',
  's',
  't',
  'w',
  'x',
  'y',
  'z',
]);

const SUPERSCRIPT_DIGITS: Record<string, number> = {
  '⁰': 0,
  '¹': 1,
  '²': 2,
  '³': 3,
  '⁴': 4,
  '⁵': 5,
  '⁶': 6,
  '⁷': 7,
  '⁸': 8,
  '⁹': 9,
};

const SUBSCRIPT_DIGITS: Record<string, number> = {
  '₀': 0,
  '₁': 1,
  '₂': 2,
  '₃': 3,
  '₄': 4,
  '₅': 5,
  '₆': 6,
  '₇': 7,
  '₈': 8,
  '₉': 9,
};

export function tokenize(input: string): Token[] {
  let s = input.trim();
  if (s.length === 0) {
    throw new ParseError('empty input');
  }

  s = stripOuterWrap(s);
  s = stripAmortizedSuffix(s);

  if (s.trim().length === 0) {
    throw new ParseError('empty input after stripping wrapper');
  }

  const tokens: Token[] = [];
  let i = 0;

  while (i < s.length) {
    const c = s[i]!;

    if (/\s/.test(c)) {
      i++;
      continue;
    }

    if (/\d/.test(c)) {
      let j = i;
      while (j < s.length && /\d/.test(s[j]!)) j++;
      tokens.push({ kind: 'NUM', value: parseInt(s.slice(i, j), 10) });
      i = j;
      continue;
    }

    if (/[a-zA-Z]/.test(c)) {
      const lookahead = s.slice(i);
      const lowerLook = lookahead.toLowerCase();

      const logMatch = lowerLook.match(/^(log|lg|ln)/);
      if (logMatch) {
        const word = logMatch[0];
        i += word.length;
        if (i < s.length && s[i] === '_') {
          i++;
          while (i < s.length && /[a-zA-Z0-9]/.test(s[i]!)) i++;
        }
        while (i < s.length && s[i]! in SUBSCRIPT_DIGITS) i++;
        tokens.push({ kind: 'LOG' });
        continue;
      }

      const lower = c.toLowerCase();
      if (!VALID_VARS.has(lower)) {
        throw new ParseError(`unknown identifier "${c}"`);
      }
      tokens.push({ kind: 'VAR', name: lower });
      i++;
      continue;
    }

    if (c === '+') {
      tokens.push({ kind: 'PLUS' });
      i++;
      continue;
    }
    if (c === '*' || c === '·' || c === '⋅' || c === '×') {
      tokens.push({ kind: 'STAR' });
      i++;
      continue;
    }
    if (c === '^') {
      tokens.push({ kind: 'CARET' });
      i++;
      continue;
    }
    if (c === '(') {
      tokens.push({ kind: 'LPAREN' });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ kind: 'RPAREN' });
      i++;
      continue;
    }
    if (c === '!') {
      tokens.push({ kind: 'BANG' });
      i++;
      continue;
    }

    if (c in SUPERSCRIPT_DIGITS) {
      let j = i;
      let val = 0;
      while (j < s.length && s[j]! in SUPERSCRIPT_DIGITS) {
        val = val * 10 + SUPERSCRIPT_DIGITS[s[j]!]!;
        j++;
      }
      tokens.push({ kind: 'CARET' });
      tokens.push({ kind: 'NUM', value: val });
      i = j;
      continue;
    }

    throw new ParseError(`unexpected character "${c}"`);
  }

  return tokens;
}

function stripOuterWrap(s: string): string {
  // Make O(...), o(...), Θ(...), θ(...) transparent everywhere by erasing the
  // leading letter; the parens themselves stay and are handled by the parser.
  // This lets `O(n)` → `(n)` (parser unwraps), and also handles user inputs
  // like `O(n) + O(1)` → `(n) + (1)`.
  return s.replace(/[OoΘθ](\s*)\(/g, '$1(');
}

function stripAmortizedSuffix(s: string): string {
  return s.replace(/\b(amortized|expected|average|worst[\s-]*case)\b/gi, '').trim();
}
