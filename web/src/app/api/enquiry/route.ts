import { site } from "@/content/site";
import { detailsTable, emailConfigured, emailLayout, inbox, sendEmail } from "@/lib/email";
import { checkEnquiry, enquiryText, type Enquiry } from "@/lib/enquiry";
import { allowRequest, clientAddress, json, looksAutomated, readJson } from "@/lib/guard";

export async function POST(request: Request) {
  if (!allowRequest(clientAddress(request))) return json({ error: "busy" }, 429);

  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  if (looksAutomated(body)) return json({ ok: true });

  const checked = checkEnquiry(body as Partial<Enquiry>);
  if (!checked.ok) return json({ error: "invalid", fields: checked.errors }, 400);
  const e = checked.enquiry;

  if (!emailConfigured()) return json({ error: "email_unavailable" }, 503);

  const details = detailsTable([
    ["Name", e.name],
    ["Email", e.email],
    ["Phone", e.phone],
    ["About", e.topic],
    ["Message", e.message],
  ]);

  try {
    await sendEmail({
      to: inbox(),
      replyTo: e.email,
      subject: `Enquiry from ${e.name} · ${e.topic}`,
      text: enquiryText(e),
      html: emailLayout({
        heading: `New enquiry from ${e.name}`,
        intro: "Reply to this email to answer them directly.",
        body: details,
        footer: `Sent from the contact page on ${site.url}`,
      }),
    });
  } catch (error) {
    console.error("[enquiry] could not deliver to inbox", error);
    return json({ error: "send_failed" }, 502);
  }

  try {
    await sendEmail({
      to: e.email,
      replyTo: inbox(),
      subject: `We've received your message`,
      text: `Hello ${e.name},\n\nThank you for your message. We've received it and will reply to this email address.\n\nYour message:\n${e.message}\n\n${site.name} · ${site.url}`,
      html: emailLayout({
        heading: "Thank you, we've received your message.",
        intro: `Hello ${e.name}. We'll reply to this email address.`,
        body: detailsTable([["Your message", e.message]]),
        footer: `${site.name} · ${site.url}`,
      }),
    });
  } catch (error) {
    console.error("[enquiry] acknowledgement failed", error);
  }

  return json({ ok: true });
}
