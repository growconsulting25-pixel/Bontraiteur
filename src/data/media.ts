/**
 * Registre des photos du site.
 *
 * Chaque emplacement photo du site est déclaré ici avec :
 * - `alt`   : texte alternatif final (accessibilité + SEO)
 * - `brief` : consigne de prise de vue pour le photographe
 * - `src`   : chemin de la vraie photo (ex. "/images/hero-educatrice.jpg")
 *
 * Tant que `src` vaut `null`, le composant <Photo> affiche un placeholder
 * de marque clairement identifié « Photo à venir ». Pour brancher une vraie
 * photo : déposer le fichier dans /public/images et renseigner `src`.
 */

export type PhotoTone = "olive" | "saffron" | "coral" | "cream" | "charcoal";

export interface PhotoSlot {
  alt: string;
  brief: string;
  src: string | null;
  tone: PhotoTone;
  kind: "enfants" | "nourriture" | "cuisine" | "livraison";
}

export const media = {
  heroMain: {
    alt: "Une éducatrice sert le dîner à un petit groupe d'enfants attablés dans un CPE",
    brief: "Éducatrice qui sert le repas, 3-4 enfants attablés, lumière naturelle, portions enfants",
    src: null,
    tone: "saffron",
    kind: "enfants",
  },
  heroMeal: {
    alt: "Portion enfant de poulet au pesto, riz et légumes dans un contenant Bon Traiteur",
    brief: "Plat réel en portion enfant, vue plongée, contenant Bon Traiteur",
    src: null,
    tone: "olive",
    kind: "nourriture",
  },
  situationsTable: {
    alt: "Table de garderie dressée pour le dîner avec les repas Bon Traiteur",
    brief: "Table basse de garderie, petites chaises, assiettes servies, ambiance calme",
    src: null,
    tone: "coral",
    kind: "enfants",
  },
  formulaHot: {
    alt: "Bacs de repas chauds prêts à être servis",
    brief: "Repas chauds livrés en bacs, vapeur visible",
    src: null,
    tone: "coral",
    kind: "nourriture",
  },
  formulaReady: {
    alt: "Repas prêts-à-manger en portions individuelles",
    brief: "Portions individuelles scellées, étiquetées",
    src: null,
    tone: "saffron",
    kind: "nourriture",
  },
  formulaFrozen: {
    alt: "Repas congelés étiquetés dans un congélateur de garderie",
    brief: "Contenants congelés, étiquettes lisibles, rangement propre",
    src: null,
    tone: "olive",
    kind: "nourriture",
  },
  kitchenTeam: {
    alt: "L'équipe Bon Traiteur prépare les repas du jour en cuisine",
    brief: "Vraie équipe en cuisine, tabliers de marque, préparation en cours",
    src: null,
    tone: "olive",
    kind: "cuisine",
  },
  delivery: {
    alt: "Livraison des repas Bon Traiteur à l'entrée d'une garderie",
    brief: "Livreur Bon Traiteur remettant les bacs à une éducatrice, entrée de garderie",
    src: null,
    tone: "charcoal",
    kind: "livraison",
  },
  kidsEating: {
    alt: "Des enfants mangent ensemble à la garderie",
    brief: "Enfants qui mangent ensemble, rires, mains, vraies portions — éviter les poses",
    src: null,
    tone: "coral",
    kind: "enfants",
  },
  aboutKitchen: {
    alt: "Préparation des portions dans la cuisine Bon Traiteur",
    brief: "Mains qui portionnent les repas, gros plan, contenants alignés",
    src: null,
    tone: "saffron",
    kind: "cuisine",
  },
  ctaFinal: {
    alt: "Une directrice de garderie consulte son menu avec une éducatrice",
    brief: "Directrice et éducatrice qui regardent une tablette/feuille de menu, sourire, bureau de CPE",
    src: null,
    tone: "saffron",
    kind: "enfants",
  },
} satisfies Record<string, PhotoSlot>;

export type MediaKey = keyof typeof media;
