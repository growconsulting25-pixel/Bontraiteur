import type { Allergen, Meal, MealCategory, MealStatus, MealType, RotationType } from "@/lib/types";

/** Ligne de la table `meals` (voir supabase/migrations). */
export interface MealRow {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  source_name: string | null;
  category: MealCategory;
  meal_type: MealType;
  rotation_type: RotationType | null;
  description_fr: string;
  description_en: string;
  allergens: Allergen[];
  allergens_verified: boolean;
  status: MealStatus;
  image_url: string | null;
  available_hot: boolean | null;
  available_frozen: boolean | null;
  available_ready_to_eat: boolean | null;
  sort_order: number;
}

export const MEAL_COLUMNS =
  "id, slug, name_fr, name_en, source_name, category, meal_type, rotation_type, description_fr, description_en, allergens, allergens_verified, status, image_url, available_hot, available_frozen, available_ready_to_eat, sort_order";

export function mealFromRow(row: MealRow): Meal {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name_fr,
    nameEn: row.name_en,
    sourceName: row.source_name ?? row.name_fr,
    category: row.category,
    mealType: row.meal_type,
    rotationType: row.rotation_type,
    description: row.description_fr,
    allergens: row.allergens ?? [],
    allergensVerified: row.allergens_verified,
    status: row.status,
    image: row.image_url,
    availableHot: row.available_hot,
    availableFrozen: row.available_frozen,
    availableReadyToEat: row.available_ready_to_eat,
  };
}
