# Lustre by Kal — Assets Checklist

*15 October 2026 · Companion to `docs/lustre-campaign-plan.md`. Tick each item as it's gathered.*

## Assets to gather

Each item: what it is → where it's used → format and quality → keywords → source → licence.

### 1. Footage (existing only)

- [ ] **Gold bag clip:** `WhatsApp Video 2026-10-15 at 10.44.01 AM.mp4` (graded copy in `web/public/videos/seasonal/`). Full 0–2.9s.
  - *Used in:* hero hook photo (still frame), Radiant spot, Christmas bumper
  - *Licence:* own
- [ ] **Courier bags:** `10.34.13` (0–4.5s) for the hero reveal; `10.34.26` (0–6.5s) for the Bloom spot
  - *Licence:* own
- [ ] **Unboxing detail:** `10.35.05`. In/out points chosen after frame review.
  - *Used in:* spare video message, retargeting
  - *Licence:* own
- [ ] **Website screen recording:** produced by me with Playwright, 1080×1920
  - *Used in:* the "How ordering works" film
- [ ] ~~10.37.19 / 10.41.30~~: excluded (third-party credit)

### 2. Product images and cutouts

**Chat photos (graded, not cut out):**
- [ ] Stanley tumbler (`10.41.23`)
- [ ] Embroidered towel (`10.41.21`)
- [ ] Cap in packaging (`10.41.22 (1)`)
- [ ] Star notebook and box (`10.41.22 (2)`)
- [ ] Gift tag (`10.41.23 (2)`), the peak shot
- [ ] Branded mug (`web/src/assets/products/branded-mug.jpg`)
- [ ] 2027 calendar (`10.41.21 (1)`): **crop out the bottom URL strip**

**Cutouts (background removed, PNG with transparency, 1500px or larger where the source allows):**
- [ ] Radiant: air fryer (crop the text), massage gun, wine, candle set
- [ ] Grace: kettle, hair clipper, massage gun, diffuser
- [ ] Bloom: kettle, candle set, Bigelow tea, flask

**Add-on cutout:** smart tumblers (Lustre-branded, confirmed). Use as a cutout only, because the photo doesn't show the logo.

**Excluded:** pink AI box, insulated mug set, all brand-kit mockups.

### 3. Brand files

