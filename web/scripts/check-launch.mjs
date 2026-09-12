/**
 * Launch readiness check.
 *
 *   npm run check:launch
 *
 * Reads the same env files Next.js uses and lists what is still missing.
 * Exits with code 1 while anything that would break ordering is missing,
 * so it can run in CI before a production deploy.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const env = {};
for (const file of [".env", ".env.production", ".env.local", ".env.production.local"]) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
Object.assign(env, Object.fromEntries(Object.entries(process.env).filter(([k]) => /^(NEXT_PUBLIC_|RESEND_|EMAIL_|ORDERS_)/.test(k))));

const results = [];
const check = (level, ok, label, fix) => results.push({ level, ok, label, fix });

const wa = (env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
check("block", /^\d{10,15}$/.test(wa) && !/^2348000000000$/.test(wa), "WhatsApp number", "Set NEXT_PUBLIC_WHATSAPP_NUMBER to Kal's number, e.g. 2348012345678.");
check("block", Boolean(env.RESEND_API_KEY), "Email sending key", "Create a Resend API key and set RESEND_API_KEY.");
check("block", /<?[^@\s]+@[^@\s]+>?/.test(env.EMAIL_FROM ?? ""), "Sender address", 'Set EMAIL_FROM, e.g. "Lustre by Kal <orders@lustrebykal.com>" (domain verified in Resend).');
check("block", /^https:\/\//.test(env.NEXT_PUBLIC_SITE_URL ?? ""), "Site address", "Set NEXT_PUBLIC_SITE_URL to https://lustrebykal.com (or the live address).");

const inbox = env.ORDERS_INBOX || env.NEXT_PUBLIC_CONTACT_EMAIL || "admin@lustrebykal.com";
check("warn", Boolean(env.ORDERS_INBOX || env.NEXT_PUBLIC_CONTACT_EMAIL), `Orders inbox (${inbox})`, "Confirm this mailbox exists and is read daily, or set ORDERS_INBOX.");

const socials = ["NEXT_PUBLIC_INSTAGRAM", "NEXT_PUBLIC_FACEBOOK", "NEXT_PUBLIC_TIKTOK"].filter((k) => env[k]);
check("warn", socials.length > 0, "Social media handles", "Set NEXT_PUBLIC_INSTAGRAM / _FACEBOOK / _TIKTOK (handles, not links). Hidden until set.");

const catalogue = readFileSync(join(root, "src/content/catalogue.ts"), "utf8");
const hamperPhotos = (catalogue.match(/^\s{4}image:/gm) ?? []).length;
check("warn", hamperPhotos >= 3, `Photos of packed hampers (${hamperPhotos} of 3)`, "Add Kal's photos to src/assets/hampers/ and set `image` on each hamper in catalogue.ts.");

const og = ["default", "radiant-lux", "grace-lux", "bloom-lux"].filter((f) => !existsSync(join(root, "public/og", `${f}.png`)));
check("warn", og.length === 0, "Link-preview images", `Run npm run og (missing: ${og.join(", ")}).`);

let blocking = 0;
console.log("\nLustre by Kal · launch check\n");
for (const r of results) {
  const mark = r.ok ? "✓" : r.level === "block" ? "✗" : "!";
  console.log(`  ${mark} ${r.label}`);
  if (!r.ok) console.log(`      ${r.fix}`);
  if (!r.ok && r.level === "block") blocking++;
}
console.log(blocking ? `\n${blocking} item(s) must be fixed before launch.\n` : "\nReady for launch.\n");
process.exit(blocking ? 1 : 0);
