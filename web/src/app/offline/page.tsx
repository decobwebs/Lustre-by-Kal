import type { Metadata } from "next";
import Link from "next/link";

import { Monogram } from "@/components/Logo";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

/** Shown by the service worker when a page hasn't been visited before and there is no connection. */
export default function OfflinePage() {
  return (
    <div className="container-x flex flex-col items-start gap-6 py-24 md:py-32">
      <Monogram className="h-20 w-auto text-bronze" title="" />
      <h1 className="display-1 !text-[clamp(2.4rem,5vw,3.4rem)]">You&apos;re offline.</h1>
      <p className="lede measure text-muted">
        This page needs a connection. Pages you&apos;ve already opened still work, and your order list is saved on this phone. Sending an order needs a connection.
      </p>
      <Link href="/" className="btn btn-primary">Try again</Link>
    </div>
  );
}
