import Link from "next/link";

import { Monogram } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-start gap-6 py-24 md:py-32">
      <Monogram className="h-20 w-auto text-bronze" title="" />
      <h1 className="display-1 !text-[clamp(2.4rem,5vw,3.4rem)]">We couldn&apos;t find that page.</h1>
      <p className="lede measure text-muted">The link may be old, or the address may have a typo. The hampers are all one tap away.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/hampers" className="btn btn-primary">See the hampers</Link>
        <Link href="/" className="btn btn-outline">Go to the home page</Link>
      </div>
    </div>
  );
}
