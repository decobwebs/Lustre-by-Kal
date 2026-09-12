"use client";

import { useRef, useState, type FormEvent } from "react";

import { Field, Honeypot, TextArea } from "@/components/Field";
import { MailIcon, WhatsAppIcon } from "@/components/icons";
import { useContactFields } from "@/components/useContactFields";
import { site } from "@/content/site";
import { checkEnquiry, ENQUIRY_TOPICS, enquiryText, type Enquiry, type EnquiryErrors } from "@/lib/enquiry";
import { whatsappLink } from "@/lib/whatsapp";

type Status = { kind: "editing" } | { kind: "sending" } | { kind: "sent"; email: string } | { kind: "problem"; reason: "email-unavailable" | "failed" | "busy"; text: string };

export function EnquiryForm() {
  const contact = useContactFields({ phoneRequired: false });
  const [name, setName] = useState("");
  const [topic, setTopic] = useState<string>(ENQUIRY_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "editing" });
  const [startedAt] = useState(() => Date.now());

  /** An error stops being true the moment the sender edits that field. */
  const clearError = (field: keyof Enquiry) => setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const raw = { name, email: contact.email, phone: contact.phone, topic, message };
    const checked = checkEnquiry(raw);
    contact.touchAll();
    if (!checked.ok) {
      setErrors(checked.errors);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    const text = enquiryText(checked.enquiry);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...raw, website, startedAt }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) return setStatus({ kind: "sent", email: checked.enquiry.email });
      if (res.status === 400 && data.fields) {
        setErrors(data.fields);
        return setStatus({ kind: "editing" });
      }
      setStatus({ kind: "problem", reason: res.status === 503 ? "email-unavailable" : res.status === 429 ? "busy" : "failed", text });
    } catch {
      setStatus({ kind: "problem", reason: "failed", text });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="card flex flex-col gap-4 p-8" role="status">
        <h2 className="display-3">Message sent.</h2>
        <p className="text-lg">We&apos;ve emailed a copy to <strong>{status.email}</strong> and we&apos;ll reply there.</p>
        <p className="text-muted">If you don&apos;t see our email, check your spam folder.</p>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="card relative flex flex-col gap-5 p-6 md:p-8">
      <Field label="Your name" name="name" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} error={errors.name} required />
      <div className="grid gap-5 sm:grid-cols-2">
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
          optional
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
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="field-label mb-2">What is it about?</legend>
        <div className="flex flex-wrap gap-2">
          {ENQUIRY_TOPICS.map((t) => (
            <label key={t} className={`chip cursor-pointer select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bronze ${topic === t ? "!border-bronze !bg-tint font-semibold" : ""}`}>
              <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <TextArea label="Message" name="message" rows={5} value={message} onChange={(e) => { setMessage(e.target.value); clearError("message"); }} error={errors.message} required placeholder="Tell us who the gifts are for, how many, and when you need them." />
      <Honeypot value={website} onChange={setWebsite} />

      {status.kind === "problem" && <EnquiryProblem status={status} />}

      <button type="submit" className="btn btn-primary self-start" disabled={sending}>
        <MailIcon className="size-5" /> {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function EnquiryProblem({ status }: { status: Extract<Status, { kind: "problem" }> }) {
  const wa = whatsappLink(status.text);
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Enquiry")}&body=${encodeURIComponent(status.text)}`;
  const message = {
    "email-unavailable": "Sending from this form isn't available right now.",
    failed: "We couldn't send your message just now.",
    busy: "Too many attempts from this connection. Please wait a few minutes.",
  }[status.reason];
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-md border border-alert/30 bg-alert-bg p-4 text-[0.97rem]">
      <p className="font-semibold text-alert">{message}</p>
      <p>Your message is ready to send another way:</p>
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
