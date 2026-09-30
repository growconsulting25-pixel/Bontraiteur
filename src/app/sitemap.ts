import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { routes, type RouteKey } from "@/i18n/routes";

const indexed: RouteKey[] = ["home", "menu", "meals", "daycares", "howItWorks", "about", "faq", "contact", "quote"];

export default function sitemap(): MetadataRoute.Sitemap {
  return indexed.flatMap((key) =>
    (["fr", "en"] as const).map((locale) => ({
      url: `${site.url}${routes[key][locale]}`,
      changeFrequency: key === "menu" ? ("monthly" as const) : ("yearly" as const),
      priority: key === "home" ? (locale === "fr" ? 1 : 0.9) : key === "menu" || key === "quote" ? 0.8 : 0.6,
      alternates: { languages: { "fr-CA": `${site.url}${routes[key].fr}`, "en-CA": `${site.url}${routes[key].en}` } },
    })),
  );
}
