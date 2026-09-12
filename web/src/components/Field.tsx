"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

type Shared = {
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  /** Shown in green once the value has been checked and is fine. */
  okMessage?: string;
  after?: ReactNode;
};

export function Field({ label, optional, hint, error, okMessage, after, ...input }: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`, okMessage && !error && `${id}-ok`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label} {optional && <span className="opt">(optional)</span>}
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        data-valid={okMessage && !error ? "true" : undefined}
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="field-error">{error}</p>
      ) : okMessage ? (
        <p id={`${id}-ok`} className="field-ok">{okMessage}</p>
      ) : null}
      {after}
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, optional, hint, error, ...input }: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label} {optional && <span className="opt">(optional)</span>}
      </label>
      <textarea id={id} className="input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>
  );
}

/** Off-screen field that people never see but form-filling bots do. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
