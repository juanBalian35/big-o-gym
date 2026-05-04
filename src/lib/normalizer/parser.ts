import { ParseError, type Node } from './ast';
import type { Token } from './tokenizer';

export function parse(tokens: Token[]): Node {
  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }
  function consume(): Token {
    return tokens[pos++]!;
  }
  function expect(kind: Token['kind']): Token {
    const t = peek();
    if (!t || t.kind !== kind) {
      throw new ParseError(`expected ${kind}, got ${t?.kind ?? 'EOF'}`);
    }
    return consume();
  }

  function parseExpr(): Node {
    const terms = [parseTerm()];
    while (peek()?.kind === 'PLUS') {
      consume();
      terms.push(parseTerm());
    }
    return terms.length === 1 ? terms[0]! : { type: 'sum', terms };
  }

  function parseTerm(): Node {
    const factors = [parseFactor()];
    while (true) {
      const t = peek();
      if (!t) break;
      if (t.kind === 'STAR') {
        consume();
        factors.push(parseFactor());
        continue;
      }
      if (
        t.kind === 'NUM' ||
        t.kind === 'VAR' ||
        t.kind === 'LOG' ||
        t.kind === 'LPAREN'
      ) {
        factors.push(parseFactor());
        continue;
      }
      break;
    }
    return factors.length === 1 ? factors[0]! : { type: 'product', factors };
  }

  function parseFactor(): Node {
    if (peek()?.kind === 'LOG') {
      consume();
      const arg = parsePostfix();
      return { type: 'log', arg };
    }
    return parsePostfix();
  }

  function parsePostfix(): Node {
    let node = parsePrimary();
    while (true) {
      const t = peek();
      if (!t) break;
      if (t.kind === 'CARET') {
        consume();
        const exp = parsePrimary();
        node = { type: 'power', base: node, exponent: exp };
      } else if (t.kind === 'BANG') {
        consume();
        node = { type: 'factorial', arg: node };
      } else {
        break;
      }
    }
    return node;
  }

  function parsePrimary(): Node {
    const t = peek();
    if (!t) throw new ParseError('unexpected end of input');
    if (t.kind === 'NUM') {
      consume();
      return { type: 'const', value: t.value };
    }
    if (t.kind === 'VAR') {
      consume();
      return { type: 'var', name: t.name };
    }
    if (t.kind === 'LPAREN') {
      consume();
      const e = parseExpr();
      expect('RPAREN');
      return e;
    }
    if (t.kind === 'LOG') {
      consume();
      const arg = parsePostfix();
      return { type: 'log', arg };
    }
    throw new ParseError(`unexpected token ${t.kind}`);
  }

  if (tokens.length === 0) {
    throw new ParseError('no tokens');
  }

  const result = parseExpr();
  if (pos < tokens.length) {
    throw new ParseError(`leftover tokens at position ${pos}`);
  }
  return result;
}
