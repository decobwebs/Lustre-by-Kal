import type { Metadata } from "next";

import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.name} uses the details you share when you order or send an enquiry.`,
  alternates: { canonical: "/privacy" },
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we collect",
    body: (
      <>
        <p>When you send an order, we receive your name, company (if you give one), email address, phone number, delivery city and state, the date you need the hampers, any notes, and the hampers you chose.</p>
        <p>When you send an enquiry, we receive your name, email address, phone number (if you give one) and your message.</p>
        <p>We don&apos;t take card or bank details on this website. You pay by invoice after we confirm your order.</p>
      </>
    ),
  },
  {
    title: "Why we use it",
    body: <p>Only to reply to you, prepare your quote and invoice, and arrange delivery. We don&apos;t sell your details or use them for advertising.</p>,
  },
  {
    title: "How it reaches us",
    body: (
      <>
        <p>
          Orders and enquiries sent by email are delivered to our inbox through our email provider, Resend, which processes them on our behalf. If you choose to send your order on WhatsApp, the message is handled by WhatsApp under its own privacy policy.
        </p>
        <p>Your order list is saved on your own device so it&apos;s still there when you come back. It isn&apos;t sent to us until you press send.</p>
        <p>This website doesn&apos;t use advertising or tracking cookies.</p>
      </>
    ),
  },
  {
    title: "How long we keep it",
    body: <p>We keep order details for as long as we need them to deliver your order and for our accounting records. Enquiries that don&apos;t lead to an order are deleted when they&apos;re no longer needed.</p>,
  },
  {
    title: "Your choices",
    body: (
      <p>
        You can ask us to show you, correct or delete the details we hold about you at any time. Email{" "}
        <a className="link" href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <article className="container-x flex max-w-3xl flex-col gap-10 pt-12 pb-24 md:pt-16">
      <header className="flex flex-col gap-4">
        <p className="eyebrow">Privacy</p>
        <h1 className="display-1 !text-[clamp(2.4rem,5vw,3.4rem)]">Your details, and what we do with them.</h1>
        <p className="text-muted">Last updated 11 September 2026</p>
      </header>
      {SECTIONS.map((s) => (
        <section key={s.title} className="flex flex-col gap-3 border-t border-line pt-8">
          <h2 className="text-xl font-semibold">{s.title}</h2>
          <div className="flex flex-col gap-3 text-ink/85">{s.body}</div>
        </section>
      ))}
    </article>
  );
}
