import Link from "next/link";

import { HamperCard } from "@/components/HamperCard";
import { Monogram, Sparkle } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { QuickEstimate } from "@/components/QuickEstimate";
import { AddOns, ContactBand, HowToOrder, InsideStrip, Questions, SectionHeading } from "@/components/sections";
import { ArrowIcon, CheckIcon, WhatsAppIcon } from "@/components/icons";
import { hamperLevel, hampers, lowestPrice } from "@/content/catalogue";
import { site } from "@/content/site";
import { formatNaira } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export default function HomePage() {
  const wa = whatsappLink(`Hello ${site.name}, I'd like to ask about your hampers.`);

  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-14 pt-12 pb-20 md:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:pt-20 lg:pb-28">
          <div className="flex flex-col gap-7">
            <p className="eyebrow rise">Gift hampers for staff, clients and partners</p>
            <h1 className="display-1 rise rise-2">
              Say thank you,
              <br />
              <span className="text-bronze">properly.</span>
            </h1>
            <p className="lede measure rise rise-3 text-ink/85">
              Hand-packed hampers for the people who keep your business going. Three hampers from{" "}
              <span className="font-semibold tabular-nums">{formatNaira(lowestPrice)}</span>, delivered anywhere in Nigeria in 2–5 days.
            </p>
            <div className="rise rise-4 flex flex-wrap gap-3">
              <Link href="/hampers" className="btn btn-primary">
                See the hampers <ArrowIcon className="size-5" />
              </Link>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <WhatsAppIcon className="size-5" /> Ask on WhatsApp
                </a>
              ) : (
                <Link href="/contact" className="btn btn-outline">Ask us a question</Link>
              )}
            </div>
            <ul className="rise rise-4 flex flex-col gap-2.5 pt-2 text-[0.97rem] text-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
              {["Delivered nationwide", "Order by WhatsApp or email", "Pay by invoice"].map((fact) => (
                <li key={fact} className="flex items-center gap-2">
                  <CheckIcon className="size-4 text-bronze" /> {fact}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rise rise-3 before:pointer-events-none before:absolute before:-inset-10 before:-z-10 before:rounded-full before:bg-[radial-gradient(closest-side,rgb(217_184_132/0.35),transparent)] before:blur-2xl">
            <Monogram
              className="pointer-events-none absolute -right-24 -bottom-16 -z-10 h-[24rem] w-auto rotate-6 text-bronze/[0.09] max-lg:hidden"
              title=""
            />
            <div className="sheen card relative p-2 shadow-[0_30px_60px_-30px_rgb(31_24_18/0.35)]">
              <div className="flex items-baseline justify-between px-5 pt-4 pb-3">
                <span className="label">Our hampers</span>
                <span className="text-sm text-muted">Price per hamper</span>
              </div>
              <ul>
                {hampers.map((h) => (
                  <li key={h.slug}>
                    <Link
                      href={`/hampers/${h.slug}`}
                      className="group flex items-center justify-between gap-4 rounded-md border-t border-line px-5 py-5 transition-colors hover:bg-tint"
                    >
                      <span className="flex flex-col">
                        <span className="flex items-center gap-2 font-display text-[1.75rem] leading-tight">
                          {h.name}
                          {hamperLevel(h) === "premium" && <Sparkle className="size-3.5 text-bronze" />}
                        </span>
                        <span className="text-sm text-muted">{h.audience}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="price text-xl">{formatNaira(h.price)}</span>
                        <ArrowIcon className="size-5 text-bronze transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="rounded-md bg-tint px-5 py-3.5 text-sm text-ink/80">{site.delivery.short}. Contents confirmed in your quote.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Hampers */}
      <section id="hampers" aria-labelledby="hampers-title" className="border-t border-line bg-raised/60">
        <div className="container-x flex flex-col gap-12 py-20 md:py-24">
          <SectionHeading eyebrow="The hampers" title="One for every name on your list." id="hampers-title">
            Each hamper is packed by hand with drinks, treats and something useful they&apos;ll keep. Choose one, or mix all three.
          </SectionHeading>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hampers.map((h, i) => (
              <Reveal key={h.slug} delay={i * 110} className="flex">
                <HamperCard hamper={h} offset={i} priority={i === 0} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ What's inside */}
      <section aria-labelledby="inside-title" className="container-x flex flex-col gap-12 py-20 md:py-24">
        <SectionHeading eyebrow="What goes inside" title="Brands they'll recognise." id="inside-title">
          A few of the things you&apos;ll find in our hampers. Final brands depend on availability and are confirmed in your quote.
        </SectionHeading>
        <InsideStrip />
      </section>

      {/* ------------------------------------------------ Team estimate */}
      <section aria-labelledby="team-title" className="border-y border-line bg-tint/60">
        <div className="container-x grid items-start gap-12 py-20 md:py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-5 lg:sticky lg:top-28">
            <p className="eyebrow">Ordering for a team</p>
            <h2 id="team-title" className="display-2 max-w-[16ch]">Work out your budget in a minute.</h2>
            <p className="measure text-lg text-muted">
              Most companies mix hampers: the premium one for management and key clients, and the others for staff, partners and suppliers. Enter your numbers to see the total, then add them to your order list.
            </p>
          </div>
          <QuickEstimate />
        </div>
      </section>

      <HowToOrder />

      <div className="container-x py-20 md:py-24">
        <AddOns />
      </div>

      <div className="border-t border-line">
        <div className="container-x py-20 md:py-24">
          <Questions />
        </div>
      </div>

      <ContactBand />
    </>
  );
}
