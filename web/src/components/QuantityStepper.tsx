"use client";

import { useEffect, useState } from "react";

import { MAX_QTY } from "@/lib/order";

type Props = {
  value: number;
  onChange: (qty: number) => void;
  label: string;
  min?: number;
};

/** − [ 12 ] + with a typeable middle, for corporate orders of any size. */
export function QuantityStepper({ value, onChange, label, min = 1 }: Props) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    // Keep the typed text in step when the quantity changes from outside (the +/- buttons, another tab).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = Math.floor(Number(raw.replace(/\D/g, "")));
    const next = Number.isFinite(n) && n >= min ? Math.min(MAX_QTY, n) : min;
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`One fewer: ${label}`}>
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        aria-label="Quantity"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(e.currentTarget.value);
          }
        }}
      />
      <button type="button" onClick={() => onChange(Math.min(MAX_QTY, value + 1))} disabled={value >= MAX_QTY} aria-label={`One more: ${label}`}>
        +
      </button>
    </div>
  );
}
