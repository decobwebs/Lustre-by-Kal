const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

/** ₦360,000 */
export const formatNaira = (amount: number) => `₦${naira.format(amount)}`;

/** 1 hamper / 12 hampers */
export const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** "Friday 12 December 2026" from "2026-12-12". */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
