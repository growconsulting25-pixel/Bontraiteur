import type { Allergen, Meal, MealCategory, MealType, RotationType } from "@/lib/types";

/**
 * MENU COMPLET — source : Google Sheets « Menu Complet (Menu festin) ».
 *
 * Données locales temporaires. À remplacer par une table Supabase `meals`
 * (voir src/lib/menu-repository.ts : c'est le SEUL point d'accès aux données).
 *
 * Règles :
 * - Les noms ont été uniformisés (orthographe, accents). Le libellé d'origine
 *   est conservé dans `sourceName`.
 * - Les allergènes proviennent de la feuille et ne sont PAS validés
 *   (`allergensVerified: false`). « Aucune » dans la feuille ≠ « sans allergènes ».
 * - Aucune description, photo ou disponibilité par format (chaud / congelé /
 *   prêt-à-manger) n'a été inventée : ces champs restent vides / `null`
 *   jusqu'à validation par l'équipe.
 */

type Seed = {
  name: string;
  sourceName: string;
  category: MealCategory;
  mealType: MealType;
  rotationType: RotationType | null;
  allergens?: Allergen[];
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const seeds: Seed[] = [
  /* ---------- Rotation mensuelle (cycle de 20 plats) ---------- */
  { name: "Boulettes de volaille, purée de pommes de terre et légumes", sourceName: "Boulette de volaille, purée de pomme de terre et légumes", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Sauté de volaille hachée et purée de pommes de terre", sourceName: "Sauté de Volaille haché et purée de pomme de terre", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Macaroni sauce bolognaise", sourceName: "Macaroni sauce Bolognese", category: "pates", mealType: "repas", rotationType: "mensuelle" },
  { name: "Tofu Général Tao sur riz aux légumes", sourceName: "Tofu Général Tao sur riz aux légumes", category: "autres", mealType: "repas", rotationType: "mensuelle" },
  { name: "Poulet au pesto sur riz et légumes", sourceName: "Poulet au pesto sur riz et légumes", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Frittata au brocoli et petit pain", sourceName: "Fritatta brocoli et petit pain", category: "autres", mealType: "repas", rotationType: "mensuelle" },
  { name: "Sauté de bœuf haché et riz créole", sourceName: "Sautée de boeuf haché et riz créole", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Rotini à la volaille et légumes", sourceName: "Rottini à la volaille et légumes", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Tourtière avec macédoine", sourceName: "Tourtière avec Macédoine", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Burritos au bœuf et maïs", sourceName: "Burritos au boeuf accompagné de Mais", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Sauté de bœuf marocain", sourceName: "Sauté de boeuf Marocain", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Poulet barbecue sur riz aux légumes", sourceName: "Poulet barbecue sur riz aux légumes", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Rotini au poulet et légumes", sourceName: "Rotini au poulet et légumes", category: "pates", mealType: "repas", rotationType: "mensuelle" },
  { name: "Hachis Parmentier mexicain", sourceName: "Hachi Parmentier Mexicain", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Pâté au saumon primavera", sourceName: "Pâté au Saumon Primavera", category: "poisson", mealType: "repas", rotationType: "mensuelle", allergens: ["poisson"] },
  { name: "Spaghetti sauce bolognaise", sourceName: "Spaghetti Sauce Bolognaise", category: "pates", mealType: "repas", rotationType: "mensuelle" },
  { name: "Pâté chinois", sourceName: "Pâté Chinois", category: "autres", mealType: "repas", rotationType: "mensuelle" },
  { name: "Fajitas au poulet et crème de maïs", sourceName: "Fajitas au poulet avec crème de Mais", category: "volaille", mealType: "repas", rotationType: "mensuelle" },

  /* ---------- Rotation ponctuelle (sur demande, 2 semaines d'avance) ---------- */
  { name: "Chili au bœuf et PVT sur riz", sourceName: "Chili boeuf PVT Sur riz", category: "boeuf", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Couscous au brocoli, feta et poulet", sourceName: "Couscous au brocolis Feta et poulet", category: "volaille", mealType: "repas", rotationType: "ponctuelle", allergens: ["lait"] },
  // Catégorie « Boeuf » dans la feuille — à valider (saucisse de veau).
  { name: "Saucisse de veau sauce barbecue, pommes de terre, fèves et carottes", sourceName: "Sausisse de veau Sauce Barbecue, patate, fêves et carottes", category: "boeuf", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Boulettes de dinde sauce tomate, purée et légumes", sourceName: "Boulette de dinde sauce tomates purée et légumes", category: "volaille", mealType: "repas", rotationType: "ponctuelle" },
  // Catégorie « Volaille » dans la feuille — probablement à corriger.
  { name: "Quiche aux légumes et légumes d'accompagnement", sourceName: "Quiche aux légumes avec légumes en accompagnement", category: "volaille", mealType: "repas", rotationType: "ponctuelle", allergens: ["oeufs"] },
  { name: "Curry de pois chiches et chou-fleur sur riz", sourceName: "Curry de pois chiche et Choux-fleurs-sur-riz", category: "vegetarien", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Rotini sauce rosée", sourceName: "Rotini sauce rosée", category: "pates", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Egg rolls sur riz et légumes", sourceName: "Egg rolls sur riz et légumes", category: "autres", mealType: "repas", rotationType: "ponctuelle", allergens: ["oeufs"] },
  { name: "Pâtes au brocoli et sauce crémeuse", sourceName: "Pâtes aux brocoli et sauce crèmeuse", category: "vegetarien", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Burritos végétariens et maïs", sourceName: "Buritos végétarien sur Mais", category: "vegetarien", mealType: "repas", rotationType: "ponctuelle" },

  /* ---------- Desserts ---------- */
  { name: "Fruits de saison", sourceName: "Fruits de la saison", category: "desserts", mealType: "dessert", rotationType: null },
  { name: "Compote (pommes, prunes, poires)", sourceName: "Compote (pommes, prunes, poire)", category: "desserts", mealType: "dessert", rotationType: null },
  { name: "Yogourt (vanille, fruits, pêche)", sourceName: "Yogourt ( Vanille, aux fruits, pêche)", category: "desserts", mealType: "dessert", rotationType: null },

  /* ---------- Collations ---------- */
  { name: "Galette à l'avoine", sourceName: "Galette Avoine", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait", "oeufs"] },
  { name: "Pouding (vanille, fruits)", sourceName: "Pudding (Vanille aux fruits)", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait"] },
  // La feuille indique « œufs » uniquement — à valider (fromage = lait).
  { name: "Craquelins et fromage", sourceName: "Craquelins et fromage", category: "collations", mealType: "collation", rotationType: null, allergens: ["oeufs"] },
  { name: "Barre de céréales", sourceName: "Barre Nutrigrain", category: "collations", mealType: "collation", rotationType: null },
  { name: "Muffin au son et raisins", sourceName: "Muffin aux son et raisins", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait", "oeufs"] },
  { name: "Gâteau maison", sourceName: "Gâteau maison", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait", "oeufs"] },
  { name: "Biscuits maison", sourceName: "Biscuits Maison", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait", "oeufs"] },
  { name: "Craquelins et houmous", sourceName: "Craqu. et Humus", category: "collations", mealType: "collation", rotationType: null },
  { name: "Fruits de saison", sourceName: "Fruits de la saison", category: "collations", mealType: "collation", rotationType: null },
];

export const meals: Meal[] = seeds.map((seed) => {
  const base = slugify(seed.name);
  const slug = seed.mealType === "collation" && base === "fruits-de-saison" ? "fruits-de-saison-collation" : base;
  return {
    id: slug,
    slug,
    name: seed.name,
    sourceName: seed.sourceName,
    category: seed.category,
    mealType: seed.mealType,
    rotationType: seed.rotationType,
    description: "",
    allergens: seed.allergens ?? [],
    allergensVerified: false,
    status: "disponible",
    image: null,
    availableHot: null,
    availableFrozen: null,
    availableReadyToEat: null,
  };
});

/* ------------------------------------------------------------------ */
/* Libellés & filtres                                                  */
/* ------------------------------------------------------------------ */

export const categoryLabels: Record<MealCategory, string> = {
  volaille: "Volaille",
  boeuf: "Bœuf",
  pates: "Pâtes",
  poisson: "Poisson",
  vegetarien: "Végétarien",
  autres: "Autres plats",
  desserts: "Desserts",
  collations: "Collations",
};

/** Ordre d'affichage des filtres du menu. */
export const menuFilters: Array<{ value: "tous" | MealCategory; label: string }> = [
  { value: "tous", label: "Tous" },
  { value: "volaille", label: "Volaille" },
  { value: "boeuf", label: "Bœuf" },
  { value: "pates", label: "Pâtes" },
  { value: "poisson", label: "Poisson" },
  { value: "vegetarien", label: "Végétarien" },
  { value: "autres", label: "Autres plats" },
  { value: "desserts", label: "Desserts" },
  { value: "collations", label: "Collations" },
];

export const allergenLabels: Record<Allergen, string> = {
  lait: "Lait",
  oeufs: "Œufs",
  poisson: "Poisson",
};

export const rotationLabels: Record<RotationType, string> = {
  mensuelle: "Rotation mensuelle",
  ponctuelle: "Rotation ponctuelle",
};

export const ALLERGEN_DISCLAIMER =
  "Les informations sur les allergènes sont fournies à titre informatif et doivent être confirmées auprès de notre équipe selon vos besoins particuliers.";

export const ROTATION_NOTES = {
  mensuelle:
    "Notre menu principal comprend une rotation mensuelle d'une vingtaine de plats. Les repas varient chaque mois pour offrir diversité et équilibre aux tout-petits.",
  ponctuelle:
    "D'autres plats sont disponibles en rotation ponctuelle. Vous pouvez les intégrer à votre menu mensuel en nous en informant au moins 2 semaines à l'avance.",
};
