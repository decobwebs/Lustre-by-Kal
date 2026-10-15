import { site } from "@/content/site";
import { detailsTable, emailConfigured, emailLayout, inbox, sendEmail } from "@/lib/email";
import { allowRequest, clientAddress, json, looksAutomated, readJson } from "@/lib/guard";
import { checkSubscribe, subscribeAckText, subscribeNoticeText } from "@/lib/subscribe";

export async function POST(request: Request) {
  if (!allowRequest(clientAddress(request))) return json({ error: "busy" }, 429);

  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  if (looksAutomated(body)) return json({ ok: true, code: site.firstOrderOffer.code });

  const checked = checkSubscribe(body as { email?: string });
  if (!checked.ok) return json({ error: "invalid", fields: checked.errors }, 400);
  const { email } = checked;

  if (!emailConfigured()) return json({ error: "email_unavailable" }, 503);

  try {
    await sendEmail({
      to: inbox(),
      replyTo: email,
      subject: `Welcome-offer signup · ${email}`,
      text: subscribeNoticeText(email),
      html: emailLayout({
        heading: "New welcome-offer signup",
        body: detailsTable([["Email", email]]),
        footer: `Sent from the homepage popup on ${site.url}`,
      }),
    });
  } catch (error) {
    console.error("[subscribe] could not deliver to inbox", error);
    return json({ error: "send_failed" }, 502);
  }

  try {
    await sendEmail({
      to: email,
      replyTo: inbox(),
      subject: `Your ${site.firstOrderOffer.percent}% off code`,
      text: subscribeAckText(),
      html: emailLayout({
        heading: `Here's your ${site.firstOrderOffer.percent}% off.`,
        intro: "Mention this code when you send us your order and we'll take it off your total.",
        body: `<p style="margin:0;font-family:Georgia,serif;font-size:32px;letter-spacing:2px;color:#866033">${site.firstOrderOffer.code}</p>`,
        footer: `${site.name} · ${site.url}`,
      }),
    });
  } catch (error) {
    console.error("[subscribe] acknowledgement failed", error);
  }

  // The code is fixed and shown on screen too, so a slow or failed acknowledgement
  // email never leaves the subscriber without it.
  return json({ ok: true, code: site.firstOrderOffer.code });
}
