import Link from "next/link";

import { StackedLogo } from "@/components/Logo";
import { hampers } from "@/content/catalogue";
import { formatPhone, site, socialLinks } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

export function Footer() {
  const wa = whatsappLink(`Hello ${site.name}, I'd like to ask about your hampers.`);
  const socials = socialLinks.filter((s) => site.social[s.key]);

  return (
    <footer className="mt-auto bg-night text-night-text">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1.2fr] md:py-20">
        <div className="flex flex-col gap-5">
          <StackedLogo className="h-24 w-auto self-start text-bronze-light" />
          <p className="max-w-xs text-night-muted">{site.tagline}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="label !text-night-muted">Hampers</h2>
          {hampers.map((h) => (
            <Link key={h.slug} href={`/hampers/${h.slug}`} className="hover:text-bronze-light">
              {h.name}
            </Link>
          ))}
          <Link href="/hampers#add-ons" className="hover:text-bronze-light">
            Add-ons
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="label !text-night-muted">Ordering</h2>
          <Link href="/#how-to-order" className="hover:text-bronze-light">How to order</Link>
          <Link href="/#questions" className="hover:text-bronze-light">Delivery and payment</Link>
          <Link href="/order" className="hover:text-bronze-light">Your order list</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="label !text-night-muted">Contact</h2>
          <a href={`mailto:${site.email}`} className="break-all hover:text-bronze-light">{site.email}</a>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-bronze-light">
              WhatsApp {formatPhone(site.whatsapp)}
            </a>
          )}
          <Link href="/contact" className="hover:text-bronze-light">Send us a message</Link>
          {socials.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-4">
              {socials.map((s) => (
                <a key={s.key} href={s.href(site.social[s.key])} target="_blank" rel="noopener noreferrer" className="text-night-muted hover:text-bronze-light">
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-night-line">
        <div className="container-x flex flex-col gap-2 py-6 text-sm text-night-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-bronze-light">Privacy</Link>
            <p>{site.delivery.short}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
