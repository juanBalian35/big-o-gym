import type { Node } from './ast';

export function canonicalize(node: Node): string {
  switch (node.type) {
    case 'const':
      return `C(${node.value})`;
    case 'var':
      return `V(${node.name})`;
    case 'log':
      return `L(${canonicalize(node.arg)})`;
    case 'factorial':
      return `F(${canonicalize(node.arg)})`;
    case 'power':
      return `P(${canonicalize(node.base)},${canonicalize(node.exponent)})`;
    case 'product': {
      const sorted = node.factors.map(canonicalize).sort();
      return `*(${sorted.join(',')})`;
    }
    case 'sum': {
      const sorted = node.terms.map(canonicalize).sort();
      return `+(${sorted.join(',')})`;
    }
  }
}

export function nodesEqual(a: Node, b: Node): boolean {
  return canonicalize(a) === canonicalize(b);
}
