import type { ProblemVariable } from '../types/problem';

interface Props {
  variables: ProblemVariable[];
}

export function VariablesPanel({ variables }: Props) {
  if (variables.length === 0) return null;
  return (
    <ul className="space-y-0.5 font-mono text-[11px] text-muted">
      {variables.map((v) => (
        <li key={v.name} className="flex gap-2">
          <span className="text-text">{v.name}</span>
          <span aria-hidden>=</span>
          <span>{v.meaning}</span>
        </li>
      ))}
    </ul>
  );
}
