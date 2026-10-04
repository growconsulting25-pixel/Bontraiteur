/**
 * Informations globales non traduites.
 * Les textes (heures, zone desservie) sont dans les dictionnaires i18n.
 */

export const site = {
  name: "Bon Traiteur",
  url: "https://bontraiteur.com",
  contact: {
    phones: [
      { display: "+1 438-938-3035", href: "tel:+14389383035" },
      { display: "+1 438-470-2045", href: "tel:+14384702045" },
    ],
    email: "info@bontraiteur.com", // PLACEHOLDER — adresse courriel à confirmer
    // Aucune adresse civique publiée pour l'instant.
  },
  /** Fautes et variantes du nom que les gens tapent : aident Google et les IA à relier la recherche à la marque. */
  alternateNames: ["Bon traiteur", "Bontraiteur", "Bon-Traiteur", "Bon Traitteur", "Bon Traiter", "Bon Traiteur Montréal", "Bon Traiteur garderie", "Bon Traiteur CPE"],
  /** Profils officiels (Google Business, Facebook, Instagram, LinkedIn…) à ajouter dès qu'ils existent. */
  sameAs: [] as string[],
  hours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "05:00", closes: "17:00" },
  areaServed: "Grande région de Montréal",
} as const;

export const primaryPhone = site.contact.phones[0];
