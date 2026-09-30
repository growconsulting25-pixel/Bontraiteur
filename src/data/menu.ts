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
  nameEn: string;
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
  { name: "Boulettes de volaille, purée de pommes de terre et légumes", nameEn: "Poultry meatballs, mashed potatoes and vegetables", sourceName: "Boulette de volaille, purée de pomme de terre et légumes", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Sauté de volaille hachée et purée de pommes de terre", nameEn: "Ground poultry stir-fry with mashed potatoes", sourceName: "Sauté de Volaille haché et purée de pomme de terre", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Macaroni sauce bolognaise", nameEn: "Macaroni with Bolognese sauce", sourceName: "Macaroni sauce Bolognese", category: "pates", mealType: "repas", rotationType: "mensuelle" },
  { name: "Tofu Général Tao sur riz aux légumes", nameEn: "General Tao tofu on vegetable rice", sourceName: "Tofu Général Tao sur riz aux légumes", category: "autres", mealType: "repas", rotationType: "mensuelle" },
  { name: "Poulet au pesto sur riz et légumes", nameEn: "Pesto chicken on rice and vegetables", sourceName: "Poulet au pesto sur riz et légumes", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Frittata au brocoli et petit pain", nameEn: "Broccoli frittata with a bun", sourceName: "Fritatta brocoli et petit pain", category: "autres", mealType: "repas", rotationType: "mensuelle" },
  { name: "Sauté de bœuf haché et riz créole", nameEn: "Ground beef stir-fry with Creole rice", sourceName: "Sautée de boeuf haché et riz créole", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Rotini à la volaille et légumes", nameEn: "Rotini with poultry and vegetables", sourceName: "Rottini à la volaille et légumes", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Tourtière avec macédoine", nameEn: "Tourtière (meat pie) with mixed vegetables", sourceName: "Tourtière avec Macédoine", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Burritos au bœuf et maïs", nameEn: "Beef burritos with corn", sourceName: "Burritos au boeuf accompagné de Mais", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Sauté de bœuf marocain", nameEn: "Moroccan beef stir-fry", sourceName: "Sauté de boeuf Marocain", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Poulet barbecue sur riz aux légumes", nameEn: "Barbecue chicken on vegetable rice", sourceName: "Poulet barbecue sur riz aux légumes", category: "volaille", mealType: "repas", rotationType: "mensuelle" },
  { name: "Rotini au poulet et légumes", nameEn: "Rotini with chicken and vegetables", sourceName: "Rotini au poulet et légumes", category: "pates", mealType: "repas", rotationType: "mensuelle" },
  { name: "Hachis Parmentier mexicain", nameEn: "Mexican-style shepherd's pie", sourceName: "Hachi Parmentier Mexicain", category: "boeuf", mealType: "repas", rotationType: "mensuelle" },
  { name: "Pâté au saumon primavera", nameEn: "Salmon pie primavera", sourceName: "Pâté au Saumon Primavera", category: "poisson", mealType: "repas", rotationType: "mensuelle", allergens: ["poisson"] },
  { name: "Spaghetti sauce bolognaise", nameEn: "Spaghetti with Bolognese sauce", sourceName: "Spaghetti Sauce Bolognaise", category: "pates", mealType: "repas", rotationType: "mensuelle" },
  { name: "Pâté chinois", nameEn: "Pâté chinois (Quebec shepherd's pie)", sourceName: "Pâté Chinois", category: "autres", mealType: "repas", rotationType: "mensuelle" },
  { name: "Fajitas au poulet et crème de maïs", nameEn: "Chicken fajitas with creamed corn", sourceName: "Fajitas au poulet avec crème de Mais", category: "volaille", mealType: "repas", rotationType: "mensuelle" },

  /* ---------- Rotation ponctuelle (sur demande, 2 semaines d'avance) ---------- */
  { name: "Chili au bœuf et PVT sur riz", nameEn: "Beef and TVP chili on rice", sourceName: "Chili boeuf PVT Sur riz", category: "boeuf", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Couscous au brocoli, feta et poulet", nameEn: "Couscous with broccoli, feta and chicken", sourceName: "Couscous au brocolis Feta et poulet", category: "volaille", mealType: "repas", rotationType: "ponctuelle", allergens: ["lait"] },
  // Catégorie « Boeuf » dans la feuille — à valider (saucisse de veau).
  { name: "Saucisse de veau sauce barbecue, pommes de terre, fèves et carottes", nameEn: "Veal sausage in barbecue sauce, potatoes, beans and carrots", sourceName: "Sausisse de veau Sauce Barbecue, patate, fêves et carottes", category: "boeuf", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Boulettes de dinde sauce tomate, purée et légumes", nameEn: "Turkey meatballs in tomato sauce, mashed potatoes and vegetables", sourceName: "Boulette de dinde sauce tomates purée et légumes", category: "volaille", mealType: "repas", rotationType: "ponctuelle" },
  // Catégorie « Volaille » dans la feuille — probablement à corriger.
  { name: "Quiche aux légumes et légumes d'accompagnement", nameEn: "Vegetable quiche with a side of vegetables", sourceName: "Quiche aux légumes avec légumes en accompagnement", category: "volaille", mealType: "repas", rotationType: "ponctuelle", allergens: ["oeufs"] },
  { name: "Curry de pois chiches et chou-fleur sur riz", nameEn: "Chickpea and cauliflower curry on rice", sourceName: "Curry de pois chiche et Choux-fleurs-sur-riz", category: "vegetarien", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Rotini sauce rosée", nameEn: "Rotini in rosé sauce", sourceName: "Rotini sauce rosée", category: "pates", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Egg rolls sur riz et légumes", nameEn: "Egg rolls on rice and vegetables", sourceName: "Egg rolls sur riz et légumes", category: "autres", mealType: "repas", rotationType: "ponctuelle", allergens: ["oeufs"] },
  { name: "Pâtes au brocoli et sauce crémeuse", nameEn: "Pasta with broccoli in a creamy sauce", sourceName: "Pâtes aux brocoli et sauce crèmeuse", category: "vegetarien", mealType: "repas", rotationType: "ponctuelle" },
  { name: "Burritos végétariens et maïs", nameEn: "Vegetarian burritos with corn", sourceName: "Buritos végétarien sur Mais", category: "vegetarien", mealType: "repas", rotationType: "ponctuelle" },

  /* ---------- Desserts ---------- */
  { name: "Fruits de saison", nameEn: "Seasonal fruit", sourceName: "Fruits de la saison", category: "desserts", mealType: "dessert", rotationType: null },
  { name: "Compote (pommes, prunes, poires)", nameEn: "Fruit compote (apple, plum, pear)", sourceName: "Compote (pommes, prunes, poire)", category: "desserts", mealType: "dessert", rotationType: null },
  { name: "Yogourt (vanille, fruits, pêche)", nameEn: "Yogurt (vanilla, fruit, peach)", sourceName: "Yogourt ( Vanille, aux fruits, pêche)", category: "desserts", mealType: "dessert", rotationType: null },

  /* ---------- Collations ---------- */
  { name: "Galette à l'avoine", nameEn: "Oatmeal cookie", sourceName: "Galette Avoine", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait", "oeufs"] },
  { name: "Pouding (vanille, fruits)", nameEn: "Pudding (vanilla, fruit)", sourceName: "Pudding (Vanille aux fruits)", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait"] },
  // La feuille indique « œufs » uniquement — à valider (fromage = lait).
  { name: "Craquelins et fromage", nameEn: "Crackers and cheese", sourceName: "Craquelins et fromage", category: "collations", mealType: "collation", rotationType: null, allergens: ["oeufs"] },
  { name: "Barre de céréales", nameEn: "Cereal bar", sourceName: "Barre Nutrigrain", category: "collations", mealType: "collation", rotationType: null },
  { name: "Muffin au son et raisins", nameEn: "Bran and raisin muffin", sourceName: "Muffin aux son et raisins", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait", "oeufs"] },
  { name: "Gâteau maison", nameEn: "Homemade cake", sourceName: "Gâteau maison", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait", "oeufs"] },
  { name: "Biscuits maison", nameEn: "Homemade cookies", sourceName: "Biscuits Maison", category: "collations", mealType: "collation", rotationType: null, allergens: ["lait", "oeufs"] },
  { name: "Craquelins et houmous", nameEn: "Crackers and hummus", sourceName: "Craqu. et Humus", category: "collations", mealType: "collation", rotationType: null },
  { name: "Fruits de saison", nameEn: "Seasonal fruit", sourceName: "Fruits de la saison", category: "collations", mealType: "collation", rotationType: null },
];

export const meals: Meal[] = seeds.map((seed) => {
  const base = slugify(seed.name);
  const slug = seed.mealType === "collation" && base === "fruits-de-saison" ? "fruits-de-saison-collation" : base;
  return {
    id: slug,
    slug,
    name: seed.name,
    nameEn: seed.nameEn,
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
/* Filtres (les libellés sont dans les dictionnaires i18n)             */
/* ------------------------------------------------------------------ */

/** Ordre d'affichage des filtres du menu. */
export const menuFilterOrder: Array<"tous" | MealCategory> = [
  "tous",
  "volaille",
  "boeuf",
  "pates",
  "poisson",
  "vegetarien",
  "autres",
  "desserts",
  "collations",
];
