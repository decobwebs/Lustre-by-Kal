import type { MetadataRoute } from "next";

import { hampers } from "@/content/catalogue";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/hampers`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...hampers.map((h) => ({ url: `${site.url}/hampers/${h.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
