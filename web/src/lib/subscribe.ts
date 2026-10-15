import { site } from "@/content/site";
import { checkEmail } from "@/lib/validate";

export type SubscribeErrors = { email?: string };

export function checkSubscribe(input: { email?: string }): { ok: true; email: string } | { ok: false; errors: SubscribeErrors } {
  const result = checkEmail(input.email ?? "");
  return result.ok ? { ok: true, email: result.value } : { ok: false, errors: { email: result.message } };
}

export function subscribeNoticeText(email: string) {
  return `New welcome-offer signup: ${email}`;
}

export function subscribeAckText() {
  const { code, percent } = site.firstOrderOffer;
  return [
    `Hello,`,
    "",
    `Thank you for signing up. Here's your code for ${percent}% off your first order:`,
    "",
    code,
    "",
    `Just mention it when you send us your order — by WhatsApp or email — and we'll take it off your total.`,
    "",
    `${site.name} · ${site.url}`,
  ].join("\n");
}
