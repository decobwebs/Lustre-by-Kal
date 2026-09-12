import type { Metadata } from "next";

import { AdminLookup } from "@/components/AdminLookup";

export const metadata: Metadata = {
  title: "Order lookup",
  description: "Paste an order message to see the full hamper details.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="container-x flex flex-col gap-8 pt-12 pb-24 md:pt-16">
      <header className="flex flex-col gap-4">
        <p className="eyebrow">For Lustre by Kal</p>
        <h1 className="display-1 !text-[clamp(2.4rem,5vw,3.4rem)]">Order lookup</h1>
        <p className="lede measure text-muted">
          When an order arrives on WhatsApp or by email, paste it below to see each hamper&apos;s full contents and photos,
          and the order total — without hunting back through the message yourself.
        </p>
      </header>
      <AdminLookup />
    </div>
  );
}
