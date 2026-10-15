/**
 * Business details shown across the site.
 *
 * Anything left empty here is hidden on the site rather than shown as a
 * placeholder. Run `npm run check:launch` to list what is still missing.
 */

const digits = (value: string | undefined) => (value ?? "").replace(/\D/g, "");

export const site = {
  name: "Lustre by Kal",
  shortName: "Lustre",
  tagline: "Hand-packed gift hampers for staff, clients and partners.",
  description:
    "Lustre by Kal packs premium gift hampers for companies to give their staff, clients and partners. Three hampers from ₦160,000, delivered nationwide in 2–5 days.",

  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://lustrebykal.com").replace(/\/$/, ""),

  /** Orders and enquiries arrive here. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "admin@lustrebykal.com",

  /**
   * Kal's WhatsApp number in international format, digits only. Set
   * NEXT_PUBLIC_WHATSAPP_NUMBER to override it; Kal's own number is the
   * default so the buttons work even where the variable isn't set.
   */
  whatsapp: digits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348060897446"),

  /** Social handles without the @. Empty hides the link. */
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK ?? "",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK ?? "",
  },

  delivery: {
    short: "Nationwide delivery in 2–5 days",
    full: "We deliver nationwide. Delivery takes a minimum of two days and a maximum of five days. Your location may affect this time.",
  },

  /**
   * The welcome-offer popup's code. There's no checkout to apply it
   * automatically — it's honoured manually, the same way every order already
   * gets confirmed and invoiced by hand. Quoted back to the subscriber by
   * email the moment they sign up.
   */
  firstOrderOffer: { code: "WELCOME5", percent: 5 },
} as const;

/** "+234 801 234 5678" from "2348012345678". */
export function formatPhone(international: string) {
  const d = digits(international);
  if (d.startsWith("234") && d.length === 13) {
    return `+234 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  }
  return d ? `+${d}` : "";
}

export const socialLinks = [
  { key: "instagram", label: "Instagram", href: (h: string) => `https://www.instagram.com/${h}` },
  { key: "facebook", label: "Facebook", href: (h: string) => `https://www.facebook.com/${h}` },
  { key: "tiktok", label: "TikTok", href: (h: string) => `https://www.tiktok.com/@${h}` },
] as const;
