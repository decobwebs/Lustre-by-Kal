import { site } from "@/content/site";

export const whatsappEnabled = site.whatsapp.length > 0;

/** wa.me link with the message already written. Returns null when no number is configured. */
export function whatsappLink(text: string) {
  if (!whatsappEnabled) return null;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}
