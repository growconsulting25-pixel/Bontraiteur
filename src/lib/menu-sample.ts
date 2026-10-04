import { generateMenuDays } from "@/lib/admin/menu-generator";
import type { Meal } from "@/lib/types";

/** Mois servant d'exemple (fixe, pour que la page reste statique). Commence un lundi. */
export const SAMPLE_MONTH = "2026-11-01";

export const SAMPLE_SLOTS = ["collation_am", "repas", "dessert", "collation_pm"] as const;
export type SampleSlot = (typeof SAMPLE_SLOTS)[number];

export type SampleDay = Record<SampleSlot, Meal | undefined>;

/** Deux semaines d'exemple (lundi → vendredi), générées comme dans le back-office. */
export function sampleWeeks(meals: Meal[]): SampleDay[][] {
  const byId = new Map(meals.map((m) => [m.id, m]));
  const days = generateMenuDays(SAMPLE_MONTH, meals)
    .slice(0, 10)
    .map((d) => ({
      collation_am: d.snack_am_id ? byId.get(d.snack_am_id) : undefined,
      repas: byId.get(d.meal_id),
      dessert: d.dessert_id ? byId.get(d.dessert_id) : undefined,
      collation_pm: d.snack_pm_id ? byId.get(d.snack_pm_id) : undefined,
    }));
  return [days.slice(0, 5), days.slice(5, 10)];
}
