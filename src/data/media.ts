import type { MealCategory } from "@/lib/types";
import type { Locale } from "@/i18n/config";

/**
 * Registre des photos du site.
 *
 * Chaque emplacement déclare :
 * - `alt`   : texte alternatif final, en français et en anglais
 * - `brief` : consigne de prise de vue pour la VRAIE photo (photographe)
 * - `src`   : photo affichée. Deux possibilités :
 *     · chemin local  "/images/hero.jpg"  → vraie photo Bon Traiteur (priorité)
 *     · URL Unsplash                      → photo d'illustration TEMPORAIRE
 *     · null                              → placeholder de marque « Photo à venir »
 *
 * ⚠️ Les photos Unsplash (licence Unsplash, usage commercial permis) sont des
 * illustrations temporaires de nourriture/ingrédients. Elles ne montrent PAS
 * les plats de Bon Traiteur et doivent être remplacées par de vraies photos.
 * Si une image distante ne se charge pas, le placeholder s'affiche.
 */

export type PhotoTone = "olive" | "saffron" | "coral" | "cream" | "charcoal";

export interface PhotoSlot {
  alt: Record<Locale, string>;
  brief: string;
  src: string | null;
  tone: PhotoTone;
  kind: "enfants" | "nourriture" | "cuisine" | "livraison";
}

const unsplash = (id: string) => `https://images.unsplash.com/${id}`;

export const media = {
  heroMain: {
    alt: {
      fr: "Bol de repas coloré avec légumes frais et protéines",
      en: "Colourful meal bowl with fresh vegetables and protein",
    },
    brief: "Éducatrice qui sert le repas, 3-4 enfants attablés, lumière naturelle, portions enfants",
    src: unsplash("photo-1512621776951-a57141f2eefd"),
    tone: "saffron",
    kind: "enfants",
  },
  heroMeal: {
    alt: { fr: "Assiette de pâtes à la sauce tomate", en: "Plate of pasta with tomato sauce" },
    brief: "Plat réel en portion enfant, vue plongée, contenant Bon Traiteur",
    src: unsplash("photo-1473093295043-cdd812d0e601"),
    tone: "olive",
    kind: "nourriture",
  },
  situationsTable: {
    alt: { fr: "Légumes frais disposés sur une table", en: "Fresh vegetables laid out on a table" },
    brief: "Table basse de garderie, petites chaises, assiettes servies, ambiance calme",
    src: unsplash("photo-1498837167922-ddd27525d352"),
    tone: "coral",
    kind: "enfants",
  },
  formulaHot: {
    alt: { fr: "Repas chaud avec viande et légumes", en: "Hot meal with meat and vegetables" },
    brief: "Repas chauds livrés en bacs, vapeur visible",
    src: unsplash("photo-1504674900247-0877df9cc836"),
    tone: "coral",
    kind: "nourriture",
  },
  formulaReady: {
    alt: { fr: "Portion individuelle de repas équilibré", en: "Individual portion of a balanced meal" },
    brief: "Portions individuelles scellées, étiquetées",
    src: unsplash("photo-1546069901-ba9599a7e63c"),
    tone: "saffron",
    kind: "nourriture",
  },
  formulaFrozen: {
    alt: { fr: "Repas préparé prêt à être conservé", en: "Prepared meal ready to be stored" },
    brief: "Contenants congelés, étiquettes lisibles, rangement propre",
    src: unsplash("photo-1540189549336-e6e99c3679fe"),
    tone: "olive",
    kind: "nourriture",
  },
  kitchenTeam: {
    alt: { fr: "Préparation des repas en cuisine", en: "Preparing meals in the kitchen" },
    brief: "Vraie équipe en cuisine, tabliers de marque, préparation en cours",
    src: unsplash("photo-1556910103-1c02745aae4d"),
    tone: "olive",
    kind: "cuisine",
  },
  delivery: {
    alt: { fr: "Ingrédients frais prêts à cuisiner", en: "Fresh ingredients ready to cook" },
    brief: "Livreur Bon Traiteur remettant les bacs à une éducatrice, entrée de garderie",
    src: unsplash("photo-1466637574441-749b8f19452f"),
    tone: "charcoal",
    kind: "livraison",
  },
  kidsEating: {
    alt: { fr: "Bols de repas sains et colorés", en: "Healthy, colourful meal bowls" },
    brief: "Enfants qui mangent ensemble, rires, mains, vraies portions — éviter les poses",
    src: unsplash("photo-1490645935967-10de6ba17061"),
    tone: "coral",
    kind: "enfants",
  },
  aboutKitchen: {
    alt: { fr: "Mains qui cuisinent des légumes", en: "Hands cooking vegetables" },
    brief: "Mains qui portionnent les repas, gros plan, contenants alignés",
    src: unsplash("photo-1556909114-f6e7ad7d3136"),
    tone: "saffron",
    kind: "cuisine",
  },
  ctaFinal: {
    alt: { fr: "Repas maison fraîchement préparé", en: "Freshly prepared home-style meal" },
    brief: "Directrice et éducatrice qui regardent une tablette/feuille de menu, sourire, bureau de CPE",
    src: unsplash("photo-1543339308-43e59d6b73a6"),
    tone: "saffron",
    kind: "enfants",
  },
} satisfies Record<string, PhotoSlot>;

export type MediaKey = keyof typeof media;

/**
 * Illustrations TEMPORAIRES par catégorie pour les cartes du menu, utilisées
 * seulement quand un plat n'a pas encore sa vraie photo (`meal.image`).
 */
export const categoryIllustrations: Record<MealCategory, string> = {
  volaille: unsplash("photo-1598515214211-89d3c73ae83b"),
  boeuf: unsplash("photo-1555939594-58d7cb561ad1"),
  pates: unsplash("photo-1621996346565-e3dbc646d9a9"),
  poisson: unsplash("photo-1467003909585-2f8a72700288"),
  vegetarien: unsplash("photo-1512621776951-a57141f2eefd"),
  autres: unsplash("photo-1512058564366-18510be2db19"),
  desserts: unsplash("photo-1488477181946-6428a0291777"),
  collations: unsplash("photo-1558961363-fa8fdf82db35"),
};
