# Lustre by Kal — website

The hamper catalogue and ordering site for Lustre by Kal, built to the website plan of 27 August 2026 and the hamper plan of 11 September 2026.

Customers browse three hampers with prices, build an order list, and send it to Kal by **WhatsApp** or **email**. Each order carries a reference (`LBK-0911-4821`). Kal confirms and invoices by email; nothing is paid on the site. The site can be added to a phone's home screen.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Resend for email. No database: orders reach Kal as itemised emails or WhatsApp messages and can be found by reference in her inbox.

## Getting started

```bash
cp .env.example .env.local   # fill in what you have
npm install
npm run dev                  # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` · `npm run typecheck` | Code checks |
| `npm run og` | Rebuilds the link-preview images in `public/og/` (needs Chrome or Edge) |
| `npm run check:launch` | Lists what's missing before go-live; exits 1 if ordering would break |

## Where things live

| To change… | Edit |
| --- | --- |
| Hamper names, prices, contents, references | `src/content/catalogue.ts` |
| Add-ons (air fryer etc.) and their prices | `src/content/catalogue.ts` → `addOns` (no `price` = “Price on request”) |
| Phone, email, socials, delivery wording | Environment variables (see `.env.example`) and `src/content/site.ts` |
| Questions and answers | `src/components/sections.tsx` → `FAQ` |
| Colours and type | `src/app/globals.css` → `@theme` |
| Logo | `src/components/Logo.tsx` (generated from Kal's vector file) |

### Adding photos of the packed hampers

1. Save each photo as `src/assets/hampers/radiant-lux.jpg` (and `grace-lux`, `bloom-lux`), landscape, at least 1600px wide.
2. In `catalogue.ts`, import it and set `image` on the hamper:
   ```ts
   import radiantPhoto from "@/assets/hampers/radiant-lux.jpg";
   // …
   image: radiantPhoto,
   ```
   Cards and hamper pages switch from the product mosaic to the photo automatically.
3. Update `scripts/og/build-og.mjs` to use it, then run `npm run og`.

## How orders flow

1. The order list is kept in the browser (`localStorage`) until it's sent.
2. **WhatsApp:** the browser opens `wa.me/<number>` with the itemised order written out; the customer presses send.
3. **Email:** `POST /api/order` re-checks every field and recalculates prices from the catalogue (the browser's numbers are never trusted), emails the order to `ORDERS_INBOX` with reply-to set to the customer, and sends the customer an acknowledgement.
4. If email isn't configured or fails, the customer is told plainly and offered WhatsApp or their own email app with the order pre-written. The form never claims success without sending.

`POST /api/enquiry` does the same for the contact form. Both endpoints have a hidden bot field, a minimum fill time and a per-address rate limit.

## Going live

1. Register `lustrebykal.com` and create the `admin@` mailbox.
2. Create a [Resend](https://resend.com) account, verify the domain, and create an API key.
3. Deploy (Vercel works with no extra config) and set the environment variables from `.env.example`.
4. Run `npm run check:launch` against the production env until it passes.
5. Send a test order both ways and confirm the email and WhatsApp message arrive itemised.

## Tests

Two scripts drive a real browser (Python 3 with `pip install playwright`, using the installed Edge or Chrome). Start the site first.

```bash
# 1. Full order flow, with email delivery faked locally
node tests/mock-email-server.mjs tests/output/emails.jsonl &
RESEND_API_KEY=test EMAIL_FROM="Lustre by Kal <orders@lustrebykal.com>" \
  RESEND_API_URL=http://localhost:3999/emails npx next start -p 3100
npm run test:flow          # adds hampers, checks totals, typo help, both send routes, the emails sent

# 2. Launch state: no WhatsApp number configured, home-screen install, offline pages
npm start -- -p 3100
npm run test:launch-state

# 3. Motion: rotating hamper photos, scrolling strip, reveals, reduced-motion
npm run test:motion
```

Screenshots and captured emails land in `tests/output/`. Both browser tests take
`WHATSAPP=<number>` to match the number the site was built with.

## The price ladder

The three cards are dressed differently so the price is legible before anyone
reads a number. The level comes from `hamperLevel()` in `catalogue.ts`, which
ranks hampers by price — reprice or add one and the cards re-rank themselves.

| Level | Card | Also |
| --- | --- | --- |
| `premium` (dearest) | Dark espresso, gold foil top edge, gilt inner rule, "Top tier" crest with the logo sparkle, largest name and price, gold buttons | Ivory photo mats, sits slightly proud on wide screens; gilt badge on its hamper page |
| `middle` | Warm cream gradient, bronze top edge and faint inner rule | Cream photo mats |
| `entry` (cheapest) | Plain white, hairline edge | White mats |

Styles live under “Hamper cards” in `globals.css`, keyed off `data-level`.

## Motion

| Effect | Where | Stops when |
| --- | --- | --- |
| Hamper photos crossfade through all ten of that hamper's items | Hamper cards | Hovered, focused, tab hidden, reduced motion |
| Product strip drifts sideways | Home, “What goes inside” | Hovered or focused, reduced motion |
| Blocks ease in as you reach them | Hamper cards, ordering steps | Reduced motion; anything scrolled past is shown at once |
| Slow sheen across the price panel | Home hero | Reduced motion |

The backdrop is CSS only: three soft bronze gradients and a tiled grain texture on
`body::before` / `::after`, so it costs no images and no scripting. Timings live in
`src/components/PhotoRotator.tsx`; everything else is in `globals.css`.
