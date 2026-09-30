import type { Metadata } from "next";
import { createElement } from "react";
import { site } from "@/data/site";
import { getDictionary, ogLocale, routes, type Locale, type RouteKey } from "@/i18n";

type MetaKey = Exclude<keyof ReturnType<typeof getDictionary>["meta"], "siteTitle" | "siteDescription" | "serviceType" | "audienceType">;

/**
 * Métadonnées d'une page : titre, description, canonical et liens hreflang
 * vers la version dans l'autre langue.
 */
export function pageMetadata(key: RouteKey & MetaKey, locale: Locale, { absoluteTitle = false } = {}): Metadata {
  const meta = getDictionary(locale).meta[key];
  const path = routes[key][locale];
  return {
    title: absoluteTitle ? { absolute: meta.title } : meta.title,
    description: meta.description,
    alternates: {
      canonical: path,
      languages: { "fr-CA": routes[key].fr, "en-CA": routes[key].en, "x-default": routes[key].fr },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: ogLocale[locale],
      title: meta.title,
      description: meta.description,
      url: path,
    },
  };
}

/**
 * Données structurées. N'inclut que des informations vérifiables
 * (aucune adresse civique publiée pour l'instant).
 */
export function organizationSchema(locale: Locale) {
  const t = getDictionary(locale).meta;
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${site.url}/#organisation`,
    name: site.name,
    url: site.url,
    description: t.siteDescription,
    telephone: site.contact.phones.map((p) => p.href.replace("tel:", "")),
    areaServed: { "@type": "AdministrativeArea", name: "Québec" },
    knowsLanguage: ["fr-CA", "en-CA"],
  };
}

export function serviceSchema(key: "meals" | "daycares", locale: Locale) {
  const t = getDictionary(locale).meta;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t[key].title,
    description: t[key].description,
    url: `${site.url}${routes[key][locale]}`,
    serviceType: t.serviceType,
    provider: { "@id": `${site.url}/#organisation` },
    areaServed: { "@type": "AdministrativeArea", name: "Québec" },
    audience: { "@type": "Audience", audienceType: t.audienceType },
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items
      .filter((item) => !/\[(À confirmer|To be confirmed)/.test(item.answer))
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  });
}
