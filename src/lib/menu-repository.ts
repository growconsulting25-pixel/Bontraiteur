import { meals } from "@/data/menu";
import type { Meal, MealCategory } from "@/lib/types";
import type { Locale } from "@/i18n/config";

/**
 * Point d'accès UNIQUE aux données du menu.
 *
 * Aujourd'hui : lecture du fichier local `src/data/menu.ts`.
 * Demain : requête Supabase (`from("meals").select(...)`) — seules les
 * fonctions de ce fichier changeront, pas les composants.
 */

export async function getMeals(): Promise<Meal[]> {
  return meals.filter((meal) => meal.status !== "indisponible");
}

export async function getMealsByCategory(category: MealCategory): Promise<Meal[]> {
  return (await getMeals()).filter((meal) => meal.category === category);
}

export async function getMainMeals(): Promise<Meal[]> {
  return (await getMeals()).filter((meal) => meal.mealType === "repas");
}

export async function getMealBySlug(slug: string): Promise<Meal | undefined> {
  return (await getMeals()).find((meal) => meal.slug === slug);
}

/** Nom du plat dans la langue demandée. */
export const mealName = (meal: Pick<Meal, "name" | "nameEn">, locale: Locale) => (locale === "en" ? meal.nameEn : meal.name);
