import "server-only";
import { cache } from "react";
import { meals as localMeals } from "@/data/menu";
import type { Meal, MealCategory } from "@/lib/types";
import { getPublicSupabase } from "@/lib/supabase/server";
import { MEAL_COLUMNS, mealFromRow, type MealRow } from "@/lib/supabase/rows";

/**
 * Point d'accès UNIQUE aux données du menu.
 *
 * - Supabase configuré → table `meals` (source de vérité).
 * - Sinon, ou en cas d'erreur → données locales `src/data/menu.ts`.
 * Les composants ne savent pas d'où viennent les données.
 */
export const getMeals = cache(async (): Promise<Meal[]> => {
  const supabase = getPublicSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("meals")
      .select(MEAL_COLUMNS)
      .neq("status", "indisponible")
      .order("sort_order", { ascending: true })
      .returns<MealRow[]>();
    if (!error && data && data.length > 0) return data.map(mealFromRow);
    console.error("[menu] Lecture Supabase impossible, repli sur les données locales :", error?.message ?? "aucun plat");
  }
  return localMeals.filter((meal) => meal.status !== "indisponible");
});

export async function getMealsByCategory(category: MealCategory): Promise<Meal[]> {
  return (await getMeals()).filter((meal) => meal.category === category);
}

export async function getMainMeals(): Promise<Meal[]> {
  return (await getMeals()).filter((meal) => meal.mealType === "repas");
}

export async function getMealBySlug(slug: string): Promise<Meal | undefined> {
  return (await getMeals()).find((meal) => meal.slug === slug);
}
