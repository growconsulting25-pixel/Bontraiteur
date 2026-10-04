import type { Meal, MealCategory } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { menuFilterOrder } from "@/data/menu";
import { mealName } from "@/lib/meal-name";
import { allergenChipClass } from "@/lib/allergen-tone";

/** Menu complet en texte, regroupé par catégorie (en attendant les photos de tous les plats). */
export function MealTextList({ meals, locale, t }: { meals: Meal[]; locale: Locale; t: Dictionary["menu"] }) {
  const groups = menuFilterOrder
    .filter((c): c is MealCategory => c !== "tous")
    .map((category) => ({ category, items: meals.filter((m) => m.category === category) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="columns-1 gap-5 lg:columns-2">
      {groups.map(({ category, items }) => (
        <section key={category} className="mb-5 break-inside-avoid rounded-[var(--radius-lg)] bg-paper p-6 ring-1 ring-line sm:p-7">
          <h3 className="flex items-baseline justify-between gap-3 font-display text-xl font-bold">
            {t.categories[category]}
            <span className="text-sm font-semibold text-ink-soft">{items.length}</span>
          </h3>
          <ul className="mt-3 divide-y divide-line">
            {items.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-3">
                <span className="text-[1.02rem] leading-snug font-semibold">{mealName(m, locale)}</span>
                <span className="flex flex-wrap gap-1.5">
                  {m.rotationType === "ponctuelle" && (
                    <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-xs font-semibold text-ink-soft">{t.occasionalTag}</span>
                  )}
                  {m.allergens.map((a) => (
                    <span key={a} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${allergenChipClass[a]}`}>
                      {t.allergens[a]}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
