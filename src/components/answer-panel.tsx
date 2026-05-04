import { useEffect, useState, type KeyboardEvent } from 'react';

export interface AnswerField {
  key: string;
  label: string;
}

interface Props {
  fields: AnswerField[];
  onSubmit: (answers: Record<string, string>) => void;
  disabled?: boolean;
  parseError?: string | null;
}

export function AnswerPanel({ fields, onSubmit, disabled, parseError }: Props) {
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

  return (
    <section
      className="rounded-md border border-border bg-panel p-4 space-y-3"
      aria-disabled={disabled}
    >
      <p className="text-[11px] text-muted">
        examples:{' '}
        <code className="text-text">O(n)</code>{' '}
        <code className="text-text">O(n log n)</code>{' '}
        <code className="text-text">O(n + m)</code>{' '}
        <code className="text-text">O(n²)</code>
      </p>
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
      {parseError && (
        <p className="text-xs text-warn" role="alert">
          {parseError}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded border border-accent bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted"
        >
          Submit
        </button>
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
        className="block w-full rounded border border-border bg-bg px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent disabled:opacity-60"
      />
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
