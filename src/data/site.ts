/**
 * Informations globales du site.
 *
 * ⚠️ Les valeurs marquées PLACEHOLDER doivent être remplacées par les vraies
 * informations de Bon Traiteur avant la mise en ligne.
 */

export const site = {
  name: "Bon Traiteur",
  url: "https://bontraiteur.com",
  locale: "fr_CA",
  tagline: "Des repas qui plaisent aux enfants. Un service qui simplifie vos journées.",
  description:
    "Service de repas pour CPE, garderies et services de garde au Québec. Menus mensuels flexibles, repas chauds, prêts-à-manger ou congelés, livraisons régulières, ponctuelles ou urgentes.",
  contact: {
    phone: "514 000-0000", // PLACEHOLDER
    phoneHref: "tel:+15140000000", // PLACEHOLDER
    email: "info@bontraiteur.com", // PLACEHOLDER — adresse à confirmer
    hours: "Lundi au vendredi, 7 h à 16 h", // PLACEHOLDER
    serviceArea: "Grand Montréal et environs", // PLACEHOLDER — zone de livraison à confirmer
  },
  yearsOfExperience: "15+",
} as const;

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Nos repas", href: "/nos-repas" },
  { label: "Menu", href: "/menu" },
  { label: "Comment ça fonctionne", href: "/comment-ca-fonctionne" },
  { label: "À propos", href: "/a-propos" },
  { label: "FAQ", href: "/faq" },
];

export const footerNav: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Nos repas",
    items: [
      { label: "Menu complet", href: "/menu" },
      { label: "Repas et formules", href: "/nos-repas" },
      { label: "Pour les garderies et CPE", href: "/garderies" },
    ],
  },
  {
    title: "Service",
    items: [
      { label: "Comment ça fonctionne", href: "/comment-ca-fonctionne" },
      { label: "Demander une soumission", href: "/soumission" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Bon Traiteur",
    items: [
      { label: "À propos", href: "/a-propos" },
      { label: "Contact", href: "/contact" },
      { label: "Connexion client", href: "/login" },
    ],
  },
];
