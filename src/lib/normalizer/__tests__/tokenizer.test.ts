import { describe, expect, it } from 'vitest';
import { tokenize } from '../tokenizer';
import { ParseError } from '../ast';

describe('tokenize', () => {
  it('strips O wrapper letter (parens stay, parser unwraps)', () => {
    expect(tokenize('O(n)')).toEqual([
      { kind: 'LPAREN' },
      { kind: 'VAR', name: 'n' },
      { kind: 'RPAREN' },
    ]);
  });

  it('strips Θ wrapper letter', () => {
    expect(tokenize('Θ(n)')).toEqual([
      { kind: 'LPAREN' },
      { kind: 'VAR', name: 'n' },
      { kind: 'RPAREN' },
    ]);
  });

  it('strips lowercase o wrapper letter', () => {
    expect(tokenize('o(m)')).toEqual([
      { kind: 'LPAREN' },
      { kind: 'VAR', name: 'm' },
      { kind: 'RPAREN' },
    ]);
  });

  it('strips O() wrappers globally - O(n) + O(1) becomes (n) + (1)', () => {
    expect(tokenize('O(n) + O(1)')).toEqual([
      { kind: 'LPAREN' },
      { kind: 'VAR', name: 'n' },
      { kind: 'RPAREN' },
      { kind: 'PLUS' },
      { kind: 'LPAREN' },
      { kind: 'NUM', value: 1 },
      { kind: 'RPAREN' },
    ]);
  });

  it('lowercases capital N', () => {
    expect(tokenize('O(N)')).toEqual([
      { kind: 'LPAREN' },
      { kind: 'VAR', name: 'n' },
      { kind: 'RPAREN' },
    ]);
  });

  it('parses superscripts as caret + number', () => {
    expect(tokenize('n²')).toEqual([
      { kind: 'VAR', name: 'n' },
      { kind: 'CARET' },
      { kind: 'NUM', value: 2 },
    ]);
  });

  it('parses log_2 with subscript', () => {
    expect(tokenize('log₂ n')).toEqual([
      { kind: 'LOG' },
      { kind: 'VAR', name: 'n' },
    ]);
  });

  it('parses log_2 with underscore', () => {
    expect(tokenize('log_2 n')).toEqual([
      { kind: 'LOG' },
      { kind: 'VAR', name: 'n' },
    ]);
  });

  it('parses lg as log', () => {
    expect(tokenize('lg n')).toEqual([
      { kind: 'LOG' },
      { kind: 'VAR', name: 'n' },
    ]);
  });

  it('parses ln as log', () => {
    expect(tokenize('ln n')).toEqual([
      { kind: 'LOG' },
      { kind: 'VAR', name: 'n' },
    ]);
  });

  it('throws on empty input', () => {
    expect(() => tokenize('')).toThrow(ParseError);
    expect(() => tokenize('   ')).toThrow(ParseError);
  });

  it('throws on non-whitelisted single letter (catches "linear")', () => {
    expect(() => tokenize('linear')).toThrow(ParseError);
    expect(() => tokenize('fast')).toThrow(ParseError);
  });

  it('parses cdot as multiplication', () => {
    expect(tokenize('n · m')).toEqual([
      { kind: 'VAR', name: 'n' },
      { kind: 'STAR' },
      { kind: 'VAR', name: 'm' },
    ]);
  });

  it('parses bang for factorial', () => {
    expect(tokenize('n!')).toEqual([
      { kind: 'VAR', name: 'n' },
      { kind: 'BANG' },
    ]);
  });
});
