import type { Meal } from "@/lib/types";
import type { Locale } from "@/i18n/config";

/** Nom du plat dans la langue demandée (utilisable côté client et serveur). */
export const mealName = (meal: Pick<Meal, "name" | "nameEn">, locale: Locale) => (locale === "en" ? meal.nameEn : meal.name);
