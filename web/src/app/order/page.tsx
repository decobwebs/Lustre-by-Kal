import type { Metadata } from "next";

import { OrderView } from "@/components/OrderView";

export const metadata: Metadata = {
  title: "Your order list",
  description: "Review your hampers and send your order by WhatsApp or email.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/order" },
};

export default function OrderPage() {
  return (
    <div className="container-x flex flex-col gap-10 pt-12 pb-24 md:pt-16">
      <header className="flex flex-col gap-4">
        <p className="eyebrow">Order list</p>
        <h1 className="display-1 !text-[clamp(2.4rem,5vw,3.6rem)]">Your order list</h1>
        <p className="lede measure text-muted">
          Check your hampers and quantities, add your details, then send the list to us. We reply with a quote and your invoice.
        </p>
      </header>
      <OrderView />
    </div>
  );
}
