import type { Metadata } from "next";
import Link from "next/link";

import { EnquiryForm } from "@/components/EnquiryForm";
import { WhatsAppIcon } from "@/components/icons";
import { formatPhone, site, socialLinks } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: `Ask ${site.name} about hampers, company orders and delivery. Message us on WhatsApp or send an enquiry by email.`,
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: `Contact · ${site.name}` },
};

export default function ContactPage() {
  const wa = whatsappLink(`Hello ${site.name}, I'd like to ask about your hampers.`);
  const socials = socialLinks.filter((s) => site.social[s.key]);

  return (
    <div className="container-x grid items-start gap-14 pt-12 pb-24 md:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">Contact</p>
          <h1 className="display-1 !text-[clamp(2.4rem,5vw,3.6rem)]">Talk to us.</h1>
          <p className="lede measure text-muted">
            Questions about a hamper, a large company order or a delivery date? Send a message and we&apos;ll reply by email. If you already know what you want,{" "}
            <Link href="/hampers" className="link">build your order list</Link> instead.
          </p>
        </div>

        <dl className="flex flex-col gap-6 border-t border-line pt-8">
          {wa && (
            <div className="flex flex-col gap-2">
              <dt className="label">WhatsApp</dt>
              <dd className="flex flex-col items-start gap-3">
                <span className="text-lg tabular-nums">{formatPhone(site.whatsapp)}</span>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                  <WhatsAppIcon className="size-5" /> Chat on WhatsApp
                </a>
              </dd>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <dt className="label">Email</dt>
            <dd><a href={`mailto:${site.email}`} className="link text-lg">{site.email}</a></dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="label">Delivery</dt>
            <dd className="measure">{site.delivery.full}</dd>
          </div>
          {socials.length > 0 && (
            <div className="flex flex-col gap-1">
              <dt className="label">Follow us</dt>
              <dd className="flex flex-wrap gap-4">
                {socials.map((s) => (
                  <a key={s.key} href={s.href(site.social[s.key])} target="_blank" rel="noopener noreferrer" className="link">{s.label}</a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <EnquiryForm />
    </div>
  );
}
