import type { Locale } from "./config";

/** Routes du portail client (FR : /portail/…, EN : /en/portal/…). */
export const portalRoutes = {
  home: { fr: "/portail", en: "/en/portal" },
  menu: { fr: "/portail/mon-menu", en: "/en/portal/my-menu" },
  orders: { fr: "/portail/commandes", en: "/en/portal/orders" },
  newOrder: { fr: "/portail/commandes/nouvelle", en: "/en/portal/orders/new" },
  deliveries: { fr: "/portail/livraisons", en: "/en/portal/deliveries" },
  invoices: { fr: "/portail/factures", en: "/en/portal/invoices" },
  documents: { fr: "/portail/documents", en: "/en/portal/documents" },
  support: { fr: "/portail/support", en: "/en/portal/support" },
  account: { fr: "/portail/compte", en: "/en/portal/account" },
  noAccess: { fr: "/portail/acces", en: "/en/portal/access" },
} as const satisfies Record<string, Record<Locale, string>>;

export type PortalRouteKey = keyof typeof portalRoutes;

export const portalHref = (key: PortalRouteKey, locale: Locale) => portalRoutes[key][locale];

export function portalKeyFromPath(pathname: string): PortalRouteKey | undefined {
  const clean = pathname.replace(/\/$/, "");
  const keys = Object.keys(portalRoutes) as PortalRouteKey[];
  // Correspondance la plus longue d'abord (ex. commandes/nouvelle avant commandes)
  return keys
    .filter((k) => clean === portalRoutes[k].fr || clean === portalRoutes[k].en || clean.startsWith(portalRoutes[k].fr + "/") || clean.startsWith(portalRoutes[k].en + "/"))
    .sort((a, b) => portalRoutes[b].fr.length - portalRoutes[a].fr.length)[0];
}
