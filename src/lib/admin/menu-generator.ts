/**
 * Génère la proposition de menu d'un mois : un repas par jour de semaine,
 * en suivant la rotation mensuelle, décalée d'un mois à l'autre pour varier.
 * L'équipe ajuste ensuite les jours (congés, fériés) avant de publier.
 */

export interface GeneratorMeal {
  id: string;
  slug: string;
  mealType: "repas" | "dessert" | "collation";
  rotationType: "mensuelle" | "ponctuelle" | null;
}

/** Jours ouvrables (lundi → vendredi) d'un mois « YYYY-MM-01 ». */
export function weekdaysOf(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const days: string[] = [];
  for (let d = new Date(Date.UTC(y, m - 1, 1)); d.getUTCMonth() === m - 1; d.setUTCDate(d.getUTCDate() + 1)) {
    const wd = d.getUTCDay();
    if (wd >= 1 && wd <= 5) days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/** Date limite de modification : 2 semaines avant le début du mois. */
export function defaultDeadline(month: string) {
  const d = new Date(`${month}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 14);
  return d.toISOString().slice(0, 10);
}

/** Collation du matin par défaut : fruits de saison (comme sur le menu affiché). */
const MORNING_SNACK_SLUG = "fruits-de-saison-collation";

export function generateMenuDays(month: string, meals: GeneratorMeal[]) {
  const mains = meals.filter((m) => m.mealType === "repas" && m.rotationType === "mensuelle");
  const pool = mains.length ? mains : meals.filter((m) => m.mealType === "repas");
  const desserts = meals.filter((m) => m.mealType === "dessert");
  const snacks = meals.filter((m) => m.mealType === "collation");
  const morning = snacks.find((m) => m.slug === MORNING_SNACK_SLUG) ?? snacks[0];
  const afternoon = snacks.filter((m) => m.id !== morning?.id);
  const [y, mo] = month.split("-").map(Number);
  const offset = (y * 12 + mo) * 3; // décalage différent chaque mois
  const pick = <T,>(list: T[], i: number) => (list.length ? list[(i + offset) % list.length] : undefined);
  return weekdaysOf(month).map((date, i) => ({
    date,
    meal_id: pool[(i + offset) % pool.length].id,
    dessert_id: pick(desserts, i)?.id ?? null,
    snack_am_id: morning?.id ?? null,
    snack_pm_id: pick(afternoon, i)?.id ?? null,
  }));
}
