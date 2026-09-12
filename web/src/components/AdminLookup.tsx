"use client";

import Image from "next/image";
import { useState } from "react";

import { hamperGallery, photos, type CatalogueItem } from "@/content/catalogue";
import { formatDate, formatNaira } from "@/lib/format";
import { parseOrderPaste, resolveOrder, type ParsedOrder } from "@/lib/adminParse";
import type { PricedLine } from "@/lib/order";
import { orderTotals } from "@/lib/order";

const CUSTOMER_ROWS: { key: keyof ParsedOrder["customer"]; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "deliverTo", label: "Deliver to" },
  { key: "neededBy", label: "Needed by" },
  { key: "notes", label: "Notes" },
];

const SAMPLE = `Order reference: LBK-0911-7428

• Grace Lux · LBK-GL01 × 12 — ₦3,120,000
• Radiant Lux · LBK-RL01 × 2 — ₦720,000
• Air fryer · LBK-AD01 × 1 — price on request

Name: Amaka Obi
Company: Brightline Ltd
Phone: +2348031234567
Email: amaka@gmail.com
Deliver to: Ikeja, Lagos
Notes: Card: Thank you for a great year!`;

export function AdminLookup() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<{ parsed: ParsedOrder; priced: PricedLine[] } | null>(null);

  function lookUp(text: string) {
    const parsed = parseOrderPaste(text);
    setResult({ parsed, priced: resolveOrder(parsed) });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="card flex flex-col gap-4 p-6 md:p-7">
        <label htmlFor="paste" className="field-label">
          Paste the order — from WhatsApp or email
        </label>
        <textarea
          id="paste"
          className="input font-mono text-[0.92rem]"
          rows={8}
          placeholder="Paste the whole message, or just the reference lines like LBK-GL01 × 12"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary" onClick={() => lookUp(raw)} disabled={!raw.trim()}>
            Look up this order
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              setRaw(SAMPLE);
              lookUp(SAMPLE);
            }}
          >
            See it with an example
          </button>
          {result && (
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                setRaw("");
                setResult(null);
              }}
            >
              Clear
            </button>
          )}
        </div>
        <p className="field-hint">
          Nothing is saved anywhere — this only re-reads what&apos;s already in the message you paste, against the hampers and
          add-ons on the site right now.
        </p>
      </div>

      {result && <Result parsed={result.parsed} priced={result.priced} />}
    </div>
  );
}

function Result({ parsed, priced }: { parsed: ParsedOrder; priced: PricedLine[] }) {
  const totals = orderTotals(priced);
  const customerRows = CUSTOMER_ROWS.filter((r) => parsed.customer[r.key]);

  if (priced.length === 0 && parsed.unknownRefs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-raised px-6 py-10 text-center text-muted">
        No hamper or add-on references found in that text. Check it includes lines like{" "}
        <code className="rounded bg-tint px-1.5 py-0.5 text-ink">LBK-GL01 × 12</code>.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-6 rounded-lg border border-line bg-tint p-6">
        <div className="flex flex-col gap-1">
          <span className="label">Order reference</span>
          <span className="font-display text-3xl tracking-wide text-bronze-text tabular-nums">
            {parsed.reference ?? "Not found in this text"}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="label">Total</span>
          <span className="price text-3xl">{formatNaira(totals.known)}</span>
          {totals.hasOnRequest && <span className="text-sm text-muted">+ items priced on request</span>}
        </div>
      </div>

      {customerRows.length > 0 && (
        <dl className="grid gap-x-8 gap-y-3 border-t border-line pt-6 sm:grid-cols-2">
          {customerRows.map((r) => (
            <div key={r.key}>
              <dt className="label">{r.label}</dt>
              <dd className="whitespace-pre-line">{r.key === "neededBy" ? formatDate(parsed.customer[r.key]!) : parsed.customer[r.key]}</dd>
            </div>
          ))}
        </dl>
      )}

      {parsed.unknownRefs.length > 0 && (
        <p className="rounded-md border border-alert/30 bg-alert-bg p-4 text-[0.95rem] text-alert">
          Not on the site: <strong>{parsed.unknownRefs.join(", ")}</strong>. Check for a typo, or it may have been removed
          from the catalogue since this order was placed.
        </p>
      )}

      <div className="flex flex-col gap-6 border-t border-line pt-6">
        {priced.map(({ item, qty, subtotal }) => (
          <ItemCard key={item.ref} item={item} qty={qty} subtotal={subtotal} />
        ))}
      </div>
    </div>
  );
}

function ItemCard({ item, qty, subtotal }: { item: CatalogueItem; qty: number; subtotal: number | null }) {
  const gallery = item.kind === "hamper" ? hamperGallery(item) : [item.photo];
  return (
    <article className="card flex flex-col gap-5 p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="label">{item.kind === "hamper" ? item.tier : "Add-on"}</span>
          <h3 className="display-3">{item.name}</h3>
          <span className="text-sm text-muted tabular-nums">{item.ref}</span>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="price text-2xl">
            × {qty}
            <span className="ml-2 text-base font-normal text-muted">
              {typeof item.price === "number" ? `${formatNaira(item.price)} each` : "price on request"}
            </span>
          </span>
          <span className="text-lg font-bold">{subtotal === null ? "On request" : formatNaira(subtotal)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {gallery.map((key) => {
          const p = photos[key];
          return (
            <div key={key} className="photo-tile" title={`${p.name} — ${p.detail}`}>
              <Image src={p.src} alt={p.alt} sizes="120px" placeholder="blur" />
            </div>
          );
        })}
      </div>

      {item.kind === "hamper" && (
        <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {item.groups.map((g) => (
            <div key={g.title} className="flex flex-col gap-2">
              <h4 className="label border-b border-line pb-1.5">{g.title}</h4>
              <ul className="flex flex-col gap-1">
                {g.lines.map((line) => (
                  <li key={line.name} className="grid grid-cols-[1.8rem_1fr] text-[0.95rem]">
                    <span className="font-semibold text-bronze-text tabular-nums">{line.qty ? `${line.qty} ×` : ""}</span>
                    <span>{line.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {item.kind === "addon" && <p className="text-muted">{item.detail}</p>}
    </article>
  );
}
