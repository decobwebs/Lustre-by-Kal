import { site } from "@/content/site";

export const SEASONAL_OCCASIONS = ["Birthday", "Valentine's Day", "Christmas", "Eid", "Ramadan", "Something else"] as const;
export type SeasonalOccasion = (typeof SEASONAL_OCCASIONS)[number];

export type SeasonalRequest = { occasion: SeasonalOccasion; requirements: string; budget: string };

/** The WhatsApp/email message a seasonal request composes to — occasion is the only required part. */
export function seasonalRequestText({ occasion, requirements, budget }: SeasonalRequest) {
  return [
    `Hello ${site.name}, I'd like a seasonal gift box.`,
    "",
    `Occasion: ${occasion}`,
    ...(requirements.trim() ? [`What I have in mind: ${requirements.trim()}`] : []),
    ...(budget.trim() ? [`Budget: ${budget.trim()}`] : []),
  ].join("\n");
}
