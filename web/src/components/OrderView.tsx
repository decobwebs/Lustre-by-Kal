"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import { Field, Honeypot, TextArea } from "@/components/Field";
import { MailIcon, WhatsAppIcon } from "@/components/icons";
import { useOrder } from "@/components/OrderProvider";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useContactFields } from "@/components/useContactFields";
import { photos, type CatalogueItem } from "@/content/catalogue";
import { site } from "@/content/site";
import { formatNaira, plural } from "@/lib/format";
import { checkCustomer, makeReference, orderText, orderTotals, priceLines, type Customer, type CustomerErrors } from "@/lib/order";
import { daysUntil } from "@/lib/validate";
import { whatsappEnabled, whatsappLink } from "@/lib/whatsapp";

type Status =
  | { kind: "editing" }
  | { kind: "sending" }
  | { kind: "sent-email"; reference: string; email: string }
  | { kind: "sent-whatsapp"; reference: string; href: string }
  | { kind: "problem"; reason: "email-unavailable" | "failed" | "busy"; reference: string; text: string };

const thumbFor = (item: CatalogueItem) => photos[item.kind === "hamper" ? item.photos[0] : item.photo];
const itemHref = (item: CatalogueItem) => (item.kind === "hamper" ? `/hampers/${item.slug}` : "/hampers#add-ons");

