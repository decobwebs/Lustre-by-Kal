"use client";

import { usePathname } from "next/navigation";

import { WhatsAppIcon } from "@/components/icons";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

/** Floating chat button. Hidden on the order page, which has its own WhatsApp send button. */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const href = whatsappLink(`Hello ${site.name}, I'd like to ask about your hampers.`);
  if (!href || pathname === "/order") return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-[#1f7a4d] text-white shadow-[0_10px_26px_rgb(31_24_18/0.28)] transition-transform hover:scale-105 md:right-6 md:bottom-6"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
