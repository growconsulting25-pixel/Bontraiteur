import type { Metadata } from "next";
import { createElement } from "react";
import { site } from "@/data/site";
import { getDictionary, href, ogLocale, routes, type Locale, type RouteKey } from "@/i18n";
import type { Meal, MealCategory } from "@/lib/types";

type MetaKey = Exclude<keyof ReturnType<typeof getDictionary>["meta"], "siteTitle" | "siteDescription" | "serviceType" | "audienceType">;

/**
 * Interrupteur d'indexation. Tant que SITE_INDEXABLE n'est pas « true » (variable Netlify),
 * le site demande aux moteurs de NE PAS l'indexer (robots.txt + balise noindex).
 * Les aperçus Netlify (deploy previews, branches) ne sont jamais indexés.
 */
export const isIndexable = () => process.env.SITE_INDEXABLE === "true" && (!process.env.CONTEXT || process.env.CONTEXT === "production");

export const ogImage = { url: "/og-bon-traiteur.jpg", width: 1200, height: 630, alt: "Bon Traiteur — traiteur pour CPE et garderies" };

/** Mots-clés principaux (focus) et secondaires de chaque page — voir docs/SEO.md. */
export const pageKeywords: Record<MetaKey, Record<Locale, string[]>> = {
  home: {
    fr: ["Bon Traiteur", "traiteur garderie Montréal", "traiteur CPE", "repas pour garderie", "service de repas garderie"],
    en: ["Bon Traiteur", "daycare caterer Montreal", "CPE caterer", "daycare meals", "daycare meal service"],
  },
  menu: {
    fr: ["menu garderie", "menu CPE", "menu pour enfants garderie", "repas garderie allergènes"],
    en: ["daycare menu", "CPE menu", "children's daycare menu", "daycare meals allergens"],
  },
  meals: {
    fr: ["repas pour garderie", "repas congelés garderie", "repas chauds garderie", "livraison repas garderie"],
    en: ["daycare meals", "frozen meals daycare", "hot meals daycare", "daycare meal delivery"],
  },
  daycares: {
    fr: ["service de repas CPE", "traiteur garderie privée", "traiteur garderie subventionnée", "repas service de garde"],
    en: ["CPE meal service", "private daycare caterer", "subsidized daycare caterer", "childcare meal service"],
  },
  howItWorks: {
    fr: ["commande repas garderie", "menu mensuel garderie", "traiteur garderie fonctionnement"],
    en: ["order daycare meals", "monthly daycare menu", "how daycare catering works"],
  },
  about: {
    fr: ["Bon Traiteur", "à propos Bon Traiteur", "traiteur pour enfants Montréal"],
    en: ["Bon Traiteur", "about Bon Traiteur", "children's caterer Montreal"],
  },
  faq: {
    fr: ["questions traiteur garderie", "allergies repas garderie", "livraison urgente repas garderie"],
    en: ["daycare caterer questions", "daycare meal allergies", "urgent daycare meal delivery"],
  },
  contact: {
    fr: ["Bon Traiteur téléphone", "contact Bon Traiteur", "traiteur garderie Montréal"],
    en: ["Bon Traiteur phone", "contact Bon Traiteur", "daycare caterer Montreal"],
  },
  quote: {
    fr: ["soumission traiteur garderie", "prix repas garderie", "soumission repas CPE"],
    en: ["daycare caterer quote", "daycare meal prices", "CPE meal quote"],
  },
  login: { fr: [], en: [] },
};

/**
 * Métadonnées d'une page : titre, description, mots-clés, canonical, hreflang,
 * Open Graph et consigne d'indexation.
 */
export function pageMetadata(key: RouteKey & MetaKey, locale: Locale, { absoluteTitle = false } = {}): Metadata {
  const meta = getDictionary(locale).meta[key];
  const path = routes[key][locale];
  const absolute = absoluteTitle || meta.title.includes(site.name);
  const noIndex = !isIndexable() || key === "login";
  return {
    title: absolute ? { absolute: meta.title } : meta.title,
    description: meta.description,
    keywords: pageKeywords[key][locale],
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
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images: [ogImage.url] },
    robots: noIndex ? { index: false, follow: isIndexable() } : { index: true, follow: true, "max-image-preview": "large" },
  };
}

