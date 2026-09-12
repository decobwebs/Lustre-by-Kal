import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddWithQuantity } from "@/components/AddToOrder";
import { HamperCard } from "@/components/HamperCard";
import { JsonLd } from "@/components/JsonLd";
import { ContactBand } from "@/components/sections";
import { findHamper, hamperGallery, hamperLevel, hampers, photos } from "@/content/catalogue";
import { site } from "@/content/site";
import { formatNaira } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return hampers.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: PageProps<"/hampers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const hamper = findHamper(slug);
  if (!hamper) return {};
  const title = `${hamper.name} hamper · ${formatNaira(hamper.price)}`;
  return {
    title,
    description: `${hamper.summary} For ${hamper.audience.toLowerCase()}. ${site.delivery.short}.`,
    alternates: { canonical: `/hampers/${hamper.slug}` },
    openGraph: {
      url: `/hampers/${hamper.slug}`,
      title: `${title} · ${site.name}`,
      description: hamper.summary,
      images: [{ url: `/og/${hamper.slug}.png`, width: 1200, height: 630, alt: `${hamper.name} hamper, ${formatNaira(hamper.price)}` }],
    },
  };
}

export default async function HamperPage({ params }: PageProps<"/hampers/[slug]">) {
  const { slug } = await params;
  const hamper = findHamper(slug);
  if (!hamper) notFound();

  const others = hampers.filter((h) => h.slug !== hamper.slug);
  const gallery = hamperGallery(hamper);
  const level = hamperLevel(hamper);
  const itemCount = hamper.groups.reduce((n, g) => n + g.lines.length, 0);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${hamper.name} gift hamper`,
          sku: hamper.ref,
          description: hamper.summary,
          image: [`${site.url}/og/${hamper.slug}.png`],
          brand: { "@type": "Brand", name: site.name },
          offers: {
            "@type": "Offer",
            price: hamper.price,
            priceCurrency: "NGN",
            availability: "https://schema.org/InStock",
            url: `${site.url}/hampers/${hamper.slug}`,
            seller: { "@type": "Organization", name: site.name },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Hampers", item: `${site.url}/hampers` },
            { "@type": "ListItem", position: 2, name: hamper.name, item: `${site.url}/hampers/${hamper.slug}` },
          ],
        }}
      />

      <div className="container-x pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex items-center gap-2">
            <li><Link href="/hampers" className="hover:text-bronze-text">Hampers</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{hamper.name}</li>
          </ol>
        </nav>
      </div>

      <section className="container-x grid items-start gap-12 pt-8 pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <figure className="flex flex-col gap-3" data-level={level}>
          {hamper.image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-tint">
              <Image src={hamper.image} alt={`${hamper.name} hamper, packed`} fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((key, i) => {
              const p = photos[key];
              return (
                <div key={key} className="photo-tile transition-transform duration-500 hover:scale-[1.04]" title={`${p.name} — ${p.detail}`}>
                  <Image src={p.src} alt={p.alt} priority={i < 3 && !hamper.image} placeholder="blur" sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw" />
                </div>
              );
            })}
          </div>
          <figcaption className="text-sm text-muted">
            {gallery.length} of the items in the {hamper.name}. Brands can change with availability.
          </figcaption>
        </figure>

        <div className="flex flex-col gap-7 lg:sticky lg:top-28">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={`tag ${level === "premium" ? "tag-premium" : level === "middle" ? "tag-middle" : ""}`}>{hamper.tier}</span>
              <span className="text-sm text-muted tabular-nums">Ref {hamper.ref}</span>
            </div>
            <h1 className="display-1 !text-[clamp(2.6rem,5vw,3.8rem)]">{hamper.name}</h1>
            <p className="price text-3xl">
              {formatNaira(hamper.price)} <span className="text-lg font-normal text-muted">per hamper</span>
            </p>
          </div>
          <p className="text-lg"><span className="text-muted">For</span> {hamper.audience.toLowerCase()}.</p>
          <p className="measure text-lg text-ink/85">{hamper.summary}</p>

          <AddWithQuantity itemRef={hamper.ref} />

          <dl className="grid gap-x-8 gap-y-3 border-t border-line pt-6 text-[0.97rem] sm:grid-cols-2">
            <div><dt className="label">Delivery</dt><dd>Nationwide, 2–5 days</dd></div>
            <div><dt className="label">Payment</dt><dd>By invoice, after we confirm</dd></div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="inside" className="border-t border-line bg-raised/60">
        <div className="container-x flex flex-col gap-10 py-20">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Full contents</p>
            <h2 id="inside" className="display-2">What&apos;s inside the {hamper.name}</h2>
            <p className="text-muted">{itemCount} items. Brands and some items can change with availability; we confirm the final list in your quote.</p>
          </div>
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {hamper.groups.map((g) => (
              <div key={g.title} className="flex flex-col gap-3">
                <h3 className="label border-b border-line pb-2">{g.title}</h3>
                <ul className="flex flex-col gap-1.5">
                  {g.lines.map((line) => (
                    <li key={line.name} className="grid grid-cols-[2.2rem_1fr] text-[1.02rem]">
                      <span className="font-semibold text-bronze-text tabular-nums">{line.qty ? `${line.qty} ×` : ""}</span>
                      <span>{line.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="others" className="container-x flex flex-col gap-10 py-20">
        <h2 id="others" className="display-2">The other hampers</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {others.map((h, i) => (
            <HamperCard key={h.slug} hamper={h} offset={i + 1} />
          ))}
        </div>
      </section>

      <ContactBand />
    </>
  );
}
