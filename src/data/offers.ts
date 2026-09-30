/**
 * Formules et modes de service.
 * Aucun prix n'est affiché : tout passe par la soumission personnalisée.
 */

import type { MediaKey } from "./media";

export interface MealFormat {
  id: "chauds" | "prets-a-manger" | "congeles";
  title: string;
  summary: string;
  details: string[];
  photo: MediaKey;
}

export const mealFormats: MealFormat[] = [
  {
    id: "chauds",
    title: "Repas chauds",
    summary: "Livrés chauds, prêts à servir à l'heure du dîner.",
    details: ["Livraison planifiée selon votre horaire", "Quantités ajustées à vos groupes"],
    photo: "formulaHot",
  },
  {
    id: "prets-a-manger",
    title: "Prêts-à-manger",
    summary: "Des portions prêtes à réchauffer ou à servir, selon votre organisation.",
    details: ["Pratique pour les petites équipes", "Simple à ranger et à servir"],
    photo: "formulaReady",
  },
  {
    id: "congeles",
    title: "Repas congelés",
    summary: "Une réserve au congélateur pour garder de la flexibilité.",
    details: ["Idéal comme dépannage", "Vous servez selon vos besoins"],
    photo: "formulaFrozen",
  },
];

export interface ServiceMode {
  id: string;
  title: string;
  summary: string;
  highlight?: boolean;
}

export const serviceModes: ServiceMode[] = [
  {
    id: "reguliere",
    title: "Livraison régulière",
    summary: "Vos repas arrivent aux jours convenus, semaine après semaine. Vous n'avez plus à y penser.",
  },
  {
    id: "ponctuelle",
    title: "Commande ponctuelle",
    summary: "Une sortie, une journée spéciale, un besoin temporaire? Commandez seulement quand vous en avez besoin.",
  },
  {
    id: "urgente",
    title: "Service urgent",
    summary:
      "Un imprévu? Une livraison urgente peut être organisée sous 48 h, selon les disponibilités et votre zone de livraison.",
    highlight: true,
  },
];

export const URGENT_NOTE =
  "Livraison urgente possible sous 48 h, selon les disponibilités et la zone de livraison.";
