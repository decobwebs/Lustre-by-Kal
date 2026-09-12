import { findItem } from "@/content/catalogue";
import { priceLines, type OrderLine } from "@/lib/order";

/**
 * Reads back an order from the exact text Kal already has — the WhatsApp
 * message or email `orderText()` produces. There is no order database: the
 * message the customer sent *is* the record, so this just re-parses it
 * against the catalogue that is already in the site.
 *
 * Two shapes are understood, so a partial paste still works:
 *   1. A full order message: "• Grace Lux · LBK-GL01 × 12 — ₦3,120,000",
 *      plus labelled lines "Name: …", "Phone: …", etc.
 *   2. A quick manual list: "LBK-GL01:12, LBK-RL01x2" — handy when only the
 *      references are known.
 */

export type ParsedOrder = {
  reference: string | null;
  customer: Partial<Record<"name" | "company" | "phone" | "email" | "deliverTo" | "neededBy" | "notes", string>>;
  lines: OrderLine[];
  unknownRefs: string[];
};

const REF_PATTERN = /LBK-[A-Z0-9]{2,8}/g;
const ORDER_REFERENCE_PATTERN = /LBK-\d{4}-\d{4}/;

const CUSTOMER_LABELS: Record<string, keyof ParsedOrder["customer"]> = {
  name: "name",
  company: "company",
  phone: "phone",
  email: "email",
  "deliver to": "deliverTo",
  "needed by": "neededBy",
  notes: "notes",
};

export function parseOrderPaste(raw: string): ParsedOrder {
  const text = raw.trim();
  const referenceMatch = text.match(ORDER_REFERENCE_PATTERN);
  const reference = referenceMatch ? referenceMatch[0] : null;

  // The order reference (LBK-0911-7428) starts with the same "LBK-" prefix as
  // every item reference, so "LBK-0911" would otherwise be mistaken for an
  // unknown item. Blank it out before scanning for item lines.
  const scanText = reference ? text.replace(reference, " ".repeat(reference.length)) : text;

  const customer: ParsedOrder["customer"] = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z ]+?)\s*:\s*(.+)$/);
    if (!m) continue;
    const key = CUSTOMER_LABELS[m[1].trim().toLowerCase()];
    if (key && !customer[key]) customer[key] = m[2].trim();
  }

  const found = new Map<string, number>();
  const unknownRefs = new Set<string>();

  // Each reference, plus the quantity nearest to it on the same line: "× 12",
  // "x12", or ":12". Falls back to 1 if a ref appears with no quantity at all.
  for (const line of scanText.split(/\r?\n/)) {
    let match: RegExpExecArray | null;
    REF_PATTERN.lastIndex = 0;
    while ((match = REF_PATTERN.exec(line))) {
      const ref = match[0];
      const after = line.slice(match.index + ref.length, match.index + ref.length + 12);
      const qtyMatch = after.match(/^\s*[×x:]\s*(\d{1,5})/i);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      if (!findItem(ref)) {
        unknownRefs.add(ref);
        continue;
      }
      found.set(ref, (found.get(ref) ?? 0) + qty);
    }
  }

  const lines: OrderLine[] = [...found].map(([ref, qty]) => ({ ref, qty }));
  return { reference, customer, lines, unknownRefs: [...unknownRefs] };
}

/** Resolves the parsed lines against the catalogue, with totals. */
export function resolveOrder(parsed: ParsedOrder) {
  return priceLines(parsed.lines);
}
