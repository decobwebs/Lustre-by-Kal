"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Honeypot } from "@/components/Field";
import { site } from "@/content/site";
import { checkEmail, suggestEmail } from "@/lib/validate";

type Status =
  | { kind: "editing"; error?: string }
  | { kind: "sending" }
  | { kind: "sent"; code: string }
  | { kind: "problem"; code: string };

const ENTER_DELAY = 900;
const EXIT_DURATION = 320;

/**
 * The welcome-offer popup. Shows on every homepage visit — deliberately not
 * suppressed by localStorage, per instruction — so it always has somewhere
 * to animate in from and out to rather than just appearing. Closes only via
 * the × (or "Got it" after signing up) — not the backdrop, not Escape — also
 * per instruction.
 */
export function PromoModal() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>({ kind: "editing" });
  const [startedAt] = useState(() => Date.now());
  const closeTimer = useRef<number | undefined>(undefined);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const show = window.setTimeout(() => {
      setMounted(true);
      // Mount closed, then flip open a frame later so the CSS transition actually runs.
      requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    }, ENTER_DELAY);
    return () => window.clearTimeout(show);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mounted && open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted, open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => emailRef.current?.focus());
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function close() {
    setOpen(false);
    closeTimer.current = window.setTimeout(() => setMounted(false), EXIT_DURATION);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const checked = checkEmail(email);
    if (!checked.ok) {
      setStatus({ kind: "editing", error: checked.message });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: checked.value, website, startedAt }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data.fields?.email) {
        setStatus({ kind: "editing", error: data.fields.email });
        return;
      }
      // The code is fixed, so it's worth showing even if the email behind it had trouble.
      const code = data.code ?? site.firstOrderOffer.code;
      setStatus(res.ok && data.ok ? { kind: "sent", code } : { kind: "problem", code });
    } catch {
      setStatus({ kind: "problem", code: site.firstOrderOffer.code });
    }
  }

  if (!mounted) return null;

  const suggestion = status.kind === "editing" && checkEmail(email).ok ? suggestEmail(email) : null;

  return (
    // Deliberately closes only from the × (or "Got it") — not the backdrop, not Escape.
    <div className={`promo-overlay ${open ? "is-open" : ""}`}>
      <div role="dialog" aria-modal="true" aria-labelledby="promo-heading" className="promo-panel">
        <button type="button" onClick={close} aria-label="Close" className="promo-close">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {status.kind === "sent" || status.kind === "problem" ? (
          <div className="flex flex-col items-start gap-4">
            <p className="eyebrow">{status.kind === "sent" ? "You're in" : "Here's your code"}</p>
            <h2 className="display-3">
              {status.kind === "sent" ? "Check your email." : "Save this, just in case."}
            </h2>
            <p className="price text-3xl tracking-wide">{status.code}</p>
            <p className="text-[0.97rem] text-muted">
              {status.kind === "sent"
                ? "We've also emailed it to you. Mention it when you send your order and we'll take it off your total."
                : "We couldn't confirm the email went out, but your code still works — mention it when you send your order."}
            </p>
            <button type="button" onClick={close} className="btn btn-primary">
              Got it
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 pr-6">
              <p className="eyebrow">First order</p>
              <h2 id="promo-heading" className="promo-heading">
                Get {site.firstOrderOffer.percent}% off your first order
              </h2>
              <p className="text-[0.97rem] text-muted">And be the first to hear about our new product drops!</p>
            </div>

            <div className="field">
              <label htmlFor="promo-email" className="sr-only">
                Email
              </label>
              <input
                ref={emailRef}
                id="promo-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status.kind === "editing" && status.error) setStatus({ kind: "editing" });
                }}
                aria-invalid={status.kind === "editing" && !!status.error}
              />
              {status.kind === "editing" && status.error && <p className="field-error">{status.error}</p>}
              {suggestion && (
                <p className="field-hint">
                  Did you mean <strong>{suggestion}</strong>?{" "}
                  <button type="button" className="link" onClick={() => setEmail(suggestion)}>
                    Use this
                  </button>
                </p>
              )}
            </div>
            <Honeypot value={website} onChange={setWebsite} />

            <button type="submit" className="btn btn-primary btn-block" disabled={status.kind === "sending"}>
              {status.kind === "sending" ? "Sending…" : "Get My 5% Off"}
            </button>
            <p className="text-center text-xs text-muted">We&apos;ll email your code straight away. No spam.</p>
          </form>
        )}
      </div>
    </div>
  );
}