const lang = (locale: Locale) => (locale === "fr" ? "fr-CA" : "en-CA");
const abs = (path: string) => `${site.url}${path === "/" ? "" : path}`;

/**
 * Entreprise (marque). Informations vérifiables seulement : aucune adresse civique,
 * aucune note inventée. `alternateName` relie les fautes courantes au nom.
 */
export function organizationSchema(locale: Locale) {
  const t = getDictionary(locale).meta;
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${site.url}/#organisation`,
    name: site.name,
    alternateName: site.alternateNames,
    url: site.url,
    logo: `${site.url}/icon.svg`,
    image: `${site.url}${ogImage.url}`,
    description: t.siteDescription,
    slogan: locale === "fr" ? "Des repas qui plaisent aux enfants. Un service qui simplifie vos journées." : "Meals kids love. A service that simplifies your days.",
    telephone: site.contact.phones[0].href.replace("tel:", ""),
    email: site.contact.email,
    contactPoint: site.contact.phones.map((p) => ({
      "@type": "ContactPoint",
      telephone: p.href.replace("tel:", ""),
      contactType: "customer service",
      areaServed: "CA-QC",
      availableLanguage: ["French", "English"],
    })),
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: site.hours.days, opens: site.hours.opens, closes: site.hours.closes }],
    areaServed: { "@type": "AdministrativeArea", name: `${site.areaServed}, Québec, Canada` },
    knowsAbout: locale === "fr" ? ["repas pour garderies", "traiteur pour CPE", "menus pour enfants", "livraison de repas"] : ["daycare meals", "CPE catering", "children's menus", "meal delivery"],
    knowsLanguage: ["fr-CA", "en-CA"],
    ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
  };
}

/** Site web : son nom (et ses variantes) est ce que Google affiche comme « nom du site ». */
export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#site`,
    name: site.name,
    alternateName: site.alternateNames,
    url: abs(href("home", locale)),
    inLanguage: lang(locale),
    publisher: { "@id": `${site.url}/#organisation` },
  };
}

/** Fil d'Ariane (Accueil › Page). */
export function breadcrumbSchema(key: RouteKey & MetaKey, locale: Locale) {
  const d = getDictionary(locale);
  const label = d.nav.items.find((i) => i.key === key)?.label ?? d.meta[key].title.split(" | ")[0];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: site.name, item: abs(href("home", locale)) },
      { "@type": "ListItem", position: 2, name: label, item: abs(href(key, locale)) },
    ],
  };
}

export function serviceSchema(key: "meals" | "daycares", locale: Locale) {
  const d = getDictionary(locale);
  const t = d.meta;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t[key].title,
    description: t[key].description,
    url: abs(routes[key][locale]),
    serviceType: t.serviceType,
    provider: { "@id": `${site.url}/#organisation` },
    areaServed: { "@type": "AdministrativeArea", name: `${site.areaServed}, Québec, Canada` },
    audience: { "@type": "Audience", audienceType: t.audienceType },
    inLanguage: lang(locale),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: d.home.formulas.title.replace(/\*/g, ""),
      itemListElement: d.formats.map((f) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: f.title, description: f.summary } })),
    },
  };
}

/** Menu complet (catégories et plats) — lisible par les moteurs et les IA. */
export function menuSchema(meals: Meal[], locale: Locale, order: Array<"tous" | MealCategory>) {
  const d = getDictionary(locale);
  const name = (m: Meal) => (locale === "en" ? m.nameEn : m.name);
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: d.meta.menu.title,
    url: abs(routes.menu[locale]),
    inLanguage: lang(locale),
    provider: { "@id": `${site.url}/#organisation` },
    hasMenuSection: order
      .filter((c): c is MealCategory => c !== "tous")
      .map((c) => ({
        "@type": "MenuSection",
        name: d.menu.categories[c],
        hasMenuItem: meals.filter((m) => m.category === c).map((m) => ({ "@type": "MenuItem", name: name(m) })),
      }))
      .filter((s) => s.hasMenuItem.length),
  };
}

/** Étapes du service (comment ça fonctionne). */
export function howToSchema(locale: Locale) {
  const d = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: d.meta.howItWorks.title,
    description: d.meta.howItWorks.description,
    inLanguage: lang(locale),
    step: d.howPage.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
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
