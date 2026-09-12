import type { Metadata } from "next";

import { HamperCard } from "@/components/HamperCard";
import { QuickEstimate } from "@/components/QuickEstimate";
import { Reveal } from "@/components/Reveal";
import { AddOns, ContactBand } from "@/components/sections";
import { hampers, lowestPrice } from "@/content/catalogue";
import { site } from "@/content/site";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Hampers",
  description: `Radiant Lux, Grace Lux and Bloom Lux: gift hampers from ${formatNaira(lowestPrice)}, with full contents and prices. ${site.delivery.short}.`,
  alternates: { canonical: "/hampers" },
  openGraph: { url: "/hampers", title: `Hampers · ${site.name}` },
};

export default function HampersPage() {
  return (
    <>
      <section className="container-x flex flex-col gap-5 pt-14 pb-12 md:pt-20">
        <p className="eyebrow">The hampers</p>
        <h1 className="display-1 max-w-[14ch]">Three hampers, priced upfront.</h1>
        <p className="lede measure text-muted">
          Every price is per hamper. Open one to see everything inside, then add as many as you need to your order list.
        </p>
      </section>

      <section aria-label="All hampers" className="container-x pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hampers.map((h, i) => (
            <Reveal key={h.slug} delay={i * 110} className="flex">
              <HamperCard hamper={h} offset={i} priority={i < 2} />
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">Contents may vary with availability. We confirm the final list and total in your quote.</p>
      </section>

      <section aria-labelledby="estimate-title" className="border-y border-line bg-tint/60">
        <div className="container-x grid items-start gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-5">
            <p className="eyebrow">Ordering for a team</p>
            <h2 id="estimate-title" className="display-2 max-w-[16ch]">See the total before you ask.</h2>
            <p className="measure text-lg text-muted">Enter how many of each hamper you need. You can change the numbers again in your order list.</p>
          </div>
          <QuickEstimate />
        </div>
      </section>

      <div className="container-x py-20 md:py-24">
        <AddOns />
      </div>

      <ContactBand />
    </>
  );
}
