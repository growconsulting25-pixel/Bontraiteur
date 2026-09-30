"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Meal, RotationType } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { menuFilterOrder } from "@/data/menu";
import { mealName } from "@/lib/meal-name";
import { MealCard, type MealCardLabels } from "@/components/cards/MealCard";
import { MenuFilters, type FilterValue } from "./MenuFilters";
import { cn } from "@/lib/cn";

type RotationFilter = "toutes" | RotationType;

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function MenuExplorer({
  meals,
  locale,
  t,
  cardLabels,
}: {
  meals: Meal[];
  locale: Locale;
  t: Dictionary["menu"];
  cardLabels: MealCardLabels;
}) {
  const [category, setCategory] = useState<FilterValue>("tous");
  const [rotation, setRotation] = useState<RotationFilter>("toutes");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = Object.fromEntries(menuFilterOrder.map((f) => [f, 0])) as Record<FilterValue, number>;
    for (const m of meals) {
      c[m.category] += 1;
      c.tous += 1;
    }
    return c;
  }, [meals]);

  // Les desserts et collations ne sont pas en rotation : le filtre ne s'applique pas.
  const hasRotation = category === "tous" || !["desserts", "collations"].includes(category);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return meals.filter(
      (m) =>
        (category === "tous" || m.category === category) &&
        (!hasRotation || rotation === "toutes" || m.rotationType === rotation) &&
        (!q || normalize(mealName(m, locale)).includes(q)),
    );
  }, [meals, category, rotation, query, hasRotation, locale]);

  return (
    <div>
      <div className="sticky top-[4.5rem] z-20 -mx-gutter border-b border-line bg-cream/95 px-gutter py-4 backdrop-blur-md lg:top-20">
        <div className="flex flex-col gap-4">
          <MenuFilters value={category} counts={counts} labels={t.categories} ariaLabel={t.filterAria} onChange={setCategory} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">{t.search}</span>
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="h-11 w-full rounded-full bg-paper pr-4 pl-10 text-sm ring-1 ring-line outline-none ring-inset placeholder:text-ink-soft focus:ring-2 focus:ring-charcoal"
              />
            </label>
            {hasRotation && (
              <div role="group" aria-label={t.rotationAria} className="inline-flex rounded-full bg-cream-deep p-1 text-sm">
                {(
                  [
                    ["toutes", t.rotationAll],
                    ["mensuelle", t.rotationMonthly],
                    ["ponctuelle", t.rotationOccasional],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={rotation === value}
                    onClick={() => setRotation(value)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 font-semibold transition-colors",
                      rotation === value ? "bg-paper shadow-[var(--shadow-soft)]" : "text-ink-soft hover:text-charcoal",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-soft" aria-live="polite">
        {results.length} {results.length > 1 ? t.countMany : t.countOne}
      </p>

      {results.length > 0 ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((meal) => (
            <li key={meal.id}>
              <MealCard meal={meal} locale={locale} t={cardLabels} compact />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-[var(--radius-lg)] bg-paper p-10 text-center ring-1 ring-line">
          <p className="font-display text-xl font-bold">{t.empty}</p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold underline underline-offset-4"
            onClick={() => {
              setCategory("tous");
              setRotation("toutes");
              setQuery("");
            }}
          >
            {t.reset}
          </button>
        </div>
      )}
    </div>
  );
}
