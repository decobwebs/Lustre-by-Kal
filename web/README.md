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

## Order lookup — `/admin`

There is no order database. An order's own message — the WhatsApp text or the
email — already lists every reference and quantity, so `/admin` just re-parses
whatever you paste against the catalogue that is already in the site: full
hamper contents, photos, and the total. Nothing is stored or sent anywhere.

Paste the whole message, or just the short form (`LBK-GL01:12, LBK-RL01x2`) if
that's all you have. The page is excluded from search engines and has no link
in the navigation, but it is **not password-protected** — anyone with the
`/admin` URL can open it. That's fine for reading back an order (nothing
secret is shown beyond what the customer already sent), but don't put anything
more sensitive on this page without adding a login first.

## Site lock (currently ON)

Until the site is meant to be public, `src/proxy.ts` makes the deployed site
answer **404 to every address**: pages, `/api/*`, images, the sitemap, everything.
The 404 is a plain, unbranded page, never cached, and marked noindex.

**To lift it:** in `src/proxy.ts` change `const SITE_LOCKED = true;` to `false`,
commit and push. Nothing else needs to change.

`npm run dev` is never locked. A production build (`npm run build && npm start`,
which is what the host runs) is locked unless started with `SITE_UNLOCK=1` —
that switch exists so the browser tests below can run against a production build.

## "Trusted by" logo strip

A second, fuller instance of the same marquee pattern as the product strip —
right after the hero on the home page. Logos live in `content/partners.ts`;
Kal is sending more over time, so **just append to that list** — the strip
pads itself out to a minimum size and re-derives the seamless loop
automatically, whether there are 2 partners or 20.

Grayscale at rest, full colour on hover, pauses on hover/focus, still visible
(just not animating) under `prefers-reduced-motion` — same rules as every
other moving thing on this site.

## The welcome-offer popup

Shows on **every homepage visit** — deliberately not suppressed by
`localStorage`, per instruction — and closes **only** via its own × (or
"Got it" after signing up), not the backdrop and not Escape; also per
instruction. Lives in `src/components/PromoModal.tsx`, rendered only on `/`.

There's no checkout to apply a discount to, so the code (`site.firstOrderOffer`
in `content/site.ts`, currently `WELCOME5` for 5%) is fixed and honoured
manually, the same way every hamper order already gets confirmed and invoiced
by hand. `POST /api/subscribe` validates the email, emails Kal a notice
(reply-to the subscriber) and emails the subscriber their code — and shows the
code on screen regardless, so a slow or failed email never leaves someone
without it. Same bot protections as the other two endpoints.

## Seasonal gifting (`#seasonal`, on `/` and `/hampers`)

A lighter offer alongside the three fixed hampers: a self-curated gift box for
a personal occasion (birthday, Valentine's, Christmas, Eid, Ramadan), under
₦100,000, with no fixed price or contents list — it's built around a real
conversation, not a catalogue entry.

`SeasonalGiftSection` (`src/components/SeasonalGiftSection.tsx`) lets a visitor
pick an occasion, optionally add a budget and a line about what they have in
mind, and composes that straight into a WhatsApp message (or a `mailto:` if
they'd rather email, which is always offered regardless of whether WhatsApp is
configured). Nothing is validated or sent to a server — it's the same
message-composing pattern as `askText()`, just for a different kind of ask.
Occasions and the message template live in `src/lib/seasonal.ts`.

## The seasonal gift-box video

A short, silent, looping video sits under the seasonal photo (`#seasonal`):
the real "Season's Greetings" gift box turning to show its gold foil detail,
re-encoded from a clip management sent (colour-corrected the same way as the
still photo, remuxed/re-encoded for the web, both MP4 and a smaller WebM, plus
a poster frame — all in `public/videos/seasonal/`).

It autoplays muted and loops, with an explicit `video.play()` nudge on mount
rather than relying on the `autoplay` attribute alone — that attribute isn't
reliably honoured in every mobile and in-app browser (Instagram's and
WhatsApp's in particular, which matters since that's exactly where customers
click through from). `prefers-reduced-motion` still wins: the video pauses
and hands the visitor native controls instead of looping on its own.

Two other videos management sent were **held out deliberately**: both carry
an Instagram "credit" overlay naming a different person, which Instagram only
adds when content is reposted from someone else's account or uses their
original audio. Confirm the rights situation before using either on the site.

## The air fryer in Radiant Lux

Folded into Radiant Lux's own contents and photos (`src/content/catalogue.ts`)
as the item that sets it apart from Grace Lux and Bloom Lux, per direct
feedback that the ₦360,000 hamper needed a bigger, clearly differentiating
item. It's still also offered as a standalone add-on for the other two
hampers (`addOns`), unchanged.

## Going live

1. Register `lustrebykal.com` and create the `admin@` mailbox.
2. Create a [Resend](https://resend.com) account, verify the domain, and create an API key.
3. Deploy (Vercel works with no extra config) and set the environment variables from `.env.example`.
4. Run `npm run check:launch` against the production env until it passes.
5. Send a test order both ways and confirm the email and WhatsApp message arrive itemised.

## Tests

Seven scripts drive a real browser (Python 3 with `pip install playwright`, using the installed Edge or Chrome). Start the site first, with `SITE_UNLOCK=1` so the site lock above doesn't answer 404.

```bash
# 1. Full order flow, with email delivery faked locally
node tests/mock-email-server.mjs tests/output/emails.jsonl &
SITE_UNLOCK=1 RESEND_API_KEY=test EMAIL_FROM="Lustre by Kal <orders@lustrebykal.com>" \
  RESEND_API_URL=http://localhost:3999/emails npx next start -p 3100
npm run test:flow          # adds hampers, checks totals, typo help, both send routes, the emails sent

# 2. Launch state: no WhatsApp number configured, home-screen install, offline pages
SITE_UNLOCK=1 npm start -- -p 3100
npm run test:launch-state

# 3. Motion: rotating hamper photos, scrolling strip, reveals, reduced-motion
npm run test:motion

# 4. Seasonal gifting section: occasion chips, the composed WhatsApp/email message, nav/footer links
npm run test:seasonal

# 5. The seasonal video: autoplay/loop/mute, the mobile play() fallback, reduced-motion
npm run test:seasonal-video

# 6. The welcome-offer popup: appears every visit, closes only via ×, the code, both emails
npm run test:promo

# 7. "Trusted by" logo strip: seamless loop, hover pause, grayscale-to-colour, reduced motion
npm run test:trusted-by
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
