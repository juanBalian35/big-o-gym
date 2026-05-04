import type { Node } from './ast';
import { canonicalize } from './comparator';

export interface Tracker {
  droppedConstant: boolean;
  droppedDominated: boolean;
}

export function makeTracker(): Tracker {
  return { droppedConstant: false, droppedDominated: false };
}

export function simplify(node: Node, t: Tracker): Node {
  const recurse = (n: Node): Node => simplify(n, t);

  switch (node.type) {
    case 'const':
      return node;
    case 'var':
      return node;
    case 'log':
      return { type: 'log', arg: recurse(node.arg) };
    case 'factorial':
      return { type: 'factorial', arg: recurse(node.arg) };
    case 'power': {
      const base = recurse(node.base);
      const exp = recurse(node.exponent);
      if (exp.type === 'const' && exp.value === 1) return base;
      if (exp.type === 'const' && exp.value === 0) {
        return { type: 'const', value: 1 };
      }
      if (base.type === 'const' && base.value === 1) {
        return { type: 'const', value: 1 };
      }
      return { type: 'power', base, exponent: exp };
    }
    case 'product': {
      const factors = node.factors.flatMap((f) => {
        const sf = recurse(f);
        return sf.type === 'product' ? sf.factors : [sf];
      });

      let constProduct = 1;
      const nonConst: Node[] = [];
      let zeroSeen = false;
      for (const f of factors) {
        if (f.type === 'const') {
          if (f.value === 0) zeroSeen = true;
          constProduct *= f.value;
        } else {
          nonConst.push(f);
        }
      }
      if (zeroSeen) {
        // 0 * anything = 0; treat as const(0). Top-level handles → 1 + flag.
        t.droppedConstant = true;
        return { type: 'const', value: 0 };
      }

      const combined = combinePowers(nonConst, t);

      if (combined.length === 0) {
        if (constProduct !== 1) t.droppedConstant = true;
        return { type: 'const', value: 1 };
      }

      if (constProduct !== 1) t.droppedConstant = true;

      if (combined.length === 1) return combined[0]!;
      return { type: 'product', factors: combined };
    }
    case 'sum': {
      const flat = node.terms.flatMap((tm) => {
        const st = recurse(tm);
        return st.type === 'sum' ? st.terms : [st];
      });

      let constSum = 0;
      const nonConst: Node[] = [];
      for (const tm of flat) {
        if (tm.type === 'const') constSum += tm.value;
        else nonConst.push(tm);
      }

      const seen = new Set<string>();
      const dedup: Node[] = [];
      for (const tm of nonConst) {
        const key = canonicalize(tm);
        if (!seen.has(key)) {
          seen.add(key);
          dedup.push(tm);
        } else {
          // n + n = 2n; collapsing duplicates is implicit constant-drop
          t.droppedConstant = true;
        }
      }

      const survivors = dropDominated(dedup, t);

      if (constSum !== 0) {
        if (constSum !== 1) t.droppedConstant = true;
        const constNode: Node = { type: 'const', value: 1 };
        const isDominated = survivors.some((s) => dominates(s, constNode));
        if (isDominated) {
          t.droppedDominated = true;
        } else {
          survivors.push(constNode);
        }
      }

      if (survivors.length === 0) return { type: 'const', value: 0 };
      if (survivors.length === 1) return survivors[0]!;
      return { type: 'sum', terms: survivors };
    }
  }
}

export function simplifyTop(node: Node, t: Tracker): Node {
  let s = simplify(node, t);
  if (s.type === 'const') {
    if (s.value !== 1) {
      t.droppedConstant = true;
    }
    s = { type: 'const', value: 1 };
  }
  return s;
}

function combinePowers(factors: Node[], _t: Tracker): Node[] {
  const groups = new Map<string, { base: Node; exp: Node }>();

  for (const f of factors) {
    let base: Node;
    let exp: Node;
    if (f.type === 'power') {
      base = f.base;
      exp = f.exponent;
    } else {
      base = f;
      exp = { type: 'const', value: 1 };
    }
    const key = canonicalize(base);
    const cur = groups.get(key);
    if (cur) {
      cur.exp = addNodes(cur.exp, exp);
    } else {
      groups.set(key, { base, exp });
    }
  }

  const result: Node[] = [];
  for (const { base, exp } of groups.values()) {
    if (exp.type === 'const' && exp.value === 1) {
      result.push(base);
    } else if (exp.type === 'const' && exp.value === 0) {
      // skip
    } else {
      result.push({ type: 'power', base, exponent: exp });
    }
  }

  return result;
}

function addNodes(a: Node, b: Node): Node {
  if (a.type === 'const' && b.type === 'const') {
    return { type: 'const', value: a.value + b.value };
  }
  const aTerms = a.type === 'sum' ? a.terms : [a];
  const bTerms = b.type === 'sum' ? b.terms : [b];
  let cs = 0;
  const others: Node[] = [];
  for (const tm of [...aTerms, ...bTerms]) {
    if (tm.type === 'const') cs += tm.value;
    else others.push(tm);
  }
  if (cs !== 0) others.push({ type: 'const', value: cs });
  if (others.length === 1) return others[0]!;
  return { type: 'sum', terms: others };
}

function dropDominated(terms: Node[], t: Tracker): Node[] {
  const survivors: Node[] = [];
  for (const candidate of terms) {
    let isDominated = false;
    for (const other of terms) {
      if (other === candidate) continue;
      if (dominates(other, candidate)) {
        isDominated = true;
        break;
      }
    }
    if (isDominated) {
      t.droppedDominated = true;
    } else {
      survivors.push(candidate);
    }
  }
  return survivors;
}

