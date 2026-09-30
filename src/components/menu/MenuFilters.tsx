"use client";

import { menuFilters } from "@/data/menu";
import type { MealCategory } from "@/lib/types";
import { cn } from "@/lib/cn";

export type FilterValue = "tous" | MealCategory;

export function MenuFilters({
  value,
  counts,
  onChange,
}: {
  value: FilterValue;
  counts: Record<FilterValue, number>;
  onChange: (value: FilterValue) => void;
}) {
  return (
    <div role="group" aria-label="Filtrer par catégorie" className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
      {menuFilters
        .filter((f) => counts[f.value] > 0)
        .map((f) => {
          const active = f.value === value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(f.value)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                active ? "bg-charcoal text-cream" : "bg-paper text-charcoal ring-1 ring-line ring-inset hover:ring-charcoal",
              )}
            >
              {f.label}
              <span className={cn("text-xs tabular-nums", active ? "text-cream/70" : "text-ink-soft")}>{counts[f.value]}</span>
            </button>
          );
        })}
    </div>
  );
}
