import type { Metadata, Viewport } from "next";
import { site } from "@/data/site";
import { getDictionary, ogLocale, type Locale } from "@/i18n";

export function rootMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale).meta;
  return {
    metadataBase: new URL(site.url),
    title: { default: t.siteTitle, template: "%s | Bon Traiteur" },
    description: t.siteDescription,
    applicationName: site.name,
    openGraph: { type: "website", locale: ogLocale[locale], siteName: site.name, url: site.url },
  };
}

export const viewport: Viewport = { themeColor: "#f7f1e7" };
