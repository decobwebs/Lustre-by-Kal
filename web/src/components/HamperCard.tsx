import Image from "next/image";
import Link from "next/link";

import { AddButton } from "@/components/AddToOrder";
import { Sparkle } from "@/components/Logo";
import { PhotoRotator } from "@/components/PhotoRotator";
import { hamperLevel, type Hamper } from "@/content/catalogue";
import { formatNaira } from "@/lib/format";

/** Packed-hamper photo when Kal supplies one, otherwise its contents, cycling. */
export function HamperVisual({ hamper, offset = 0, priority = false }: { hamper: Hamper; offset?: number; priority?: boolean }) {
  if (hamper.image) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden bg-tint">
        <Image
          src={hamper.image}
          alt={`${hamper.name} hamper, packed`}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          priority={priority}
        />
      </div>
    );
  }
  return <PhotoRotator hamper={hamper} offset={offset} priority={priority} />;
}

/**
 * The card dresses itself according to where the hamper sits on price:
 * the dearest is dark with a gilt edge, the middle warm cream, the entry plain.
 */
export function HamperCard({ hamper, offset = 0, priority = false }: { hamper: Hamper; offset?: number; priority?: boolean }) {
  const href = `/hampers/${hamper.slug}`;
  const level = hamperLevel(hamper);
  const gold = level === "premium";

  return (
    <article className="hamper-card group" data-level={level}>
      <div className="hamper-crown" />
      {gold && (
        <p className="hamper-crest">
          <Sparkle />
          Top tier
        </p>
      )}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        <HamperVisual hamper={hamper} offset={offset} priority={priority} />
      </Link>
      <div className="hamper-body">
        <div className="hamper-head">
          <span className="hamper-tier">{hamper.tier}</span>
          <span className="hamper-ref">{hamper.ref}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="hamper-name">
            <Link href={href} className="underline-offset-4 group-hover:underline">
              {hamper.name}
            </Link>
          </h3>
          <p className="hamper-price">
            {formatNaira(hamper.price)} <span>per hamper</span>
          </p>
        </div>
        <p className="hamper-for">For {hamper.audience.toLowerCase()}</p>
        <p className="hamper-summary">{hamper.summary}</p>
        <div className="hamper-actions">
          <Link href={href} className={`btn btn-sm ${gold ? "btn-gold" : "btn-primary"}`}>
            See what&apos;s inside
          </Link>
          <AddButton itemRef={hamper.ref} className={`btn btn-sm ${gold ? "btn-gold-outline" : "btn-outline"}`} />
        </div>
      </div>
    </article>
  );
}
