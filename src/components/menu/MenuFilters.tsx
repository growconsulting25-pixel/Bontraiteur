"use client";

import { menuFilterOrder } from "@/data/menu";
import type { MealCategory } from "@/lib/types";
import { cn } from "@/lib/cn";

export type FilterValue = "tous" | MealCategory;

export function MenuFilters({
  value,
  counts,
  labels,
  ariaLabel,
  onChange,
}: {
  value: FilterValue;
  counts: Record<FilterValue, number>;
  labels: Record<FilterValue, string>;
  ariaLabel: string;
  onChange: (value: FilterValue) => void;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
      {menuFilterOrder
        .filter((f) => counts[f] > 0)
        .map((f) => {
          const active = f === value;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(f)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                active ? "bg-charcoal text-cream" : "bg-paper text-charcoal ring-1 ring-line ring-inset hover:ring-charcoal",
              )}
            >
              {labels[f]}
              <span className={cn("text-xs tabular-nums", active ? "text-cream/70" : "text-ink-soft")}>{counts[f]}</span>
            </button>
          );
        })}
    </div>
  );
}
