"use client";

import { useId, useState } from "react";
import { Check, RefreshCw, Pencil, X, CalendarDays } from "lucide-react";
import type { Meal } from "@/lib/types";
import { categoryLabels } from "@/data/menu";
import { cn } from "@/lib/cn";

/**
 * Démonstration interactive du flux « Garder / Modifier mon menu ».
 *
 * C'est une préfiguration du futur écran « Mon menu » du portail client :
 * la même logique (menu proposé → remplacer → confirmer) sera branchée
 * sur la table `monthly_menus` de Supabase.
 */

export interface PlannerDay {
  label: string;
  date: string;
  mealId: string;
}

type Mode = "review" | "edit" | "confirmed";

export function MenuPlanner({
  meals,
  initialDays,
  monthLabel,
  deadlineLabel,
}: {
  meals: Pick<Meal, "id" | "name" | "category">[];
  initialDays: PlannerDay[];
  monthLabel: string;
  deadlineLabel: string;
}) {
  const [days, setDays] = useState(initialDays);
  const [mode, setMode] = useState<Mode>("review");
  const [picking, setPicking] = useState<number | null>(null);
  const [changed, setChanged] = useState<Set<number>>(new Set());
  const listId = useId();

  const byId = new Map(meals.map((m) => [m.id, m]));
  const alternatives = picking === null ? [] : meals.filter((m) => !days.some((d) => d.mealId === m.id));

  const replace = (dayIndex: number, mealId: string) => {
    setDays((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, mealId } : d)));
    setChanged((prev) => new Set(prev).add(dayIndex));
    setPicking(null);
  };

  const reset = () => {
    setDays(initialDays);
    setChanged(new Set());
    setPicking(null);
    setMode("review");
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] bg-paper text-charcoal shadow-[var(--shadow-lift)] ring-1 ring-line">
      {/* En-tête façon application */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream/60 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-olive text-cream">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-display text-lg leading-tight font-bold">Menu de {monthLabel}</p>
            <p className="text-xs text-ink-soft">Semaine 1 · Exemple de démonstration</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold",
            mode === "confirmed" ? "bg-olive text-cream" : "bg-saffron-soft text-charcoal",
          )}
          aria-live="polite"
        >
          {mode === "confirmed" ? "Confirmé" : `À confirmer avant le ${deadlineLabel}`}
        </span>
      </div>

      {/* Jours */}
      <ol className="divide-y divide-line">
        {days.map((day, i) => {
          const meal = byId.get(day.mealId);
          const isPicking = picking === i;
          return (
            <li key={day.label} className={cn("transition-colors", isPicking && "bg-cream/70")}>
              <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
                <div className="w-14 shrink-0 sm:w-20">
                  <p className="eyebrow text-[0.68rem] text-coral-ink">{day.label}</p>
                  <p className="text-xs text-ink-soft">{day.date}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="leading-snug font-semibold">{meal?.name}</p>
                  {changed.has(i) && (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-olive">
                      <RefreshCw aria-hidden="true" className="size-3" /> Repas remplacé
                    </p>
                  )}
                </div>
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={() => setPicking(isPicking ? null : i)}
                    aria-expanded={isPicking}
                    aria-controls={isPicking ? listId : undefined}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors",
                      isPicking ? "bg-charcoal text-cream" : "bg-cream-deep hover:bg-saffron",
                    )}
                  >
                    {isPicking ? "Annuler" : "Remplacer"}
                  </button>
                )}
                {mode === "confirmed" && <Check aria-label="Confirmé" className="size-5 shrink-0 text-olive" strokeWidth={2.5} />}
              </div>

              {isPicking && (
                <div id={listId} className="px-5 pb-5 sm:px-6">
                  <p className="mb-2 text-xs font-semibold text-ink-soft">Choisissez une alternative :</p>
                  <ul className="grid max-h-56 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                    {alternatives.map((alt) => (
                      <li key={alt.id}>
                        <button
                          type="button"
                          onClick={() => replace(i, alt.id)}
                          className="flex w-full flex-col items-start rounded-[var(--radius-sm)] bg-paper px-3 py-2.5 text-left ring-1 ring-line transition-colors hover:ring-olive focus-visible:ring-olive"
                        >
                          <span className="text-sm leading-snug font-semibold">{alt.name}</span>
                          <span className="text-[0.7rem] text-ink-soft">{categoryLabels[alt.category]}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t border-line bg-cream/60 p-4 sm:flex-row sm:p-5">
        {mode === "review" && (
          <>
            <button
              type="button"
              onClick={() => setMode("confirmed")}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-olive font-semibold text-cream transition-colors hover:bg-olive-deep"
            >
              <Check aria-hidden="true" className="size-4" strokeWidth={2.5} /> Garder mon menu
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-paper font-semibold ring-1 ring-line ring-inset transition-colors hover:ring-charcoal"
            >
              <Pencil aria-hidden="true" className="size-4" /> Modifier mon menu
            </button>
          </>
        )}
        {mode === "edit" && (
          <>
            <button
              type="button"
              onClick={() => {
                setPicking(null);
                setMode("confirmed");
              }}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-olive font-semibold text-cream transition-colors hover:bg-olive-deep"
            >
              <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
              Confirmer {changed.size > 0 ? `(${changed.size} changement${changed.size > 1 ? "s" : ""})` : "le menu"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold text-ink-soft hover:text-charcoal"
            >
              <X aria-hidden="true" className="size-4" /> Annuler
            </button>
          </>
        )}
        {mode === "confirmed" && (
          <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm font-semibold text-olive" role="status">
              C&apos;est confirmé. Vous n&apos;avez rien d&apos;autre à faire.
            </p>
            <button type="button" onClick={reset} className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-charcoal">
              Recommencer la démo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
