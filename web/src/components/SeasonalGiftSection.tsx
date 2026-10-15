"use client";

import Image from "next/image";
import { useId, useState } from "react";

import giftBag from "@/assets/seasonal/gift-bag.jpg";
import { MailIcon, WhatsAppIcon } from "@/components/icons";
import { site } from "@/content/site";
import { SEASONAL_OCCASIONS, seasonalRequestText, type SeasonalOccasion } from "@/lib/seasonal";
import { whatsappEnabled, whatsappLink } from "@/lib/whatsapp";

/**
 * A lighter-weight request box, not a priced catalogue item: there is no fixed
 * hamper here, so nothing is added to the order list. It just composes one
 * message — occasion, what they have in mind, budget — and hands it to
 * WhatsApp (or email, if WhatsApp isn't configured) for a real conversation.
 */
export function SeasonalGiftSection({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const headingId = useId();
  const [occasion, setOccasion] = useState<SeasonalOccasion>("Birthday");
  const [requirements, setRequirements] = useState("");
  const [budget, setBudget] = useState("");

  const text = seasonalRequestText({ occasion, requirements, budget });
  const wa = whatsappLink(text);
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`Seasonal gift — ${occasion}`)}&body=${encodeURIComponent(text)}`;

  return (
    <section id="seasonal" aria-labelledby={headingId} className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">Seasonal gifting</p>
          <H id={headingId} className="display-2 max-w-[18ch]">A gift, made for the moment.</H>
          <p className="measure text-lg text-muted">
            For birthdays, Valentine&apos;s, Christmas, Eid and Ramadan — a self-curated gift box for someone you love, under ₦100,000.
            Handwritten letters, gift cards and thoughtful extras, picked around the season.
          </p>
          <p className="text-[0.97rem] text-muted">
            Share the occasion, what you have in mind, and your budget, and we&apos;ll put a gifting experience together for you.
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="field-label mb-1">Occasion</legend>
          <div className="flex flex-wrap gap-2">
            {SEASONAL_OCCASIONS.map((o) => (
              <label
                key={o}
                className={`chip cursor-pointer select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bronze ${occasion === o ? "!border-bronze !bg-tint font-semibold" : ""}`}
              >
                <input type="radio" name="seasonal-occasion" value={o} checked={occasion === o} onChange={() => setOccasion(o)} className="sr-only" />
                {o}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="seasonal-budget" className="field-label">
              Budget <span className="opt">(optional)</span>
            </label>
            <input id="seasonal-budget" className="input" placeholder="Up to ₦100,000" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="seasonal-requirements" className="field-label">
              What do you have in mind? <span className="opt">(optional)</span>
            </label>
            <textarea
              id="seasonal-requirements"
              className="input"
              rows={3}
              placeholder="Who it's for, and what would make them smile."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
              <WhatsAppIcon className="size-5" /> Chat on WhatsApp
            </a>
          )}
          <a href={mailto} className={whatsappEnabled ? "btn btn-quiet" : "btn btn-outline"}>
            <MailIcon className="size-5" /> {whatsappEnabled ? "Email us instead" : "Email us"}
          </a>
        </div>
        <p className="text-sm text-muted">Send us a DM any time, any day — we usually reply within a few hours.</p>
      </div>

      <figure className="flex flex-col gap-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-tint lg:aspect-auto lg:h-full">
          <Image src={giftBag} alt="A Lustre by Kal seasonal gift bag, finished with gold foil stars and a Season's Greetings wreath" fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" placeholder="blur" />
        </div>
        <figcaption className="text-sm text-muted">One of our seasonal gift bags — every box is finished to match the occasion.</figcaption>
      </figure>
    </section>
  );
}
