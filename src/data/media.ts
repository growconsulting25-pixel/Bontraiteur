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
 * Photos Bon Traiteur : public/images (fournies par le client).
 * ⚠️ Les URL Unsplash restantes (licence Unsplash, usage commercial permis) sont des
 * illustrations temporaires de nourriture/ingrédients, à remplacer au fil des lots de photos.
 * Si une image distante ne se charge pas, le placeholder s'affiche.
 */

export type PhotoTone = "olive" | "saffron" | "coral" | "cream" | "charcoal";

export interface PhotoSlot {
  alt: Record<Locale, string>;
  /** Point d'intérêt du recadrage (CSS object-position), ex. "50% 30%". */
  focus?: string;
  brief: string;
  src: string | null;
  tone: PhotoTone;
  kind: "enfants" | "nourriture" | "cuisine" | "livraison";
}

const unsplash = (id: string) => `https://images.unsplash.com/${id}`;

export const media = {
  heroMain: {
    alt: { fr: "Deux cuisiniers portionnent riz, poulet et légumes dans des contenants individuels", en: "Two cooks portioning rice, chicken and vegetables into individual containers" },
    brief: "Éducatrice qui sert le repas, 3-4 enfants attablés, lumière naturelle, portions enfants",
    src: "/images/equipe-portionnement.webp",
    focus: "52% 40%",
    tone: "saffron",
    kind: "enfants",
  },
  heroMeal: {
    alt: { fr: "Le camion réfrigéré Bon Traiteur stationné devant une garderie", en: "The refrigerated Bon Traiteur truck parked in front of a daycare" },
    brief: "Plat réel en portion enfant, vue plongée, contenant Bon Traiteur",
    src: "/images/camion-bon-traiteur.webp",
    focus: "55% 50%",
    tone: "olive",
    kind: "nourriture",
  },
  situationsTable: {
    alt: { fr: "Des enfants dînent ensemble à une petite table de garderie", en: "Children having lunch together at a small daycare table" },
    brief: "Table basse de garderie, petites chaises, assiettes servies, ambiance calme",
    src: "/images/enfants-table-garderie.webp",
    focus: "40% 50%",
    tone: "coral",
    kind: "enfants",
  },
  formulaHot: {
    alt: { fr: "Riz aux légumes et poulet sauté chauds, dans des bacs de service", en: "Hot vegetable rice and sautéed chicken in serving pans" },
    brief: "Repas chauds livrés en bacs, vapeur visible",
    src: "/images/riz-poulet-legumes.webp",
    tone: "coral",
    kind: "nourriture",
  },
  formulaReady: {
    alt: { fr: "Repas individuels variés en contenants, prêts à réchauffer", en: "A variety of individual meals in containers, ready to reheat" },
    brief: "Portions individuelles scellées, étiquetées",
    src: "/images/pret-a-manger-portions.jpg",
    tone: "saffron",
    kind: "nourriture",
  },
  formulaFrozen: {
    alt: { fr: "Plats congelés en contenants : poulet, riz et légumes, pâtes gratinées, légumes en sauce", en: "Frozen meals in containers: chicken, rice and vegetables, baked pasta, vegetables in sauce" },
    brief: "Contenants congelés, étiquettes lisibles, rangement propre",
    src: "/images/plats-congeles-contenants.webp",
    tone: "olive",
    kind: "nourriture",
  },
  kitchenTeam: {
    alt: {
      fr: "Deux cuisiniers portionnent riz, poulet et légumes dans des contenants individuels",
      en: "Two cooks portioning rice, chicken and vegetables into individual containers",
    },
    brief: "Vraie équipe en cuisine, tabliers de marque, préparation en cours",
    src: "/images/equipe-portionnement.webp",
    focus: "50% 25%",
    tone: "olive",
    kind: "cuisine",
  },
  teamPrep: {
    alt: { fr: "Deux cuisiniers préparent des repas colorés dans des contenants individuels", en: "Two cooks preparing colourful meals in individual containers" },
    brief: "Équipe qui portionne les repas, plan large",
    src: "/images/equipe-repas-colores.webp",
    focus: "50% 40%",
    tone: "olive",
    kind: "cuisine",
  },
  kitchenSpace: {
    alt: { fr: "La cuisine commerciale, propre et lumineuse", en: "The clean, bright commercial kitchen" },
    brief: "La cuisine, vue d'ensemble",
    src: "/images/cuisine-bon-traiteur.webp",
    focus: "60% 50%",
    tone: "cream",
    kind: "cuisine",
  },
  delivery: {
    alt: {
      fr: "Le camion réfrigéré Bon Traiteur stationné devant une garderie",
      en: "The refrigerated Bon Traiteur truck parked in front of a daycare",
    },
    brief: "Livreur Bon Traiteur remettant les bacs à une éducatrice, entrée de garderie",
    src: "/images/camion-bon-traiteur.webp",
    focus: "45% 55%",
    tone: "charcoal",
    kind: "livraison",
  },
  kidsEating: {
    alt: { fr: "Repas maison équilibré", en: "Balanced home-style meal" },
    brief: "Enfants qui mangent ensemble, rires, mains, vraies portions — éviter les poses",
    src: unsplash("photo-1512621776951-a57141f2eefd"),
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
    alt: { fr: "Une lasagne gratinée tout juste sortie du four", en: "A golden baked lasagna fresh out of the oven" },
    brief: "Directrice et éducatrice qui regardent une tablette/feuille de menu, sourire, bureau de CPE",
    src: "/images/lasagne.webp",
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

/**
 * Photos Bon Traiteur qui correspondent à un plat précis (par slug), utilisées
 * tant que le plat n'a pas sa propre photo (`meal.image`).
 */
export const mealIllustrations: Partial<Record<string, string>> = {
  "poulet-au-pesto-sur-riz-et-legumes": "/images/riz-poulet-legumes.webp",
  "poulet-barbecue-sur-riz-aux-legumes": "/images/riz-poulet-legumes.webp",
  "macaroni-sauce-bolognaise": "/images/macaroni-bolognaise.webp",
  "pate-au-saumon-primavera": "/images/saumon-primavera.webp",
  "tofu-general-tao-sur-riz-aux-legumes": "/images/tofu-general-tao.webp",
};
