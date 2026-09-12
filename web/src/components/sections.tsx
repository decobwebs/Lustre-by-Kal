import Image from "next/image";
import Link from "next/link";

import { AddButton } from "@/components/AddToOrder";
import { WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { addOns, allProductPhotos, hampers, photos } from "@/content/catalogue";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

/* ------------------------------------------------------------------ */

export function SectionHeading({ eyebrow, title, children, id }: { eyebrow: string; title: string; children?: React.ReactNode; id?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="display-2 max-w-[20ch]">{title}</h2>
      {children && <div className="measure text-lg text-muted">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const STEPS = [
  {
    title: "Choose your hampers",
    body: "Pick hampers and quantities. Mix them freely: Radiant for management, Grace for staff, Bloom for partners.",
  },
  {
    title: "Send us your list",
    body: "By WhatsApp or email, straight from your order list. Every order gets a reference number you can quote.",
  },
  {
    title: "We confirm and invoice",
    body: "We confirm the contents, your delivery date and the total, then email your invoice. You pay us directly. Nothing is paid on this website.",
  },
  {
    title: "We pack and deliver",
    body: "Every hamper is packed by hand and delivered nationwide in 2–5 days.",
  },
];

export function HowToOrder() {
  return (
    <section aria-labelledby="how-to-order" className="night-glow bg-night text-night-text">
      <div className="container-x flex flex-col gap-12 py-20 md:py-28">
        <div className="flex flex-col gap-4">
          <p className="eyebrow !text-bronze-light">How to order</p>
          <h2 id="how-to-order" className="display-2 max-w-[18ch]">From your list to their desk in four steps.</h2>
        </div>
        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 90} className="flex flex-col gap-3 border-t border-night-line pt-6">
              <span className="font-display text-4xl leading-none text-bronze-light tabular-nums">{i + 1}</span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-night-muted">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function AddOns({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <section id="add-ons" aria-labelledby="add-ons-title" className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <p className="eyebrow">Add-ons</p>
        <H id="add-ons-title" className="display-2 max-w-[18ch]">Add something bigger to any hamper.</H>
        <p className="measure text-lg text-muted">
          Give a few people something extra, such as an air fryer in your managers&apos; hampers. Add-ons are priced on request, and we confirm the price in your quote.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {addOns.map((a) => {
          const p = photos[a.photo];
          return (
            <li key={a.ref} className="flex flex-col gap-3">
              <div className="photo-tile transition-transform duration-500 hover:scale-[1.04]">
                <Image src={p.src} alt={p.alt} sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw" placeholder="blur" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{a.name}</span>
                <span className="text-sm text-muted">{a.detail}</span>
                <span className="text-sm font-semibold text-bronze-text">Price on request</span>
              </div>
              <AddButton itemRef={a.ref} className="btn btn-outline btn-sm self-start" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function ProductTile({ photoKey }: { photoKey: (typeof allProductPhotos)[number] }) {
  const p = photos[photoKey];
  const inHampers = hampers.filter((h) => p.in?.includes(h.slug)).map((h) => h.name.replace(" Lux", ""));
  return (
    <figure className="marquee-item flex flex-col gap-2.5">
      <div className="photo-tile transition-transform duration-500 hover:scale-[1.04]">
        <Image src={p.src} alt={p.alt} sizes="190px" placeholder="blur" />
      </div>
      <figcaption className="flex flex-col leading-snug">
        <span className="font-semibold">{p.name}</span>
        <span className="text-sm text-muted">{p.detail}</span>
        {inHampers.length > 0 && (
          <span className="mt-0.5 text-sm text-bronze-text">
            {inHampers.length === hampers.length ? "In all three hampers" : `In ${inHampers.join(" · ")}`}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

/** Every product we hold a photo of, drifting past. Stops when hovered. */
export function InsideStrip() {
  return (
    <div className="marquee -mx-5 px-5 md:-mx-8 md:px-8">
      <ul className="marquee-track">
        {allProductPhotos.map((key) => (
          <li key={key}>
            <ProductTile photoKey={key} />
          </li>
        ))}
        {allProductPhotos.map((key) => (
          <li key={`${key}-again`} aria-hidden="true">
            <ProductTile photoKey={key} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const FAQ = [
  { q: "How long does delivery take?", a: site.delivery.full },
  {
    q: "How do I pay?",
    a: "Once we've confirmed your order, we email you an invoice and you pay us directly. No payment is taken on this website.",
  },
  {
    q: "Will my hamper have exactly these items?",
    a: "The lists show what each hamper usually includes. Brands and some items can change with availability, so we confirm the final contents in your quote before you pay.",
  },
  {
    q: "Do you have alcohol-free hampers?",
    a: "Yes. Grace Lux is alcohol-free. In Radiant Lux and Bloom Lux you can choose sparkling juice instead of wine. Just say so in your order notes.",
  },
  {
    q: "Can you add our company's branding?",
    a: "Every hamper includes a branded mug, and Radiant Lux and Grace Lux include a custom card. Tell us what you have in mind in your order notes and we'll confirm what we can do.",
  },
  {
    q: "Can you deliver to more than one address?",
    a: "Tell us in your order notes. We'll confirm delivery to each address in your quote.",
  },
  {
    q: "How early should we order for December?",
    a: "As early as you can. Put the date you need them by on your order, and we'll confirm it when we reply.",
  },
];

export function Questions() {
  return (
    <section id="questions" aria-labelledby="questions-title" className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <div className="flex flex-col gap-4">
        <p className="eyebrow">Questions</p>
        <h2 id="questions-title" className="display-2">Delivery, payment and the details.</h2>
      </div>
      <div className="faq border-t border-line">
        {FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p className="answer">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function ContactBand() {
  const wa = whatsappLink(`Hello ${site.name}, I'd like to ask about your hampers.`);
  return (
    <section aria-labelledby="contact-band" className="bg-tint">
      <div className="container-x flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <div className="flex max-w-xl flex-col gap-3">
          <h2 id="contact-band" className="display-2">Ready to send your list?</h2>
          <p className="text-lg text-muted">Build your order list and send it in one tap, or talk to us first.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/order" className="btn btn-primary">Go to your order list</Link>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <WhatsAppIcon className="size-5" /> Chat on WhatsApp
            </a>
          ) : (
            <Link href="/contact" className="btn btn-outline">Send us a message</Link>
          )}
        </div>
      </div>
    </section>
  );
}
