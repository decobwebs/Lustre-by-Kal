/**
 * Light protection for the two form endpoints: a per-address rate limit,
 * a hidden field bots fill in, and a minimum time to fill the form.
 *
 * The rate limit lives in memory, so on serverless hosting it applies per
 * instance. That is enough to stop a stuck script; it is not a firewall.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

export function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function allowRequest(address: string, now = Date.now()) {
  const recent = (hits.get(address) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(address, recent);
    return false;
  }
  recent.push(now);
  hits.set(address, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  }
  return true;
}

/** True when the submission looks automated: honeypot filled, or sent within 3 seconds of opening the page. */
export function looksAutomated(body: { website?: unknown; startedAt?: unknown }, now = Date.now()) {
  if (typeof body.website === "string" && body.website.trim() !== "") return true;
  if (typeof body.startedAt === "number" && now - body.startedAt < 3000) return true;
  return false;
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

/** Reads a JSON body up to ~32 KB; anything larger or malformed is rejected. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 32_000) return null;
  try {
    const text = await request.text();
    if (text.length > 32_000) return null;
    const data = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
