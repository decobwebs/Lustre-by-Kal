/**
 * Email delivery through Resend (https://resend.com), called over plain HTTPS
 * so there is no SDK to keep updated. Server-only: reads secret env vars.
 */

type Email = { to: string; subject: string; html: string; text: string; replyTo?: string };

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

/** Where new orders and enquiries are delivered. */
export const inbox = () => process.env.ORDERS_INBOX || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "admin@lustrebykal.com";

export async function sendEmail({ to, subject, html, text, replyTo }: Email) {
  const res = await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Email provider returned ${res.status}: ${detail.slice(0, 300)}`);
  }
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const BRONZE = "#866033";
const INK = "#231c15";
const MUTED = "#6b6053";
const LINE = "#e5ddd0";

/** A simple, table-based layout that survives Gmail, Outlook and phone mail apps. */
export function emailLayout({ heading, intro, body, footer }: { heading: string; intro?: string; body: string; footer?: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f4ede3;padding:24px 12px;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid ${LINE};border-radius:8px">
<tr><td style="padding:28px 32px 8px;font-family:Georgia,serif;font-size:13px;letter-spacing:3px;color:${BRONZE};text-transform:uppercase">Lustre by Kal</td></tr>
<tr><td style="padding:4px 32px 0;font-family:Georgia,serif;font-size:26px;line-height:1.25;color:${INK}">${esc(heading)}</td></tr>
${intro ? `<tr><td style="padding:12px 32px 0;font-size:16px;line-height:1.55;color:${INK}">${esc(intro)}</td></tr>` : ""}
<tr><td style="padding:20px 32px 28px">${body}</td></tr>
${footer ? `<tr><td style="padding:18px 32px;border-top:1px solid ${LINE};font-size:13px;line-height:1.5;color:${MUTED}">${esc(footer)}</td></tr>` : ""}
</table></body></html>`;
}

export function detailsTable(rows: [string, string][]) {
  const cells = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;font-size:13px;color:${MUTED};vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;font-size:15px;color:${INK}">${esc(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${cells}</table>`;
}

export function itemsTable(items: { label: string; qty: number; each: string; total: string }[], totalLine: string) {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:15px">${esc(i.label)}<br><span style="font-size:13px;color:${MUTED}">${esc(i.each === "price on request" ? i.each : `${i.each} each`)}</span></td><td style="padding:10px 12px;border-bottom:1px solid ${LINE};font-size:15px;text-align:center">× ${i.qty}</td><td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:15px;text-align:right;white-space:nowrap">${esc(i.total)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 18px">${rows}<tr><td colspan="3" style="padding:12px 0 0;font-size:16px;font-weight:bold;text-align:right;color:${BRONZE}">${esc(totalLine)}</td></tr></table>`;
}

export const referenceBlock = (reference: string) =>
  `<p style="margin:0 0 18px;font-size:13px;color:${MUTED}">Order reference<br><span style="font-family:Georgia,serif;font-size:24px;letter-spacing:1px;color:${BRONZE}">${esc(reference)}</span></p>`;
