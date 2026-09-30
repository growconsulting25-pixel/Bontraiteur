"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, Lock } from "lucide-react";
import { confirmMenu, replaceMeal } from "@/lib/actions/portal";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { MonthlyMenuStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/cn";

export interface EditorDay {
  id: string;
  dateLabel: string;
  weekLabel: string;
  mealId: string;
  mealName: string;
  dessertName: string | null;
  originalMealName: string | null;
}

/**
 * « Mon menu » : garder le menu en un clic, ou remplacer un repas.
 * Les règles (rôle, date limite, repas valide) sont vérifiées par la base.
 */
export function MonthlyMenuEditor({
  menuId,
  status,
  days,
  alternatives,
  editable,
  confirmedLabel,
  t,
  statusLabels,
}: {
  menuId: string;
  status: MonthlyMenuStatus;
  days: EditorDay[];
  alternatives: Array<{ id: string; name: string; category: string }>;
  editable: boolean;
  confirmedLabel: string | null;
  t: Dictionary["portal"]["menu"];
  statusLabels: Record<MonthlyMenuStatus, string>;
}) {
  const router = useRouter();
  const [picking, setPicking] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean }>) =>
    startTransition(async () => {
      setError(false);
      const result = await fn();
      if (!result.ok) setError(true);
      setPicking(null);
      router.refresh();
    });

  const confirmed = status === "confirme" || status === "modifie";
  const weeks = days.reduce<Array<{ label: string; days: EditorDay[] }>>((acc, day) => {
    const last = acc[acc.length - 1];
    if (last && last.label === day.weekLabel) last.days.push(day);
    else acc.push({ label: day.weekLabel, days: [day] });
    return acc;
  }, []);

  return (
    <div aria-busy={pending}>
      <div className="mb-6 flex flex-col gap-3 rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              confirmed ? "bg-olive text-cream" : "bg-saffron text-charcoal",
            )}
          >
            {confirmed ? <Check aria-hidden="true" className="size-5" strokeWidth={3} /> : <RefreshCw aria-hidden="true" className="size-5" />}
          </span>
          <div>
            <p className="font-display text-lg font-bold">{statusLabels[status]}</p>
            {confirmedLabel && <p className="text-sm text-ink-soft">{confirmedLabel}</p>}
          </div>
        </div>
        {editable && !confirmed && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => confirmMenu(menuId))}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-olive px-6 font-semibold text-cream transition-colors hover:bg-olive-deep disabled:opacity-60"
          >
            <Check aria-hidden="true" className="size-4" strokeWidth={2.5} /> {t.keep}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-[var(--radius-md)] bg-coral-soft p-4 text-sm text-coral-ink">
          {t.error}
        </p>
      )}

      <div className="grid gap-8">
        {weeks.map((week) => (
          <section key={week.label} aria-label={week.label}>
            <h2 className="mb-3 text-xs font-bold tracking-[0.1em] text-ink-soft uppercase">{week.label}</h2>
            <ol className="divide-y divide-line overflow-hidden rounded-[var(--radius-lg)] bg-paper ring-1 ring-line">
              {week.days.map((day) => {
                const isPicking = picking === day.id;
                return (
                  <li key={day.id} className={cn(isPicking && "bg-cream/70")}>
                    <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
                      <p className="w-28 shrink-0 text-sm font-semibold text-coral-ink sm:w-40">{day.dateLabel}</p>
                      <div className="min-w-0 flex-1">
                        <p className="leading-snug font-semibold">{day.mealName}</p>
                        {day.dessertName && (
                          <p className="text-sm text-ink-soft">
                            {t.dessert} : {day.dessertName}
                          </p>
                        )}
                        {day.originalMealName && (
                          <p className="mt-0.5 text-xs font-semibold text-olive">
                            {t.replaced} · {t.original.replace("{meal}", day.originalMealName)}
                          </p>
                        )}
                      </div>
                      {editable ? (
                        <button
                          type="button"
                          onClick={() => setPicking(isPicking ? null : day.id)}
                          aria-expanded={isPicking}
                          disabled={pending}
                          className={cn(
                            "shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors",
                            isPicking ? "bg-charcoal text-cream" : "bg-cream-deep hover:bg-saffron",
                          )}
                        >
                          {isPicking ? t.cancel : t.replace}
                        </button>
                      ) : (
                        <Lock aria-hidden="true" className="size-4 shrink-0 text-ink-soft" />
                      )}
                    </div>
                    {isPicking && (
                      <div className="px-4 pb-5 sm:px-5">
                        <p className="mb-2 text-xs font-semibold text-ink-soft">{t.chooseAlternative}</p>
                        <ul className="grid max-h-72 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                          {alternatives
                            .filter((a) => a.id !== day.mealId)
                            .map((alt) => (
                              <li key={alt.id}>
                                <button
                                  type="button"
                                  disabled={pending}
                                  onClick={() => run(() => replaceMeal(day.id, alt.id))}
                                  className="flex w-full flex-col items-start rounded-[var(--radius-sm)] bg-paper px-3 py-2.5 text-left ring-1 ring-line transition-colors hover:ring-olive"
                                >
                                  <span className="text-sm leading-snug font-semibold">{alt.name}</span>
                                  <span className="text-[0.7rem] text-ink-soft">{alt.category}</span>
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
          </section>
        ))}
      </div>
    </div>
  );
}