- [ ] **Exist:** `assets/brand/lustre-logo.svg`, `lustre-lockup.svg`, `lustre-monogram.svg`, and the `Sparkle` component in `web/src/components/Logo.tsx`
- [ ] **To create (I do this):**
  - Night versions (bronze-light on #1f1812)
  - All-white versions
  - A WhatsApp-style circular avatar of the monogram, for the contact card
- [ ] **To extract (I do this):** the star garland, wreath and snowflakes from `LUSTRE BY KAL.pdf` page 5, as SVG
- [ ] **Fonts:** Marcellus, Source Sans 3, plus one script font (Google Fonts, OFL licence, free for commercial use)
- [ ] **Colours:** from `web/src/app/globals.css`

### 4. Music

- [ ] **Main track:** 100–110 BPM, at least 60s, calm intro, build, clean ending
  - *Source:* Pixabay Music
  - *Licence:* **covers paid social**
- [ ] **Softer track** for LinkedIn and how-to-order: 80–95 BPM acoustic or keys
  - *Keywords:* "warm acoustic corporate", "gentle afro guitar"

### 5. Sound effects

| SFX | Moment | Keywords |
|---|---|---|
| Message pop, 2–3 pitches (generic, **not** WhatsApp's own sound) | Every bubble | "message pop soft", "chat notification" |
| Typing ticks | Typing dots | "phone typing soft" |
| Quiet office room tone | 0–4.5s | "office ambience quiet" |
| Photo blur-up shimmer | Media arriving | "soft swish reveal", "ui shimmer" |
| Tap / expand whoosh | Media to full screen | "ui tap soft", "short whoosh" |
| Bag rustle | Courier clip | "paper bag rustle", "plastic bag handle" |
| Album tile ticks | Photo album | "ui tick light" |
| Pen on card | Name write-on | "pen writing paper close" |
| Reaction cluster | "HR, well done" | "notification burst soft" |
| Low soft impact | "Make it good." | "soft cinematic impact low" |
| Star twinkle / chime | Stars and end card | "sparkle chime soft", "twinkle subtle" |
| Soft whoosh | Tier cards rising | reuse Badella's whoosh set |

*Source:* **Pixabay Sound Effects** (free for commercial use). Save each effect's page as a screenshot.

### 6. Voiceover

- [ ] `vo_scene6.wav`, `vo_scene7.wav`, `vo_scene8.wav`, `vo_radiant.wav`, `vo_grace.wav`, `vo_bloom.wav`: 48kHz WAV
- [ ] Save the AI tool's licence page and receipt

### 7. Animated elements

- [ ] **Icons:** Phosphor (MIT): `WhatsappLogo` for the CTA pill, `Check`, `Receipt`, `Truck`
- [ ] **Emoji:** Noto Color Emoji (Google, OFL). Not Apple emoji, which are copyrighted.
- [ ] **Lottie (optional):** LottieFiles "typing indicator", "loading spinner minimal". Save the licence page.
- [ ] **Rule:** never draw people, products or objects in code. Only chat UI, text, icons, the extracted brand vectors, and the supplied photos and cutouts.

### 8. Text and captions (final wording)

**Hero chat bubbles:**
- Group name: "Office Gist 🎄"
- "Hampers have arrived at reception 👀"
- "Please let it not be the usual 🙏"
- "Remember last year's? 😂"
- "Is this a Stanley cup?! 😍"
- "Even the towel has a logo 😂🙌🏾"
- Small caption: "Your logo can go here too."
- "They wrote my NAME 😭"
- "HR, well done this year 👏🏾"
- "😌"
- "My sister's company wants this" / "Who is the vendor?" (two bubbles)
- Contact card: "Lustre by Kal"

**Tag:** "Blessing — thank you for this year"

**Hero lines:**
- "They'll talk about it."
- "Make it good."
- "From ₦160,000 · Pay by invoice"
- "Send your list on WhatsApp"
- "Delivered nationwide · 2–5 days"
- "+234 806 089 7446"
- "Order early for December" (bumpers and reminders only)
- "Dramatisation"

**Hooks:**
- "HR, who chose these hampers?"
- "Office Gist: 47 new messages 🎄"
- "December is [N] weeks away. Staff gifts sorted?" (split into two lines)

**Radiant:** "Sir, 14 hampers came today 😅" / "From [Company] — thank you" / "Be the one they open first." / "₦360,000 · Pay by invoice"

**Grace:** "Wait, no alcohol?" / "So everyone can enjoy it 🙌🏾" / "Alcohol-free. Nobody left out." / "₦260,000"

**Bloom:** "Our customer remembered us 🙏🏾" / "From [Company]" / "For the people who show up all year." / "₦160,000"

**How ordering works:** "Choose your hampers" / "Send your list" / "We confirm & invoice" / "We deliver, 2–5 days" / "You pay after we confirm."

**Branding line (tier spots and carousels):** "Their name on the card. Your logo on the gifts."

All text is in English. The same version runs on every platform.

### 9. Information to confirm
All answered. See "Answers" and "Still open" at the end of the campaign plan.

### Folder structure

```
video/assets/
  footage/        (gold bag, courier ×2, unboxing, site recording)
  images/branded/ (graded chat photos)   images/supplier/ (originals)
  cutouts/        brand/ (logos, extracted stars)   fonts/   icons/   emoji/   lottie/
  audio/music/    audio/sfx/   audio/voiceover/
  licences/       (PDF or screenshot of every licence and receipt)
```

### Who gathers what

**You and Kal:**
- AI VO generation
- Downloading the Pixabay music and SFX from my shortlist (or I fetch them)

**Me:**
- Grading, cutouts, star extraction, logo variants
- The site recording
- Chat, tier and end-card motion
- A Pixabay shortlist of music and SFX (you pick the track)
- Fonts, emoji, icons
- Captions, contact sheets, renders

**Licences:** these run as **paid ads**. Save the licence page or receipt for every paid or credited asset in `licences/`.
