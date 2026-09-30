import type { Locale } from "./config";

/**
 * Table des routes localisées. Toute URL interne passe par `href()`.
 * Les URL françaises restent à la racine (aucune redirection à gérer),
 * l'anglais vit sous /en avec des slugs anglais.
 */
export const routes = {
  home: { fr: "/", en: "/en" },
  menu: { fr: "/menu", en: "/en/menu" },
  meals: { fr: "/nos-repas", en: "/en/our-meals" },
  daycares: { fr: "/garderies", en: "/en/daycares" },
  howItWorks: { fr: "/comment-ca-fonctionne", en: "/en/how-it-works" },
  about: { fr: "/a-propos", en: "/en/about" },
  faq: { fr: "/faq", en: "/en/faq" },
  contact: { fr: "/contact", en: "/en/contact" },
  quote: { fr: "/soumission", en: "/en/quote" },
  login: { fr: "/login", en: "/en/login" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

export const href = (key: RouteKey, locale: Locale) => routes[key][locale];

/** Retrouve la clé de route d'un chemin (pour le sélecteur de langue). */
export function routeKeyFromPath(pathname: string): RouteKey | undefined {
  const clean = pathname.replace(/\/$/, "") || "/";
  return (Object.keys(routes) as RouteKey[]).find((key) => routes[key].fr === clean || routes[key].en === clean);
}

export const localeFromPath = (pathname: string): Locale => (pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr");
