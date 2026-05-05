import { useEffect, useState, type KeyboardEvent } from 'react';
import { VariablesPanel } from './variables-panel';
import type { ProblemVariable } from '../types/problem';

export interface AnswerField {
  key: string;
  label: string;
}

interface Props {
  fields: AnswerField[];
  onSubmit: (answers: Record<string, string>) => void;
  disabled?: boolean;
  parseError?: string | null;
  variables?: ProblemVariable[];
}

export function AnswerPanel({
  fields,
  onSubmit,
  disabled,
  parseError,
  variables,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    initialValues(fields)
  );

  // Reset when fields change (problem changes) or disabled toggles to false.
  useEffect(() => {
    setValues(initialValues(fields));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyOf(fields), disabled]);

  const allFilled = fields.every(
    (f) => (values[f.key] ?? '').trim().length > 0
  );
  const canSubmit = !disabled && allFilled;

  function handleSubmit() {
    if (!canSubmit) return;
    const trimmed: Record<string, string> = {};
    for (const f of fields) trimmed[f.key] = (values[f.key] ?? '').trim();
    onSubmit(trimmed);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const hasVariables = variables && variables.length > 0;

  return (
    <section
      className="rounded-md border border-border bg-panel"
      aria-disabled={disabled}
    >
      {hasVariables && (
        <div className="px-4 py-3">
          <VariablesPanel variables={variables} />
        </div>
      )}
      <div
        className={`space-y-3 p-4 ${hasVariables ? 'border-t border-border' : ''}`}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((f, idx) => (
            <Field
              key={f.key}
              label={f.label}
              value={values[f.key] ?? ''}
              onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
              onKeyDown={handleKey}
              disabled={disabled}
              autoFocus={idx === 0}
            />
          ))}
        </div>
        {parseError && (
          <p className="text-xs text-warn" role="alert">
            {parseError}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted">
            examples:{' '}
            <code className="text-text">n</code>,{' '}
            <code className="text-text">n log n</code>,{' '}
            <code className="text-text">n + m</code>,{' '}
            <code className="text-text">n²</code>
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded border border-accent bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted"
          >
            Submit
          </button>
        </div>
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

function Field({
  label,
  value,
  onChange,
  onKeyDown,
  disabled,
  autoFocus,
}: FieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-xs uppercase tracking-wider text-muted">
        {label}
      </span>
      <div
        className={`flex items-center rounded border border-border bg-bg font-mono text-sm focus-within:border-accent ${
          disabled ? 'opacity-60' : ''
        }`}
      >
        <span className="select-none pl-3 text-muted">O(</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="block min-w-0 flex-1 bg-transparent px-1 py-2 text-text outline-none disabled:cursor-not-allowed"
        />
        <span className="select-none pr-3 text-muted">)</span>
      </div>
    </label>
  );
}

function initialValues(fields: AnswerField[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) out[f.key] = '';
  return out;
}

function keyOf(fields: AnswerField[]): string {
  return fields.map((f) => f.key).join('|');
}
