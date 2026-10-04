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
} as const;

export const primaryPhone = site.contact.phones[0];