export function OrderView() {
  const { lines, ready, setQty, remove, clear } = useOrder();
  const contact = useContactFields();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [deliverTo, setDeliverTo] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "editing" });
  const [startedAt] = useState(() => Date.now());

  /** An error stops being true the moment the customer edits that field. */
  const clearError = (field: keyof Customer) => setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  const formRef = useRef<HTMLFormElement>(null);

  const priced = priceLines(lines);
  const totals = orderTotals(priced);

  const raw: Partial<Customer> = { name, company, email: contact.email, phone: contact.phone, deliverTo, neededBy, notes };

  function validate(): Customer | null {
    const result = checkCustomer(raw);
    contact.touchAll();
    if (!result.ok) {
      setErrors(result.errors);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return null;
    }
    setErrors({});
    return result.customer;
  }

  function sendWhatsApp() {
    const customer = validate();
    if (!customer) return;
    const reference = makeReference();
    const href = whatsappLink(orderText({ reference, priced, customer }));
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
    setStatus({ kind: "sent-whatsapp", reference, href });
  }

  async function sendEmail(e?: FormEvent) {
    e?.preventDefault();
    const customer = validate();
    if (!customer) return;
    setStatus({ kind: "sending" });
    const fallbackRef = makeReference();
    const text = orderText({ reference: fallbackRef, priced, customer });
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, customer: raw, website, startedAt }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reference) {
        setStatus({ kind: "sent-email", reference: data.reference, email: customer.email });
        clear();
        window.scrollTo({ top: 0 });
        return;
      }
      if (res.status === 400 && data.fields) {
        setErrors(data.fields);
        setStatus({ kind: "editing" });
        return;
      }
      const reason = res.status === 503 ? "email-unavailable" : res.status === 429 ? "busy" : "failed";
      setStatus({ kind: "problem", reason, reference: fallbackRef, text });
    } catch {
      setStatus({ kind: "problem", reason: "failed", reference: fallbackRef, text });
    }
  }

  /* ---------------------------------------------------------------- */

  if (status.kind === "sent-email") {
    return (
      <Done title="Your order is on its way to us." reference={status.reference}>
        <p>We&apos;ve emailed a copy to <strong>{status.email}</strong>. We&apos;ll reply to confirm the contents, your delivery date and your invoice.</p>
        <p className="text-muted">If you don&apos;t see our email, check your spam folder, or quote your reference when you contact us.</p>
      </Done>
    );
  }

  if (status.kind === "sent-whatsapp") {
    return (
      <Done title="Finish in WhatsApp." reference={status.reference}>
        <p>We&apos;ve opened WhatsApp with your order written out. <strong>Press send in WhatsApp</strong> so it reaches us.</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={status.href} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            <WhatsAppIcon className="size-5" /> Open WhatsApp again
          </a>
          <button type="button" className="btn btn-outline" onClick={() => { clear(); setStatus({ kind: "editing" }); }}>
            I&apos;ve sent it. Clear my list
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => setStatus({ kind: "editing" })}>
            Back to my list
          </button>
        </div>
      </Done>
    );
  }

  if (!ready) {
    return <p className="py-24 text-center text-muted" aria-live="polite">Loading your order list…</p>;
  }

  if (priced.length === 0) {
    return (
      <div className="flex flex-col items-start gap-5 rounded-lg border border-dashed border-line bg-raised px-6 py-14 md:px-12">
        <h2 className="display-3">Your order list is empty.</h2>
        <p className="measure text-muted">Add hampers and quantities, then send the list to us by WhatsApp or email. We&apos;ll reply with a quote.</p>
        <Link href="/hampers" className="btn btn-primary">Browse the hampers</Link>
      </div>
    );
  }

  const sending = status.kind === "sending";
  const soon = neededBy && !errors.neededBy ? daysUntil(neededBy) : null;

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
      {/* ---------------------------------------------------- The list */}
      <section aria-labelledby="list-title" className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="list-title" className="text-xl font-semibold">{plural(totals.units, "item")} on your list</h2>
          <Link href="/hampers" className="btn btn-quiet">Add more</Link>
        </div>

        <ul className="border-t border-line">
          {priced.map(({ item, qty, subtotal }) => {
            const thumb = thumbFor(item);
            return (
              <li key={item.ref} className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-3 border-b border-line py-5 sm:grid-cols-[84px_1fr_auto]">
                <div className="photo-tile row-span-2 sm:row-span-1">
                  <Image src={thumb.src} alt="" sizes="84px" placeholder="blur" />
                </div>
                <div className="flex flex-col justify-center">
                  <Link href={itemHref(item)} className="font-display text-xl leading-tight hover:text-bronze-text">{item.name}</Link>
                  <span className="text-sm text-muted tabular-nums">
                    {item.ref} · {typeof item.price === "number" ? `${formatNaira(item.price)} each` : "Price on request"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-3 sm:justify-end sm:gap-6 lg:col-span-1 lg:col-start-3 lg:row-start-1">
                  <QuantityStepper value={qty} onChange={(n) => setQty(item.ref, n)} label={`${item.name} quantity`} />
                  <div className="flex items-center gap-4">
                    <span className="min-w-[7.5rem] text-right font-bold tabular-nums">
                      {subtotal === null ? <span className="text-sm font-semibold text-muted">On request</span> : formatNaira(subtotal)}
                    </span>
                    <button type="button" onClick={() => remove(item.ref)} className="text-sm text-muted underline underline-offset-4 hover:text-alert" aria-label={`Remove ${item.name}`}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-1 rounded-lg bg-tint p-6">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-lg font-semibold">Estimated total</span>
            <span className="price text-3xl">{formatNaira(totals.known)}</span>
          </div>
          <p className="text-sm text-muted">
            {totals.hasOnRequest ? "Plus add-ons priced on request. " : ""}Before delivery. We confirm the final total in your quote, and you pay by invoice.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------- Your details */}
      <section aria-labelledby="details-title" className="card p-6 md:p-8 lg:sticky lg:top-24">
        <form ref={formRef} onSubmit={sendEmail} noValidate className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 id="details-title" className="text-xl font-semibold">Your details</h2>
            <p className="text-sm text-muted">So we can confirm your order and send your invoice.</p>
          </div>

          <Field label="Your name" name="name" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} error={errors.name} required />
          <Field label="Company" optional name="company" autoComplete="organization" value={company} onChange={(e) => { setCompany(e.target.value); clearError("company"); }} error={errors.company} />
          <Field
            label="Email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={contact.email}
            onChange={(e) => { contact.setEmail(e.target.value); clearError("email"); }}
            onBlur={contact.blurEmail}
            error={contact.emailError ?? errors.email}
            okMessage={contact.emailOk}
            required
            after={
              contact.suggestion && (
                <p className="field-hint">
                  Did you mean <strong>{contact.suggestion}</strong>?{" "}
                  <button type="button" className="link" onClick={() => contact.setEmail(contact.suggestion!)}>Use this</button>
                </p>
              )
            }
          />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            value={contact.phone}
            onChange={(e) => { contact.setPhone(e.target.value); clearError("phone"); }}
            onBlur={contact.blurPhone}
            error={contact.phoneError ?? errors.phone}
            okMessage={contact.phoneOk}
            required
          />
          <Field
            label="Deliver to"
            name="deliverTo"
            autoComplete="address-level2"
            placeholder="City and state, for example Ikeja, Lagos"
            value={deliverTo}
            onChange={(e) => { setDeliverTo(e.target.value); clearError("deliverTo"); }}
            error={errors.deliverTo}
            required
          />
          <Field
            label="Needed by"
            optional
            name="neededBy"
            type="date"
            value={neededBy}
            onChange={(e) => { setNeededBy(e.target.value); clearError("neededBy"); }}
            error={errors.neededBy}
            hint={soon !== null && soon < 5 ? "Delivery takes 2–5 days after we confirm your order. We'll tell you if we can make this date." : undefined}
          />
          <TextArea
            label="Notes"
            optional
            name="notes"
            rows={4}
            placeholder="Card message, branding, wine or juice, more than one delivery address…"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); clearError("notes"); }}
            error={errors.notes}
          />
          <Honeypot value={website} onChange={setWebsite} />

          {status.kind === "problem" && <Problem status={status} />}

          <div className="flex flex-col gap-3 pt-1">
            {whatsappEnabled && (
              <button type="button" className="btn btn-whatsapp btn-block" onClick={sendWhatsApp} disabled={sending}>
                <WhatsAppIcon className="size-5" /> Send on WhatsApp
              </button>
            )}
            <button type="submit" className={`btn btn-block ${whatsappEnabled ? "btn-outline" : "btn-primary"}`} disabled={sending}>
              <MailIcon className="size-5" /> {sending ? "Sending…" : "Send by email"}
            </button>
            <p className="text-center text-sm text-muted">You&apos;re asking for a quote. Nothing is charged.</p>
          </div>
        </form>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Done({ title, reference, children }: { title: string; reference: string; children: React.ReactNode }) {
  return (
    <div className="card mx-auto flex max-w-2xl flex-col gap-5 p-8 md:p-12" role="status">
      <p className="label">Order reference</p>
      <p className="font-display text-4xl tracking-wide text-bronze-text tabular-nums">{reference}</p>
      <h2 className="display-3">{title}</h2>
      <div className="flex flex-col gap-3 text-lg">{children}</div>
      <Link href="/hampers" className="btn btn-quiet self-start">Back to the hampers</Link>
    </div>
  );
}

function Problem({ status }: { status: Extract<Status, { kind: "problem" }> }) {
  const wa = whatsappLink(status.text);
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`Order ${status.reference}`)}&body=${encodeURIComponent(status.text)}`;
  const message = {
    "email-unavailable": "Sending by email isn't available right now.",
    failed: "We couldn't send your order just now. Your list is still saved.",
    busy: "Too many attempts from this connection. Please wait a few minutes.",
  }[status.reason];
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-md border border-alert/30 bg-alert-bg p-4 text-[0.97rem]">
      <p className="font-semibold text-alert">{message}</p>
      <p>You can still reach us with your order{wa ? " on WhatsApp or" : ""} from your own email app:</p>
      <div className="flex flex-wrap gap-2">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
            <WhatsAppIcon className="size-4" /> WhatsApp
          </a>
        )}
        <a href={mailto} className="btn btn-outline btn-sm">
          <MailIcon className="size-4" /> Open in my email app
        </a>
      </div>
    </div>
  );
}
