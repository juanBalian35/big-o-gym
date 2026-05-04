export type Node =
  | { type: 'const'; value: number }
  | { type: 'var'; name: string }
  | { type: 'sum'; terms: Node[] }
  | { type: 'product'; factors: Node[] }
  | { type: 'power'; base: Node; exponent: Node }
  | { type: 'log'; arg: Node }
  | { type: 'factorial'; arg: Node };

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}
