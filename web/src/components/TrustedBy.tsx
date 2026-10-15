import Image from "next/image";

import { partners, type Partner } from "@/content/partners";

/**
 * A logo strip that drifts sideways, the same motion language as the
 * product strip on the home page.
 *
 * Each logo sits in a fixed, modest-sized box (not sized by its own natural
 * aspect ratio) so a wide horizontal wordmark like Reliant Anchor's can
 * never dominate the row — several logos stay visible at once, even on a
 * narrow phone.
 *
 * The CSS loop works by translating exactly -50%, so the track has to be
 * precisely two copies of one "set" for the seam to be invisible. The set
 * itself is padded out (by repeating the partner list) to a minimum size,
 * so two logos still read as a full band rather than an obvious two-logo
 * loop — and nothing here needs to change as more logos come in.
 */
export function TrustedBy() {
  if (partners.length === 0) return null;

  const SET_SIZE = 8;
  const set: Partner[] = [];
  while (set.length < SET_SIZE) set.push(...partners);
  set.length = Math.max(partners.length, Math.min(SET_SIZE, set.length));

  const renderLogo = (partner: Partner, key: string, hidden: boolean) => (
    <li key={key} aria-hidden={hidden || undefined} className="flex h-9 w-28 shrink-0 items-center justify-center sm:h-10 sm:w-32 md:h-12 md:w-36">
      <div className="relative h-full w-full">
        <Image
          src={partner.logo}
          alt={hidden ? "" : partner.name}
          fill
          sizes="140px"
          className="object-contain opacity-80 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0"
        />
      </div>
    </li>
  );

  return (
    <section aria-labelledby="trusted-by-title" className="border-t border-line">
      <div className="container-x flex flex-col gap-8 py-14 md:py-16">
        <p id="trusted-by-title" className="eyebrow justify-center text-center md:justify-start md:text-left">
          Trusted by
        </p>
        <div className="marquee -mx-5 px-5 md:-mx-8 md:px-8">
          <ul className="marquee-track items-center">
            {set.map((partner, i) => renderLogo(partner, `a-${i}`, false))}
            {set.map((partner, i) => renderLogo(partner, `b-${i}`, true))}
          </ul>
        </div>
      </div>
    </section>
  );
}
