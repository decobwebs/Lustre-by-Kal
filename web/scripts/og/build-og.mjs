/**
 * Builds the link-preview images in public/og/ (shown when a page is shared on WhatsApp, etc.).
 *
 *   npm run og
 *
 * Uses a locally installed Chrome or Edge in headless mode. Set BROWSER_PATH if it isn't found.
 * Re-run after changing a hamper's name, price or photos.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const products = join(root, "src/assets/products");
const outDir = join(root, "public/og");
const tmpDir = join(here, ".tmp");

const candidates = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("No Chrome or Edge found. Set BROWSER_PATH to a Chromium-based browser.");
  process.exit(1);
}

const logoSource = readFileSync(join(root, "src/components/Logo.tsx"), "utf8");
const lockupMatch = logoSource.match(/export function Lockup[\s\S]*?(<svg[\s\S]*?<\/svg>)/);
const logo = lockupMatch[1]
  .replace(/\s(className|role|aria-label|aria-hidden)=\{[^}]*\}/g, "")
  .replace(/fillRule=/g, "fill-rule=");

const img = (name) => pathToFileURL(join(products, `${name}.jpg`)).href;

const cards = [
  {
    file: "default",
    eyebrow: "Gift hampers · Nigeria",
    title: "Say thank you,<br>properly.",
    size: 84,
    meta: "Three hampers from <b>₦160,000</b><br>Delivered nationwide in 2–5 days",
    images: ["candle-set-aroma-home", "wine-nederburg", "massage-gun"],
  },
  {
    file: "radiant-lux",
    eyebrow: "Premium hamper",
    title: "Radiant Lux",
    size: 96,
    meta: "<b>₦360,000</b> per hamper<br>For management, clients and partners",
    images: ["wine-nederburg", "massage-gun", "candle-set-aroma-home"],
  },
  {
    file: "grace-lux",
    eyebrow: "Mid-tier hamper",
    title: "Grace Lux",
    size: 96,
    meta: "<b>₦260,000</b> per hamper<br>For general staff appreciation",
    images: ["juice-chamdor", "kettle", "hair-clipper"],
  },
  {
    file: "bloom-lux",
    eyebrow: "Affordable hamper",
    title: "Bloom Lux",
    size: 96,
    meta: "<b>₦160,000</b> per hamper<br>For customers, partners and suppliers",
    images: ["candle-set-aroma-home", "kettle", "tea-bigelow"],
  },
];

const template = readFileSync(join(here, "template.html"), "utf8");
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

for (const card of cards) {
  const html = template
    .replace("{{LOGO}}", logo)
    .replace("{{EYEBROW}}", card.eyebrow)
    .replace("{{TITLE}}", card.title)
    .replace("{{TITLE_SIZE}}", String(card.size))
    .replace("{{META}}", card.meta)
    .replace("{{IMG1}}", img(card.images[0]))
    .replace("{{IMG2}}", img(card.images[1]))
    .replace("{{IMG3}}", img(card.images[2]));
  const page = join(tmpDir, `${card.file}.html`);
  writeFileSync(page, html);
  const target = join(outDir, `${card.file}.png`);
  execFileSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1200,630",
      "--virtual-time-budget=6000",
      "--allow-file-access-from-files",
      `--screenshot=${target}`,
      pathToFileURL(page).href,
    ],
    { stdio: "ignore" },
  );
  console.log(`og/${card.file}.png`);
}

rmSync(tmpDir, { recursive: true, force: true });
