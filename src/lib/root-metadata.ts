import type { Metadata, Viewport } from "next";
import { site } from "@/data/site";
import { getDictionary, ogLocale, type Locale } from "@/i18n";
import { isIndexable, ogImage } from "@/lib/seo";

export function rootMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale).meta;
  return {
    metadataBase: new URL(site.url),
    title: { default: t.siteTitle, template: "%s | Bon Traiteur" },
    description: t.siteDescription,
    applicationName: site.name,
    openGraph: { type: "website", locale: ogLocale[locale], siteName: site.name, url: site.url, images: [ogImage] },
    twitter: { card: "summary_large_image", images: [ogImage.url] },
    robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
    authors: [{ name: site.name }],
    creator: site.name,
    publisher: site.name,
    category: "food",
  };
}

export const viewport: Viewport = { themeColor: "#f7f1e7" };
