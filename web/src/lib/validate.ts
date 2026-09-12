/**
 * Field checks shared by the browser (as the customer types) and the server
 * (before anything is sent). A single wrong character in an email or phone
 * number makes an enquiry impossible to answer, so both are checked strictly.
 */

export type FieldResult = { ok: true; value: string } | { ok: false; message: string };

const ok = (value: string): FieldResult => ({ ok: true, value });
const fail = (message: string): FieldResult => ({ ok: false, message });

export function checkName(raw: string): FieldResult {
  const value = raw.trim().replace(/\s+/g, " ");
  if (!value) return fail("Please enter your name.");
  if (value.length < 2) return fail("That name looks too short.");
  if (value.length > 80) return fail("Please keep your name under 80 characters.");
  return ok(value);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function checkEmail(raw: string): FieldResult {
  const value = raw.trim().toLowerCase();
  if (!value) return fail("Please enter your email address.");
  if (!EMAIL.test(value) || value.length > 120) return fail("That doesn't look like an email address. Check for a missing @ or dot.");
  return ok(value);
}

const COMMON_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "ymail.com", "live.com"];

function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** "amaka@gmial.com" → "amaka@gmail.com", or null when nothing looks wrong. */
export function suggestEmail(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1) return null;
  const domain = value.slice(at + 1);
  if (!domain || COMMON_DOMAINS.includes(domain)) return null;
  const fixedTld = domain.replace(/\.(con|cmo|cm|comm|om)$/, ".com");
  let best: string | null = null;
  let bestScore = 3;
  for (const candidate of COMMON_DOMAINS) {
    const score = distance(fixedTld, candidate);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  if (best && best !== domain) return `${value.slice(0, at)}@${best}`;
  if (fixedTld !== domain) return `${value.slice(0, at)}@${fixedTld}`;
  return null;
}

/**
 * Nigerian numbers in any common format become +234XXXXXXXXXX.
 * Other international numbers are accepted when written with a leading +.
 */
export function checkPhone(raw: string): FieldResult {
  const trimmed = raw.trim();
  if (!trimmed) return fail("Please enter a phone number we can reach you on.");
  if (/[^\d\s()+\-.]/.test(trimmed)) return fail("Use digits only, for example 0803 123 4567.");
  const digits = trimmed.replace(/\D/g, "");

  let national: string | null = null;
  if (digits.startsWith("234")) national = digits.slice(3);
  else if (digits.startsWith("0") && !trimmed.startsWith("+")) national = digits.slice(1);

  if (national !== null) {
    if (national.length !== 10) {
      return fail(`Nigerian numbers have 11 digits starting with 0, for example 0803 123 4567. This one has ${national.length + 1}.`);
    }
    if (!/^[789]/.test(national)) return fail("Nigerian mobile numbers start with 070, 080, 081, 090 or 091.");
    return ok(`+234${national}`);
  }

  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) return ok(`+${digits}`);
  return fail("Please include the full number, for example 0803 123 4567 or +234 803 123 4567.");
}

export function checkText(raw: string, { label, required = false, max = 1000 }: { label: string; required?: boolean; max?: number }): FieldResult {
  const value = raw.trim();
  if (!value) return required ? fail(`Please add ${label}.`) : ok("");
  if (value.length > max) return fail(`Please keep ${label} under ${max} characters.`);
  return ok(value);
}

/** Optional YYYY-MM-DD, not in the past. */
export function checkDate(raw: string, today = new Date()): FieldResult {
  const value = raw.trim();
  if (!value) return ok("");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) return fail("Please choose a date.");
  const todayIso = today.toISOString().slice(0, 10);
  if (value < todayIso) return fail("That date has already passed.");
  return ok(value);
}

/** Days from today until an ISO date (0 = today). */
export function daysUntil(iso: string, today = new Date()) {
  const start = Date.parse(today.toISOString().slice(0, 10));
  return Math.round((Date.parse(iso) - start) / 86_400_000);
}
