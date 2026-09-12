"use client";

import { useState } from "react";

import { useOrder } from "@/components/OrderProvider";
import { QuantityStepper } from "@/components/QuantityStepper";
import { hampers } from "@/content/catalogue";
import { formatNaira } from "@/lib/format";

/** "5 for management, 40 for staff, 20 for partners — what does that come to?" */
export function QuickEstimate() {
  const { add, notify } = useOrder();
  const [qty, setQty] = useState<Record<string, number>>(() => Object.fromEntries(hampers.map((h) => [h.ref, 0])));

  const total = hampers.reduce((sum, h) => sum + h.price * (qty[h.ref] ?? 0), 0);
  const units = Object.values(qty).reduce((a, b) => a + b, 0);

  return (
    <div className="card flex flex-col gap-0 overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-line p-6 md:px-8">
        <h3 className="text-xl font-semibold">Quick estimate</h3>
        <p className="text-muted">Enter how many of each you need. Nothing is sent until you choose to.</p>
      </div>
      <ul className="divide-y divide-line">
        {hampers.map((h) => (
          <li key={h.ref} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 md:px-8">
            <div className="flex min-w-[12rem] flex-col">
              <span className="font-display text-xl">{h.name}</span>
              <span className="text-sm text-muted">
                <span className="tabular-nums">{formatNaira(h.price)}</span> each · {h.audience}
              </span>
            </div>
            <QuantityStepper
              value={qty[h.ref] ?? 0}
              min={0}
              label={`${h.name} quantity`}
              onChange={(n) => setQty((q) => ({ ...q, [h.ref]: n }))}
            />
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-4 bg-tint p-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex flex-col">
          <span className="label">Estimated total</span>
          <span className="price text-3xl" aria-live="polite">{formatNaira(total)}</span>
          <span className="text-sm text-muted">{units > 0 ? `${units} ${units === 1 ? "hamper" : "hampers"}, before delivery` : "Before delivery"}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={units === 0}
          onClick={() => {
            for (const h of hampers) if (qty[h.ref] > 0) add(h.ref, qty[h.ref]);
            notify(`${units} ${units === 1 ? "hamper" : "hampers"} added to your order list`, { href: "/order", label: "View list" });
            setQty(Object.fromEntries(hampers.map((h) => [h.ref, 0])));
          }}
        >
          Add to my order list
        </button>
      </div>
    </div>
  );
}
