import type { ProblemVariable } from '../types/problem';

interface Props {
  variables: ProblemVariable[];
}

export function VariablesPanel({ variables }: Props) {
  if (variables.length === 0) return null;

  return (
    <section
      aria-label="Variable definitions"
      className="px-1 text-xs text-muted"
    >
      <div className="mb-1 uppercase tracking-wider">where:</div>
      <ul className="space-y-0.5 font-mono">
        {variables.map((v) => (
          <li key={v.name} className="flex gap-2">
            <span className="text-text">{v.name}</span>
            <span aria-hidden>=</span>
            <span>{v.meaning}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
