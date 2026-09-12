import { findItem, type CatalogueItem } from "@/content/catalogue";
import { site } from "@/content/site";
import { formatDate, formatNaira } from "@/lib/format";
import { checkDate, checkEmail, checkName, checkPhone, checkText } from "@/lib/validate";

export const MAX_QTY = 5000;
export const MAX_LINES = 20;

export type OrderLine = { ref: string; qty: number };

export type Customer = {
  name: string;
  company: string;
  email: string;
  phone: string;
  deliverTo: string;
  neededBy: string;
  notes: string;
};

export type PricedLine = { item: CatalogueItem; qty: number; subtotal: number | null };

/** Resolves refs against the catalogue, drops unknown refs and clamps quantities. */
export function priceLines(lines: OrderLine[]): PricedLine[] {
  const merged = new Map<string, number>();
  for (const line of lines) {
    if (!findItem(line.ref)) continue;
    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1) continue;
    merged.set(line.ref, Math.min(MAX_QTY, (merged.get(line.ref) ?? 0) + qty));
  }
  return [...merged].slice(0, MAX_LINES).map(([ref, qty]) => {
    const item = findItem(ref)!;
    const price = item.price;
    return { item, qty, subtotal: typeof price === "number" ? price * qty : null };
  });
}

export function orderTotals(priced: PricedLine[]) {
  const known = priced.reduce((sum, l) => sum + (l.subtotal ?? 0), 0);
  const hasOnRequest = priced.some((l) => l.subtotal === null);
  const units = priced.reduce((sum, l) => sum + l.qty, 0);
  return { known, hasOnRequest, units };
}

/** LBK-0911-4821: order date plus four random digits, easy to read out on the phone. */
export function makeReference(now = new Date()) {
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `LBK-${mm}${dd}-${rand}`;
}

export const isReference = (value: string) => /^LBK-\d{4}-\d{4}$/.test(value);

/* ------------------------------------------------------------------ */
/* Validation of a whole order (browser and server)                    */
/* ------------------------------------------------------------------ */

export type CustomerErrors = Partial<Record<keyof Customer, string>>;

export function checkCustomer(input: Partial<Customer>): { ok: true; customer: Customer } | { ok: false; errors: CustomerErrors } {
  const results = {
    name: checkName(input.name ?? ""),
    company: checkText(input.company ?? "", { label: "the company name", max: 120 }),
    email: checkEmail(input.email ?? ""),
    phone: checkPhone(input.phone ?? ""),
    deliverTo: checkText(input.deliverTo ?? "", { label: "the delivery city and state", required: true, max: 200 }),
    neededBy: checkDate(input.neededBy ?? ""),
    notes: checkText(input.notes ?? "", { label: "your notes", max: 1500 }),
  };
  const errors: CustomerErrors = {};
  const customer = {} as Customer;
  for (const [key, result] of Object.entries(results) as [keyof Customer, (typeof results)[keyof Customer]][]) {
    if (result.ok) customer[key] = result.value;
    else errors[key] = result.message;
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, customer };
}

/* ------------------------------------------------------------------ */
/* The itemised order, as plain text (WhatsApp) and lines (email)      */
/* ------------------------------------------------------------------ */

export function orderSummaryLines(priced: PricedLine[]) {
  return priced.map(({ item, qty, subtotal }) => {
    const each = typeof item.price === "number" ? formatNaira(item.price) : "price on request";
    const total = subtotal === null ? "price on request" : formatNaira(subtotal);
    return { label: `${item.name} · ${item.ref}`, qty, each, total };
  });
}

export function orderText({ reference, priced, customer }: { reference: string; priced: PricedLine[]; customer: Customer }) {
  const { known, hasOnRequest } = orderTotals(priced);
  const lines = orderSummaryLines(priced).map((l) => `• ${l.label} × ${l.qty} — ${l.total}`);
  const details = [
    `Name: ${customer.name}`,
    customer.company && `Company: ${customer.company}`,
    `Phone: ${customer.phone}`,
    `Email: ${customer.email}`,
    `Deliver to: ${customer.deliverTo}`,
    customer.neededBy && `Needed by: ${formatDate(customer.neededBy)}`,
  ].filter(Boolean);

  return [
    `Hello ${site.name}, I'd like a quote for this order.`,
    "",
    `Order reference: ${reference}`,
    "",
    ...lines,
    "",
    `Estimated total: ${formatNaira(known)}${hasOnRequest ? " + items priced on request" : ""}`,
    "",
    ...details,
    ...(customer.notes ? ["", `Notes: ${customer.notes}`] : []),
  ].join("\n");
}

/** Short message for a single hamper, used by "Ask on WhatsApp" buttons. */
export function askText(item?: CatalogueItem, qty?: number) {
  if (!item) return `Hello ${site.name}, I'd like to ask about your hampers.`;
  const amount = qty && qty > 1 ? `${qty} × ` : "";
  return `Hello ${site.name}, I'm interested in ${amount}${item.name} (${item.ref}). Could you send me a quote?`;
}
