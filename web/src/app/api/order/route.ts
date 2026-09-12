import { site } from "@/content/site";
import { detailsTable, emailConfigured, emailLayout, inbox, itemsTable, referenceBlock, sendEmail } from "@/lib/email";
import { formatDate, formatNaira } from "@/lib/format";
import { allowRequest, clientAddress, json, looksAutomated, readJson } from "@/lib/guard";
import { checkCustomer, makeReference, orderSummaryLines, orderText, orderTotals, priceLines, type Customer, type OrderLine } from "@/lib/order";

export async function POST(request: Request) {
  if (!allowRequest(clientAddress(request))) return json({ error: "busy" }, 429);

  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  // Bots get a normal-looking answer and nothing is sent.
  if (looksAutomated(body)) return json({ ok: true, reference: makeReference() });

  const lines = Array.isArray(body.lines) ? (body.lines as OrderLine[]) : [];
  const priced = priceLines(lines);
  if (priced.length === 0) return json({ error: "empty" }, 400);

  const checked = checkCustomer((body.customer ?? {}) as Partial<Customer>);
  if (!checked.ok) return json({ error: "invalid", fields: checked.errors }, 400);
  const customer = checked.customer;

  if (!emailConfigured()) return json({ error: "email_unavailable" }, 503);

  const reference = makeReference();
  const { known, hasOnRequest } = orderTotals(priced);
  const totalLine = `Estimated total ${formatNaira(known)}${hasOnRequest ? " + add-ons on request" : ""}`;
  const items = itemsTable(orderSummaryLines(priced), totalLine);
  const who = customer.company || customer.name;
  const details = detailsTable([
    ["Name", customer.name],
    ["Company", customer.company],
    ["Phone", customer.phone],
    ["Email", customer.email],
    ["Deliver to", customer.deliverTo],
    ["Needed by", customer.neededBy ? formatDate(customer.neededBy) : ""],
    ["Notes", customer.notes],
  ]);

  try {
    await sendEmail({
      to: inbox(),
      replyTo: customer.email,
      subject: `New order ${reference} · ${who} · ${formatNaira(known)}`,
      text: orderText({ reference, priced, customer }),
      html: emailLayout({
        heading: `New order from ${who}`,
        intro: "Reply to this email to answer the customer directly.",
        body: referenceBlock(reference) + items + details,
        footer: `Sent from the order page on ${site.url}`,
      }),
    });
  } catch (error) {
    console.error("[order] could not deliver to inbox", reference, error);
    return json({ error: "send_failed" }, 502);
  }

  try {
    await sendEmail({
      to: customer.email,
      replyTo: inbox(),
      subject: `We've received your order ${reference}`,
      text: [
        `Hello ${customer.name},`,
        "",
        `Thank you. We've received your order ${reference} and will reply to confirm the contents, your delivery date and your invoice.`,
        "",
        orderText({ reference, priced, customer }),
        "",
        `${site.name} · ${site.url}`,
      ].join("\n"),
      html: emailLayout({
        heading: "Thank you, we've received your order.",
        intro: `Hello ${customer.name}. We'll reply to confirm the contents, your delivery date and your invoice. Nothing has been charged.`,
        body: referenceBlock(reference) + items + details,
        footer: `${site.delivery.full} Reply to this email if anything needs changing.`,
      }),
    });
  } catch (error) {
    // The order already reached Kal; a missing acknowledgement must not make the customer resend it.
    console.error("[order] acknowledgement failed", reference, error);
  }

  return json({ ok: true, reference });
}
