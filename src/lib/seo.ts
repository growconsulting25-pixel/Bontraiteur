import type { Metadata } from "next";
import { createElement } from "react";
import { site } from "@/data/site";
import type { FaqItem } from "@/data/faq";

/** Métadonnées d'une page, avec canonical et Open Graph cohérents. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | Bon Traiteur`, description, url: path },
  };
}

/**
 * Données structurées. N'inclut que des informations vérifiables :
 * téléphone / adresse seront ajoutés quand les vraies valeurs seront fournies.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${site.url}/#organisation`,
    name: site.name,
    url: site.url,
    description: site.description,
    areaServed: { "@type": "AdministrativeArea", name: "Québec" },
    knowsLanguage: "fr-CA",
  };
}

export function serviceSchema({ name, description, path }: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${site.url}${path}`,
    serviceType: "Service de repas pour milieux de garde",
    provider: { "@id": `${site.url}/#organisation` },
    areaServed: { "@type": "AdministrativeArea", name: "Québec" },
    audience: { "@type": "Audience", audienceType: "CPE, garderies et services de garde" },
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items
      .filter((item) => !item.answer.includes("[À confirmer"))
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
