"use client";

import { useState } from "react";

import { useOrder } from "@/components/OrderProvider";
import { QuantityStepper } from "@/components/QuantityStepper";
import { WhatsAppIcon } from "@/components/icons";
import { findItem } from "@/content/catalogue";
import { askText } from "@/lib/order";
import { whatsappLink } from "@/lib/whatsapp";

/** Compact button for cards: adds one and says so. */
export function AddButton({ itemRef, className = "btn btn-outline btn-sm" }: { itemRef: string; className?: string }) {
  const { add, notify } = useOrder();
  const item = findItem(itemRef);
  if (!item) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        add(itemRef, 1);
        notify(`${item.name} added to your order list`, { href: "/order", label: "View list" });
      }}
    >
      Add to order
    </button>
  );
}

/** Quantity + add + ask on WhatsApp, for the hamper page. */
export function AddWithQuantity({ itemRef }: { itemRef: string }) {
  const { add, notify } = useOrder();
  const [qty, setQty] = useState(1);
  const item = findItem(itemRef);
  if (!item) return null;
  const wa = whatsappLink(askText(item, qty));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} label={`How many ${item.name} hampers`} />
        <button
          type="button"
          className="btn btn-primary grow sm:grow-0"
          onClick={() => {
            add(itemRef, qty);
            notify(`${qty} × ${item.name} added to your order list`, { href: "/order", label: "View list" });
            setQty(1);
          }}
        >
          Add to order list
        </button>
      </div>
      {wa && (
        <a className="btn btn-quiet self-start" href={wa} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon className="size-5" /> Ask about this hamper on WhatsApp
        </a>
      )}
    </div>
  );
}
