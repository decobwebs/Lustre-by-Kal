import type { StaticImageData } from "next/image";

import quickTrips from "@/assets/partners/quick-trips.png";
import reliantAnchor from "@/assets/partners/reliant-anchor.png";

/**
 * Logos for the "Trusted by" strip. Kal is sending more over time — just
 * append to this list; the strip and its animation already scale to however
 * many are here, from two to twenty.
 */
export type Partner = { name: string; logo: StaticImageData };

export const partners: Partner[] = [
  { name: "Quick Trips Travels Agency", logo: quickTrips },
  { name: "Reliant Anchor Foundation", logo: reliantAnchor },
];
