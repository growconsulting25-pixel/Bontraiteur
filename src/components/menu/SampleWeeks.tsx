import { mealName } from "@/lib/meal-name";
import { allergenTone, allergenToneClass } from "@/lib/allergen-tone";
import { SAMPLE_SLOTS, type SampleDay } from "@/lib/menu-sample";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import type { Meal } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Exemple de menu sur 2 semaines, en lecture seule (comme le menu imprimé). */
export function SampleWeeks({
  weeks,
  locale,
  t,
  cal,
}: {
  weeks: SampleDay[][];
  locale: Locale;
  t: Dictionary["menu"];
  cal: Dictionary["calendar"];
}) {
  const cell = (meal: Meal | undefined, big = false) => {
    const tone = meal ? allergenTone(meal.allergens) : null;
    return (
      <div
        className={cn(
          "flex h-full items-center rounded-[var(--radius-sm)] px-3 py-2.5 leading-snug font-semibold ring-1",
          big ? "min-h-20 text-[0.95rem]" : "min-h-12 text-sm",
          tone ? allergenToneClass[tone] : "bg-paper ring-line",
        )}
      >
        {meal ? mealName(meal, locale) : "—"}
      </div>
    );
  };

  return (
    <div className="grid gap-10">
      {weeks.map((days, w) => (
        <div key={w}>
          <h3 className="font-display text-xl font-bold">{t.sampleWeek.replace("{n}", String(w + 1))}</h3>

          {/* Ordinateur / tablette : grille comme le menu affiché */}
          <div className="mt-4 hidden gap-2 md:grid md:grid-cols-[7.5rem_repeat(5,1fr)]">
            <span />
            {cal.days.map((d) => (
              <div key={d} className="rounded-[var(--radius-sm)] bg-olive px-3 py-2.5 text-center font-display font-bold text-cream">
                {d}
              </div>
            ))}
            {SAMPLE_SLOTS.map((slot) => (
              <div key={slot} className="contents">
                <div className="flex items-center rounded-[var(--radius-sm)] bg-olive-soft px-3 text-xs font-bold text-olive-deep">{cal.slots[slot]}</div>
                {days.map((day, i) => (
                  <div key={i}>{cell(day[slot], slot === "repas")}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Téléphone : une carte par jour */}
          <ul className="mt-4 grid gap-3 md:hidden">
            {days.map((day, i) => (
              <li key={i} className="rounded-[var(--radius-lg)] bg-paper p-4 ring-1 ring-line">
                <p className="font-display font-bold text-olive">{cal.days[i]}</p>
                <dl className="mt-3 grid gap-2">
                  {SAMPLE_SLOTS.map((slot) => (
                    <div key={slot}>
                      <dt className="mb-1 text-[0.68rem] font-bold tracking-[0.08em] text-ink-soft uppercase">{cal.slots[slot]}</dt>
                      <dd>{cell(day[slot])}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="font-semibold">{t.legendTitle} :</span>
        {(
          [
            ["milkEggs", cal.legendMilkEggs],
            ["milk", cal.legendMilk],
            ["eggs", cal.legendEggs],
            ["fish", cal.legendFish],
          ] as const
        ).map(([k, label]) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className={cn("h-3.5 w-6 rounded-sm ring-1", allergenToneClass[k])} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