type Growth =
  | { kind: 'none' }
  | { kind: 'log'; deg: number }
  | { kind: 'poly'; deg: number; logDeg: number }
  | { kind: 'expConst'; base: number }
  | { kind: 'expVar' }
  | { kind: 'fact' };

export function dominates(a: Node, b: Node): boolean {
  const varsA = collectVars(a);
  const varsB = collectVars(b);
  const allVars = new Set<string>([...varsA, ...varsB]);

  if (allVars.size === 0) return false;

  let strict = false;
  for (const v of allVars) {
    const ga = growthOf(a, v);
    const gb = growthOf(b, v);
    const cmp = compareGrowth(ga, gb);
    if (cmp < 0) return false;
    if (cmp > 0) strict = true;
  }
  return strict;
}

function growthOf(node: Node, v: string): Growth {
  switch (node.type) {
    case 'const':
      return { kind: 'none' };
    case 'var':
      return node.name === v
        ? { kind: 'poly', deg: 1, logDeg: 0 }
        : { kind: 'none' };
    case 'log': {
      const inner = collectVars(node.arg);
      return inner.has(v) ? { kind: 'log', deg: 1 } : { kind: 'none' };
    }
    case 'factorial': {
      const inner = collectVars(node.arg);
      return inner.has(v) ? { kind: 'fact' } : { kind: 'none' };
    }
    case 'power': {
      const baseV = collectVars(node.base);
      const expV = collectVars(node.exponent);
      const baseHasV = baseV.has(v);
      const expHasV = expV.has(v);
      if (baseHasV && expHasV) return { kind: 'expVar' };
      if (expHasV) {
        if (node.base.type === 'const' && node.base.value >= 2) {
          return { kind: 'expConst', base: node.base.value };
        }
        return { kind: 'expConst', base: 2 };
      }
      if (baseHasV) {
        if (node.exponent.type === 'const') {
          return { kind: 'poly', deg: node.exponent.value, logDeg: 0 };
        }
        return { kind: 'poly', deg: 1, logDeg: 0 };
      }
      return { kind: 'none' };
    }
    case 'product': {
      let result: Growth = { kind: 'none' };
      for (const f of node.factors) {
        result = combineGrowth(result, growthOf(f, v));
      }
      return result;
    }
    case 'sum': {
      let max: Growth = { kind: 'none' };
      for (const tm of node.terms) {
        const g = growthOf(tm, v);
        if (compareGrowth(g, max) > 0) max = g;
      }
      return max;
    }
  }
}

function combineGrowth(a: Growth, b: Growth): Growth {
  if (a.kind === 'expVar' || b.kind === 'expVar') return { kind: 'expVar' };
  if (a.kind === 'fact' || b.kind === 'fact') return { kind: 'fact' };
  if (a.kind === 'expConst' && b.kind === 'expConst') {
    return { kind: 'expConst', base: a.base * b.base };
  }
  if (a.kind === 'expConst') return a;
  if (b.kind === 'expConst') return b;
  if (a.kind === 'poly' && b.kind === 'poly') {
    return {
      kind: 'poly',
      deg: a.deg + b.deg,
      logDeg: a.logDeg + b.logDeg,
    };
  }
  if (a.kind === 'poly' && b.kind === 'log') {
    return { kind: 'poly', deg: a.deg, logDeg: a.logDeg + b.deg };
  }
  if (a.kind === 'log' && b.kind === 'poly') {
    return { kind: 'poly', deg: b.deg, logDeg: b.logDeg + a.deg };
  }
  if (a.kind === 'log' && b.kind === 'log') {
    return { kind: 'log', deg: a.deg + b.deg };
  }
  if (a.kind === 'none') return b;
  if (b.kind === 'none') return a;
  return a;
}

function compareGrowth(a: Growth, b: Growth): number {
  const order = (g: Growth) => {
    switch (g.kind) {
      case 'none':
        return 0;
      case 'log':
        return 1;
      case 'poly':
        return 2;
      case 'expConst':
        return 3;
      case 'fact':
        return 4;
      case 'expVar':
        return 5;
    }
  };
  const oa = order(a);
  const ob = order(b);
  if (oa !== ob) return oa < ob ? -1 : 1;
  if (a.kind === 'log' && b.kind === 'log') {
    return Math.sign(a.deg - b.deg);
  }
  if (a.kind === 'poly' && b.kind === 'poly') {
    if (a.deg !== b.deg) return a.deg < b.deg ? -1 : 1;
    return Math.sign(a.logDeg - b.logDeg);
  }
  if (a.kind === 'expConst' && b.kind === 'expConst') {
    return Math.sign(a.base - b.base);
  }
  return 0;
}

function collectVars(node: Node): Set<string> {
  const out = new Set<string>();
  const walk = (n: Node): void => {
    switch (n.type) {
      case 'const':
        return;
      case 'var':
        out.add(n.name);
        return;
      case 'log':
      case 'factorial':
        walk(n.arg);
        return;
      case 'power':
        walk(n.base);
        walk(n.exponent);
        return;
      case 'product':
        n.factors.forEach(walk);
        return;
      case 'sum':
        n.terms.forEach(walk);
        return;
    }
  };
  walk(node);
  return out;
}
