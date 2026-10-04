"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Printer, RotateCcw, Search, X, Hand } from "lucide-react";
import { confirmMenu, setMenuSlot, setWatchedAllergens } from "@/lib/actions/portal";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import type { MenuSlot, MonthlyMenuStatus } from "@/lib/supabase/types";
import type { Allergen } from "@/lib/types";
import { cn } from "@/lib/cn";
import { allergenTone, allergenToneClass, type AllergenTone } from "@/lib/allergen-tone";

/**
 * CALENDRIER DE MENU INTERACTIF
 *
 * Trois façons de changer un plat, au choix de la personne :
 *   1. toucher une case → liste de choix (fonctionne partout, au clavier aussi) ;
 *   2. glisser un plat de la bande « Nos plats » vers une case (ordinateur) ;
 *   3. toucher un plat de la bande, puis toucher les jours où le placer
 *      (téléphone/tablette — et plus rapide pour placer un plat plusieurs fois).
 * Chaque changement est enregistré tout de suite (avec « Annuler »).
 * Les règles (rôle, date limite, type de plat) sont vérifiées par la base.
 */

export type CalendarMealType = "repas" | "dessert" | "collation";

export interface CalendarMeal {
  id: string;
  name: string;
  category: string;
  type: CalendarMealType;
  allergens: Allergen[];
}

export interface CalendarDay {
  id: string;
  date: string; // YYYY-MM-DD
  slots: Record<MenuSlot, string | null>;
  originals: Partial<Record<MenuSlot, string | null>>;
}

const SLOT_ORDER: MenuSlot[] = ["collation_am", "repas", "dessert", "collation_pm"];
const slotType = (slot: MenuSlot): CalendarMealType => (slot === "repas" ? "repas" : slot === "dessert" ? "dessert" : "collation");
const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

type Tone = AllergenTone;
const toneClass = allergenToneClass;

function mondayOf(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function MenuCalendar({
  locale,
  menuId,
  status,
  initialDays,
  meals,
  editable,
  mode,
  t,
  statusLabels,
  monthLabel,
  establishmentName,
  demo = false,
  establishmentId,
  initialWatched = [],
  canEditWatched = false,
}: {
  locale: Locale;
  menuId: string;
  status: MonthlyMenuStatus;
  initialDays: CalendarDay[];
  meals: CalendarMeal[];
  editable: boolean;
  mode: "client" | "staff";
  t: Dictionary["calendar"];
  statusLabels: Record<MonthlyMenuStatus, string>;
  monthLabel: string;
  establishmentName: string;
  /** Démonstration (site public) : rien n'est enregistré. */
  demo?: boolean;
  /** Allergènes présents dans les groupes de la garderie. */
  establishmentId?: string;
  initialWatched?: Allergen[];
  canEditWatched?: boolean;
}) {
  const router = useRouter();
  const [days, setDays] = useState(initialDays);
  const [menuStatus, setMenuStatus] = useState(status);
  const [pendingCells, setPendingCells] = useState<Set<string>>(new Set());
  const [picker, setPicker] = useState<{ dayId: string; slot: MenuSlot } | null>(null);
  const [placing, setPlacing] = useState<CalendarMeal | null>(null);
  const [dragging, setDragging] = useState<CalendarMeal | null>(null);
  const [toast, setToast] = useState<{ text: string; undo?: () => void; error?: boolean } | null>(null);
  const [confirming, startConfirm] = useTransition();
  const [coarse, setCoarse] = useState(false);
  const [watched, setWatched] = useState<Allergen[]>(initialWatched);
  const allergenLabel: Record<Allergen, string> = { lait: t.legendMilk, oeufs: t.legendEggs, poisson: t.legendFish };
  const flagged = (m: CalendarMeal | undefined) => (m ? m.allergens.filter((a) => watched.includes(a)) : []);

  const toggleWatched = (a: Allergen) => {
    const next = watched.includes(a) ? watched.filter((x) => x !== a) : [...watched, a];
    const before = watched;
    setWatched(next);
    if (!demo && establishmentId)
      setWatchedAllergens(establishmentId, next).then((res) => {
        if (!res.ok) {
          setWatched(before);
          setToast({ text: t.error, error: true });
        }
      });
  };

  // Référence toujours à jour (les boutons « Annuler » sont créés avant le changement suivant)
  const daysRef = useRef(days);
  daysRef.current = days;

  useEffect(() => setDays(initialDays), [initialDays]);
  useEffect(() => setMenuStatus(status), [status]);
  useEffect(() => setCoarse(window.matchMedia("(pointer: coarse)").matches), []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  const mealById = useMemo(() => new Map(meals.map((m) => [m.id, m])), [meals]);
  const dateTag = locale === "en" ? "en-CA" : "fr-CA";
  const dayLabel = useCallback(
    (date: string) => {
      const s = new Intl.DateTimeFormat(dateTag, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    [dateTag],
  );
  const shortDate = (date: string) => new Intl.DateTimeFormat(dateTag, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

  // Semaines (lundi → vendredi) ; les jours sans menu restent vides
  const weeks = useMemo(() => {
    const byDate = new Map(days.map((d) => [d.date, d]));
    const mondays = [...new Set(days.map((d) => mondayOf(d.date)))].sort();
    return mondays.map((monday) => ({ monday, days: [0, 1, 2, 3, 4].map((i) => ({ date: addDays(monday, i), day: byDate.get(addDays(monday, i)) })) }));
  }, [days]);

  const changesCount = days.reduce((n, d) => n + Object.keys(d.originals).length, 0);
  const confirmed = menuStatus === "confirme" || menuStatus === "modifie";
  const showConfirmBar = mode === "client" && editable && !confirmed && changesCount > 0;

  /* ---------------- Changer une case (optimiste + annuler) ---------------- */
  const applyRef = useRef<(dayId: string, slot: MenuSlot, mealId: string | null, opts?: { silent?: boolean }) => void>(() => {});
  const apply = useCallback(
    (dayId: string, slot: MenuSlot, mealId: string | null, opts: { silent?: boolean } = {}) => {
      const day = daysRef.current.find((d) => d.id === dayId);
      if (!day) return;
      const previous = day.slots[slot];
      const hasOriginal = slot in day.originals;
      const target = mealId ?? (hasOriginal ? day.originals[slot]! : previous);
      if (target === previous) return;

      const cell = `${dayId}:${slot}`;
      setDays((ds) =>
        ds.map((d) => {
          if (d.id !== dayId) return d;
          const originals = { ...d.originals };
          if (mode === "client") {
            if (hasOriginal && target === d.originals[slot]) delete originals[slot];
            else if (!hasOriginal) originals[slot] = previous;
          }
          return { ...d, slots: { ...d.slots, [slot]: target }, originals };
        }),
      );
      if (mode === "client" && confirmed) setMenuStatus("publie");
      setPendingCells((s) => new Set(s).add(cell));

      (demo ? Promise.resolve({ ok: true as const }) : setMenuSlot(dayId, slot, mealId))
        .then((res) => {
          if (!res.ok) throw new Error(res.error);
          if (!opts.silent) {
            const when = dayLabel(day.date).toLowerCase();
            setToast({
              text: mealId ? fill(t.changed, { meal: mealById.get(target!)?.name ?? "", day: when }) : fill(t.restored, { day: when }),
              // Annuler = remettre la valeur précédente (ou effacer l'historique si c'était l'origine)
              undo: () => applyRef.current(dayId, slot, hasOriginal ? previous : null, { silent: true }),
            });
          }
        })
        .catch(() => {
          setDays((ds) => ds.map((d) => (d.id === dayId ? day : d)));
          setToast({ text: t.error, error: true });
        })
        .finally(() => {
          setPendingCells((s) => {
            const n = new Set(s);
            n.delete(cell);
            return n;
          });
          if (!demo) router.refresh();
        });
    },
    [mode, confirmed, t, mealById, dayLabel, router, demo],
  );
  applyRef.current = apply;

  const onConfirm = () =>
    startConfirm(async () => {
      const res = demo ? { ok: true } : await confirmMenu(menuId);
      if (res.ok) {
        setMenuStatus(changesCount > 0 ? "modifie" : "confirme");
        if (!demo) router.refresh();
      } else setToast({ text: t.error, error: true });
    });

  /** Remplace un plat dans plusieurs jours d'un coup (« Remplacer partout ce mois-ci »). */
  const applyMany = (targets: Array<{ dayId: string; slot: MenuSlot }>, mealId: string) => {
    const snapshot = targets.map(({ dayId, slot }) => {
      const day = daysRef.current.find((d) => d.id === dayId)!;
      return { dayId, slot, previous: day.slots[slot], hasOriginal: slot in day.originals };
    });
    targets.forEach(({ dayId, slot }) => apply(dayId, slot, mealId, { silent: true }));
    setToast({
      text: fill(t.replacedAll, { meal: mealById.get(mealId)?.name ?? "", count: targets.length }),
      undo: () => snapshot.forEach((x) => applyRef.current(x.dayId, x.slot, x.hasOriginal ? x.previous : null, { silent: true })),
    });
  };

  /* ---------------- Rendu ---------------- */
  const activeType = (dragging ?? placing)?.type ?? null;

  const cellButton = (date: string, day: CalendarDay | undefined, slot: MenuSlot, compact = false) => {
    if (!day) return <div className={cn("rounded-[var(--radius-sm)] border border-dashed border-line/70", slotHeight(slot))} aria-hidden="true" />;
    const mealId = day.slots[slot];
    const meal = mealId ? mealById.get(mealId) : undefined;
    const tone = meal ? allergenTone(meal.allergens) : null;
    const modified = slot in day.originals;
    // Changé mais pas encore confirmé : couleur bien différente, et on voit le plat d'avant
    const awaiting = modified && mode === "client" && !confirmed;
    const before = modified ? day.originals[slot] : undefined;
    const beforeName = before ? (mealById.get(before)?.name ?? t.empty) : t.empty;
    const cell = `${day.id}:${slot}`;
    const pending = pendingCells.has(cell);
    const compatible = activeType === slotType(slot);
    const canDrop = editable && compatible;

    return (
      <button
        type="button"
        disabled={!editable && !meal}
        draggable={editable && !!meal}
        onDragStart={(e) => {
          if (!meal) return;
          e.dataTransfer.setData("text/plain", meal.id);
          e.dataTransfer.effectAllowed = "copy";
          setDragging(meal);
        }}
        onDragEnd={() => setDragging(null)}
        onDragOver={(e) => {
          if (canDrop) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          const m = mealById.get(id);
          setDragging(null);
          if (m && editable && m.type === slotType(slot)) apply(day.id, slot, m.id);
        }}
        onClick={() => {
          if (!editable) return;
          if (placing) {
            if (placing.type === slotType(slot)) apply(day.id, slot, placing.id);
            return;
          }
          setPicker({ dayId: day.id, slot });
        }}
        aria-label={`${dayLabel(date)}, ${t.slots[slot]} : ${meal?.name ?? t.empty}${modified ? ` (${awaiting ? t.pendingTag : t.modified} — ${fill(t.before, { meal: beforeName })})` : ""}${flagged(meal).length ? ` — ${fill(t.contains, { list: flagged(meal).map((a) => allergenLabel[a]).join(", ") })}` : ""}`}
        className={cn(
          "group/cell relative flex w-full flex-col justify-center rounded-[var(--radius-sm)] px-2.5 py-2 text-left ring-1 transition-[box-shadow,background-color,opacity,transform] duration-200",
          slotHeight(slot),
          awaiting ? "bg-charcoal ring-2 ring-saffron" : tone ? toneClass[tone] : "bg-paper ring-line",
          modified && !awaiting && "ring-2 ring-olive",
          editable && !activeType && "hover:-translate-y-px hover:shadow-[var(--shadow-soft)] hover:ring-charcoal/40",
          activeType && (canDrop ? "ring-2 ring-olive ring-offset-2 ring-offset-cream" : "opacity-40"),
          placing && canDrop && "animate-[pulse_1.6s_ease-in-out_infinite]",
          pending && "opacity-60",
          !editable && "cursor-default",
        )}
      >
        {compact && <span className="mb-0.5 text-[0.62rem] font-bold tracking-[0.08em] text-charcoal/60 uppercase">{t.slots[slot]}</span>}
        <span className={cn("leading-snug font-semibold", awaiting ? "text-cream" : "text-charcoal", slot === "repas" ? "text-[0.9rem]" : "text-[0.8rem]", modified && "pr-14")}>
          {meal?.name ?? t.empty}
        </span>
        {awaiting && slot === "repas" && (
          <span className="mt-0.5 line-clamp-1 text-[0.68rem] text-cream/70">
            {fill(t.before, { meal: "" })}
            <s>{beforeName}</s>
          </span>
        )}
        {flagged(meal).length > 0 && (
          <span className={cn("mt-1 inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.62rem] font-bold", awaiting ? "bg-cream text-charcoal" : "bg-charcoal text-cream")}>
            <AlertTriangle aria-hidden="true" className="size-3 text-saffron" />
            {fill(t.contains, { list: flagged(meal).map((a) => allergenLabel[a].toLowerCase()).join(", ") })}
          </span>
        )}
        {modified && (
          <span
            className={cn(
              "absolute top-1 right-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.58rem] font-bold uppercase",
              awaiting ? "bg-saffron text-charcoal" : "bg-olive text-cream",
            )}
          >
            {awaiting ? t.pendingTag : t.modified}
          </span>
        )}
      </button>
    );
  };

  const pickerDay = picker ? days.find((d) => d.id === picker.dayId) : undefined;

  return (
    <div className="relative">
      {/* Barre d'état + actions */}
      <div className="mb-5 flex flex-col gap-3 rounded-[var(--radius-lg)] bg-paper p-4 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between sm:p-5 print:hidden">
        <div className="flex items-center gap-3">
          <span className={cn("flex size-10 items-center justify-center rounded-full", confirmed ? "bg-olive text-cream" : "bg-saffron")}>
            {confirmed ? <Check aria-hidden="true" className="size-5" strokeWidth={3} /> : <RotateCcw aria-hidden="true" className="size-5" />}
          </span>
          <div>
            <p className="font-display text-lg font-bold" aria-live="polite">
              {mode === "staff" ? t.staffMode.split(":")[0] : statusLabels[menuStatus]}
            </p>
            <p className="text-sm text-ink-soft">
              {mode === "staff" ? t.staffMode : changesCount > 0 ? fill(t.changesCount, { count: changesCount, plural: changesCount > 1 ? "s" : "" }) : editable ? "" : t.readOnlyHint}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-line hover:ring-charcoal"
          >
            <Printer aria-hidden="true" className="size-4" /> {t.print}
          </button>
          {mode === "client" && editable && !confirmed && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirming || pendingCells.size > 0}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-olive px-5 text-sm font-semibold text-cream hover:bg-olive-deep disabled:opacity-60"
            >
              <Check aria-hidden="true" className="size-4" strokeWidth={2.5} /> {changesCount > 0 ? t.confirmChanges : t.keep}
            </button>
          )}
        </div>
      </div>

      {/* Allergies présentes dans les groupes de la garderie */}
      {(canEditWatched || watched.length > 0) && (
        <div className="mb-5 flex flex-col gap-2 rounded-[var(--radius-lg)] bg-paper px-4 py-3 ring-1 ring-line sm:flex-row sm:items-center sm:gap-4 print:hidden">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle aria-hidden="true" className="size-4 text-coral-ink" /> {t.watchTitle}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.watchTitle}>
            {(["lait", "oeufs", "poisson"] as Allergen[]).map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={watched.includes(a)}
                disabled={!canEditWatched}
                onClick={() => toggleWatched(a)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition-colors disabled:cursor-default",
                  watched.includes(a) ? "bg-charcoal text-cream ring-charcoal" : "bg-cream ring-line hover:ring-charcoal",
                )}
              >
                {watched.includes(a) && <Check aria-hidden="true" className="mr-1 inline size-3.5" strokeWidth={3} />}
                {allergenLabel[a]}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-soft sm:ml-auto sm:max-w-xs">{t.watchHelp}</p>
        </div>
      )}

      {/* Bande « Nos plats » (glisser / toucher-placer) */}
      {editable && (
        <Palette
          watched={watched}
          sticky={!demo}
          meals={meals}
          t={t}
          coarse={coarse}
          placing={placing}
          onPlace={(m) => setPlacing((p) => (p?.id === m.id ? null : m))}
          onDragStart={setDragging}
          onDragEnd={() => setDragging(null)}
        />
      )}

      {placing && (
        <div role="status" className="sticky top-[5.5rem] z-20 mb-4 flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-charcoal px-4 py-3 text-sm text-cream shadow-[var(--shadow-lift)] lg:top-3 print:hidden">
          <span className="flex items-center gap-2">
            <Hand aria-hidden="true" className="size-4 shrink-0 text-saffron" />
            {fill(t.placing, { slot: placing.type === "repas" ? t.slots.repas : placing.type === "dessert" ? t.slots.dessert : t.paletteTabs.collation, meal: placing.name })}
          </span>
          <button type="button" onClick={() => setPlacing(null)} className="shrink-0 rounded-full bg-saffron px-3 py-1.5 font-bold text-charcoal">
            {t.placingDone}
          </button>
        </div>
      )}

      {/* Semaines : balayer, flèches ou pastilles */}
      <WeekCarousel
        weeks={weeks}
        t={t}
        shortDate={shortDate}
        renderWeek={(week) => (
          <>
            {/* Ordinateur / tablette : grille comme le menu affiché */}
            <div className="hidden md:grid md:grid-cols-[7.5rem_repeat(5,minmax(0,1fr))] md:gap-2">
              <div />
              {week.days.map(({ date }, i) => (
                <div key={date} className="rounded-[var(--radius-sm)] bg-olive px-2 py-2 text-center text-cream">
                  <p className="font-display text-sm font-bold">{t.days[i]}</p>
                  <p className="text-xs text-cream/75">{shortDate(date)}</p>
                </div>
              ))}
              {(["collation_am", "repas", "dessert", "collation_pm"] as MenuSlot[]).map((slot) => (
                <Row key={slot} label={slot === "repas" ? t.rowMeal : slot === "dessert" ? "" : t.slots[slot]} slot={slot}>
                  {week.days.map(({ date, day }) => (
                    <div key={date}>{cellButton(date, day, slot)}</div>
                  ))}
                </Row>
              ))}
            </div>

            {/* Téléphone : une carte par jour */}
            <ol className="grid gap-3 md:hidden">
              {week.days
                .filter(({ day }) => day)
                .map(({ date, day }) => (
                  <li key={date} className="rounded-[var(--radius-lg)] bg-paper p-3 ring-1 ring-line">
                    <p className="mb-2 font-display font-bold text-olive">{dayLabel(date)}</p>
                    <div className="grid gap-1.5">
                      {SLOT_ORDER.map((slot) => (
                        <div key={slot}>{cellButton(date, day, slot, true)}</div>
                      ))}
                    </div>
                  </li>
                ))}
            </ol>
          </>
        )}
      />

      {/* Barre de confirmation : visible tant que des changements attendent */}
      {showConfirmBar && (
        <div
          role="status"
          className="sticky bottom-24 z-30 mt-5 flex flex-col gap-3 rounded-[var(--radius-lg)] bg-charcoal p-4 text-cream shadow-[var(--shadow-lift)] ring-2 ring-saffron sm:flex-row sm:items-center sm:justify-between print:hidden"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-saffron font-display font-extrabold text-charcoal">
              {changesCount}
            </span>
            <div>
              <p className="font-display font-bold">{fill(t.pendingTitle, { count: changesCount, plural: changesCount > 1 ? "s" : "" })}</p>
              <p className="text-sm text-cream/75">{t.pendingHelp}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming || pendingCells.size > 0}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-saffron px-5 text-sm font-bold text-charcoal hover:bg-saffron/90 disabled:opacity-60"
          >
            <Check aria-hidden="true" className="size-4" strokeWidth={2.5} /> {t.confirmPending}
          </button>
        </div>
      )}

      <Legend meals={meals} days={days} t={t} showChanges={mode === "client"} />

      {/* Liste de choix (toucher une case) */}
      {picker && pickerDay && (
        <Picker
          watched={watched}
          sameCount={
            pickerDay.slots[picker.slot]
              ? days.filter((d) => d.id !== pickerDay.id && d.slots[picker.slot] === pickerDay.slots[picker.slot]).length
              : 0
          }
          title={fill(t.pickTitle, { day: dayLabel(pickerDay.date), slot: t.slots[picker.slot] })}
          currentId={pickerDay.slots[picker.slot]}
          proposedId={picker.slot in pickerDay.originals ? (pickerDay.originals[picker.slot] ?? null) : undefined}
          meals={meals.filter((m) => m.type === slotType(picker.slot))}
          mealById={mealById}
          t={t}
          onClose={() => setPicker(null)}
          onChoose={(id, everywhere) => {
            const current = pickerDay.slots[picker.slot];
            if (everywhere && id && current) {
              const targets = days.filter((d) => d.slots[picker.slot] === current).map((d) => ({ dayId: d.id, slot: picker.slot }));
              applyMany(targets, id);
            } else apply(pickerDay.id, picker.slot, id);
            setPicker(null);
          }}
        />
      )}

      {/* Notification + annuler */}
      {toast && (
        <div
          role={toast.error ? "alert" : "status"}
          className={cn(
            "fixed inset-x-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-[var(--radius-md)] px-4 py-3 text-sm shadow-[var(--shadow-lift)] print:hidden",
            // au-dessus de la barre « à confirmer » quand elle est affichée
            showConfirmBar ? "bottom-[18.5rem] sm:bottom-48" : "bottom-24 sm:bottom-8",
            toast.error ? "bg-coral-soft text-coral-ink" : "bg-charcoal text-cream",
          )}
        >
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              type="button"
              onClick={() => {
                toast.undo?.();
                setToast(null);
              }}
              className="shrink-0 font-bold text-saffron underline underline-offset-4"
            >
              {t.undo}
            </button>
          )}
        </div>
      )}

      {/* Version imprimable pour les parents */}
      <PrintSheet weeks={weeks} mealById={mealById} t={t} title={fill(t.printTitle, { month: monthLabel, establishment: establishmentName })} shortDate={shortDate} />
    </div>
  );
}

const slotHeight = (slot: MenuSlot) => (slot === "repas" ? "min-h-24" : slot === "dessert" ? "min-h-11" : "min-h-14");

function Row({ label, slot, children }: { label: string; slot: MenuSlot; children: React.ReactNode }) {
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-center rounded-[var(--radius-sm)] px-2 text-center text-xs font-bold",
          slot === "dessert" ? "" : slot === "repas" ? "bg-cream-deep text-charcoal" : "bg-olive-soft text-olive-deep",
          slotHeight(slot),
        )}
      >
        {label}
      </div>
      {children}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Carrousel de semaines (scroll-snap natif : swipe, trackpad, flèches) */
/* ------------------------------------------------------------------ */
function WeekCarousel<W extends { monday: string }>({
  weeks,
  t,
  shortDate,
  renderWeek,
}: {
  weeks: W[];
  t: Dictionary["calendar"];
  shortDate: (d: string) => string;
  renderWeek: (week: W) => React.ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const go = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const index = Math.max(0, Math.min(weeks.length - 1, i));
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => setActive(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section aria-roledescription="carousel" className="print:hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]" role="tablist">
          {weeks.map((w, i) => (
            <button
              key={w.monday}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => go(i)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                i === active ? "bg-charcoal text-cream" : "bg-paper ring-1 ring-line hover:ring-charcoal",
              )}
            >
              {fill(t.week, { n: i + 1 })}
              <span className={cn("ml-1.5 hidden text-xs font-normal sm:inline", i === active ? "text-cream/70" : "text-ink-soft")}>{shortDate(w.monday)}</span>
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label={t.prevWeek} className="flex size-10 items-center justify-center rounded-full bg-paper ring-1 ring-line hover:ring-charcoal disabled:opacity-40">
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button type="button" onClick={() => go(active + 1)} disabled={active >= weeks.length - 1} aria-label={t.nextWeek} className="flex size-10 items-center justify-center rounded-full bg-paper ring-1 ring-line hover:ring-charcoal disabled:opacity-40">
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
      <div ref={scroller} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {weeks.map((w, i) => (
          <div
            key={w.monday}
            role="tabpanel"
            aria-label={fill(t.weekOf, { date: shortDate(w.monday) })}
            aria-hidden={i !== active}
            className="w-full shrink-0 snap-start px-0.5 py-2"
          >
            {renderWeek(w)}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bande « Nos plats »                                                  */
/* ------------------------------------------------------------------ */
function Palette({
  watched,
  sticky,
  meals,
  t,
  coarse,
  placing,
  onPlace,
  onDragStart,
  onDragEnd,
}: {
  watched: Allergen[];
  sticky: boolean;
  meals: CalendarMeal[];
  t: Dictionary["calendar"];
  coarse: boolean;
  placing: CalendarMeal | null;
  onPlace: (m: CalendarMeal) => void;
  onDragStart: (m: CalendarMeal) => void;
  onDragEnd: () => void;
}) {
  const [tab, setTab] = useState<CalendarMealType>("repas");
  const [query, setQuery] = useState("");
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const list = meals.filter((m) => m.type === tab && (!query || norm(m.name).includes(norm(query))));
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const updateEdges = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    updateEdges();
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab, query, expanded, updateEdges]);
  const scrollList = (dir: 1 | -1) => {
    const el = listRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "z-20 -mx-4 mb-5 border-y border-line bg-cream/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-[var(--radius-lg)] sm:border sm:px-4 print:hidden",
        sticky && "sticky top-16 lg:top-0",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-1 font-display font-bold">{t.paletteTitle}</p>
        {(["repas", "dessert", "collation"] as CalendarMealType[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={tab === k}
            onClick={() => setTab(k)}
            className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", tab === k ? "bg-charcoal text-cream" : "bg-paper ring-1 ring-line hover:ring-charcoal")}
          >
            {t.paletteTabs[k]}
          </button>
        ))}
        <label className="relative ml-auto w-full sm:w-56">
          <span className="sr-only">{t.search}</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="h-9 w-full rounded-full bg-paper pr-3 pl-9 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-charcoal"
          />
        </label>
      </div>
      {/* Mode d'emploi en 2 étapes, toujours visible */}
      <ol className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-saffron text-xs font-bold text-charcoal">1</span>
          {t.paletteStep1}
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-saffron text-xs font-bold text-charcoal">2</span>
          {coarse ? t.paletteStep2Touch : t.paletteStep2Desktop}
        </li>
      </ol>

      <div className="relative mt-3">
        <ul
          ref={listRef}
          onScroll={updateEdges}
          className={cn(
            "flex gap-2.5",
            expanded
              ? "max-h-72 flex-wrap overflow-y-auto pr-1"
              : "snap-x snap-mandatory scroll-px-1 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {list.length === 0 && <li className="py-2 text-sm text-ink-soft">{t.paletteNoResult}</li>}
          {list.map((m) => {
            const tone = allergenTone(m.allergens);
            const selected = placing?.id === m.id;
            return (
              <li key={m.id} className={cn(!expanded && "shrink-0 snap-start")}>
                <button
                  type="button"
                  draggable
                  title={m.name}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", m.id);
                    e.dataTransfer.effectAllowed = "copy";
                    onDragStart(m);
                  }}
                  onDragEnd={onDragEnd}
                  onClick={() => onPlace(m)}
                  aria-pressed={selected}
                  className={cn(
                    "flex min-h-11 cursor-grab items-center gap-2.5 rounded-[var(--radius-md)] py-2 pr-4 pl-3 text-left text-sm font-semibold shadow-sm ring-1 transition-[box-shadow,background-color] active:cursor-grabbing",
                    expanded ? "max-w-full" : "w-60",
                    selected ? "bg-charcoal text-cream ring-charcoal" : "bg-paper ring-line hover:shadow-md hover:ring-charcoal",
                  )}
                >
                  <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-full ring-1", tone ? toneClass[tone] : "bg-cream-deep ring-line")} />
                  <span className={cn("leading-snug", !expanded && "line-clamp-2")}>{m.name}</span>
                  {m.allergens.some((a) => watched.includes(a)) && <AlertTriangle aria-label="!" className="size-3.5 shrink-0 text-coral-ink" />}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Flèches + fondus : on voit qu'il y a d'autres plats à côté */}
        {!expanded && edges.left && (
          <>
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cream to-transparent" />
            <button
              type="button"
              onClick={() => scrollList(-1)}
              aria-label={t.palettePrev}
              className="absolute top-1/2 left-0 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-charcoal text-cream shadow-md"
            >
              <ChevronLeft className="size-5" />
            </button>
          </>
        )}
        {!expanded && edges.right && (
          <>
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream to-transparent" />
            <button
              type="button"
              onClick={() => scrollList(1)}
              aria-label={t.paletteNext}
              className="absolute top-1/2 right-0 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-charcoal text-cream shadow-md"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
        <span>
          {t.paletteCount.replace("{n}", String(list.length))}
          {!expanded && (edges.left || edges.right) && <> · {coarse ? t.paletteSwipeTouch : t.paletteSwipeDesktop}</>}
        </span>
        {list.length > 0 && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="font-semibold text-ink underline underline-offset-4 hover:text-charcoal">
            {expanded ? t.paletteShowLess : t.paletteShowAll}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Liste de choix d'une case                                            */
/* ------------------------------------------------------------------ */
function Picker({
  watched,
  sameCount,
  title,
  currentId,
  proposedId,
  meals,
  mealById,
  t,
  onClose,
  onChoose,
}: {
  watched: Allergen[];
  sameCount: number;
  title: string;
  currentId: string | null;
  proposedId: string | null | undefined;
  meals: CalendarMeal[];
  mealById: Map<string, CalendarMeal>;
  t: Dictionary["calendar"];
  onClose: () => void;
  onChoose: (id: string | null, everywhere?: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [everywhere, setEverywhere] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const filtered = meals.filter((m) => !query || norm(m.name).includes(norm(query)));
  const groups = filtered.reduce<Record<string, CalendarMeal[]>>((acc, m) => ({ ...acc, [m.category]: [...(acc[m.category] ?? []), m] }), {});

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-charcoal/40 sm:items-center sm:p-6 print:hidden" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)] bg-paper shadow-[var(--shadow-lift)] sm:rounded-[var(--radius-xl)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <p className="font-display text-lg leading-tight font-bold">{title}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {t.pickCurrent} : <strong className="text-charcoal">{currentId ? mealById.get(currentId)?.name : t.empty}</strong>
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={t.pickClose} className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-cream-deep">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        {proposedId !== undefined && (
          <button
            type="button"
            onClick={() => onChoose(null)}
            className="mx-5 mt-4 flex items-center gap-3 rounded-[var(--radius-md)] bg-olive-soft px-4 py-3 text-left text-sm font-semibold text-olive-deep hover:bg-olive-soft/70"
          >
            <RotateCcw aria-hidden="true" className="size-4 shrink-0" />
            <span>
              {t.pickRestore}
              <span className="block text-xs font-normal">{fill(t.pickProposed, { meal: proposedId ? (mealById.get(proposedId)?.name ?? "") : t.empty })}</span>
            </span>
          </button>
        )}
        {sameCount > 0 && currentId && (
          <label className="mx-5 mt-4 flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] bg-saffron-soft px-4 py-3 text-sm font-semibold">
            <input type="checkbox" checked={everywhere} onChange={(e) => setEverywhere(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-olive)]" />
            {fill(t.replaceAll, { count: sameCount, meal: mealById.get(currentId)?.name ?? "" })}
          </label>
        )}
        <label className="relative mx-5 mt-4 block">
          <span className="sr-only">{t.search}</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="h-11 w-full rounded-full bg-cream pr-3 pl-9 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-charcoal"
          />
        </label>
        <div className="mt-3 overflow-y-auto px-5 pb-5">
          {Object.entries(groups).map(([category, items]) => (
            <div key={category} className="mt-3">
              <p className="mb-1.5 text-[0.7rem] font-bold tracking-[0.1em] text-coral-ink uppercase">{category}</p>
              <ul className="grid gap-1.5">
                {items.map((m) => {
                  const tone = allergenTone(m.allergens);
                  const current = m.id === currentId;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => onChoose(m.id, everywhere)}
                        disabled={current}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left text-sm font-semibold ring-1 transition-colors",
                          current ? "bg-cream-deep ring-line" : "bg-paper ring-line hover:ring-olive",
                        )}
                      >
                        <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-full ring-1", tone ? toneClass[tone] : "bg-cream-deep ring-line")} />
                        <span className="flex-1">{m.name}</span>
                        {m.allergens.some((a) => watched.includes(a)) && <AlertTriangle aria-label="!" className="size-4 shrink-0 text-coral-ink" />}
                        {current && <Check aria-hidden="true" className="size-4 text-olive" strokeWidth={3} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Légende des allergènes (seulement ceux présents)                    */
/* ------------------------------------------------------------------ */
function Legend({ meals, days, t, showChanges }: { meals: CalendarMeal[]; days: CalendarDay[]; t: Dictionary["calendar"]; showChanges: boolean }) {
  const byId = new Map(meals.map((m) => [m.id, m]));
  const present = new Set<Exclude<Tone, null>>();
  for (const d of days)
    for (const id of Object.values(d.slots)) {
      const tone = id ? allergenTone(byId.get(id)?.allergens ?? []) : null;
      if (tone) present.add(tone);
    }
  const items: Array<[Exclude<Tone, null>, string]> = [
    ["milkEggs", t.legendMilkEggs],
    ["milk", t.legendMilk],
    ["eggs", t.legendEggs],
    ["fish", t.legendFish],
  ];
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm print:hidden">
      <span className="font-semibold">{t.legendTitle} :</span>
      {items
        .filter(([k]) => present.has(k))
        .map(([k, label]) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className={cn("h-3.5 w-6 rounded-sm ring-1", toneClass[k])} /> {label}
          </span>
        ))}
      {showChanges && (
        <>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-3.5 w-6 rounded-sm bg-charcoal ring-2 ring-saffron" /> {t.legendPending}
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-3.5 w-6 rounded-sm bg-paper ring-2 ring-olive" /> {t.legendModified}
          </span>
        </>
      )}
      <span className="basis-full text-xs text-ink-soft">{t.legendNote}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feuille imprimable (affichage pour les parents)                      */
/* ------------------------------------------------------------------ */
function PrintSheet({
  weeks,
  mealById,
  t,
  title,
  shortDate,
}: {
  weeks: Array<{ monday: string; days: Array<{ date: string; day?: CalendarDay }> }>;
  mealById: Map<string, CalendarMeal>;
  t: Dictionary["calendar"];
  title: string;
  shortDate: (d: string) => string;
}) {
  const name = (id: string | null | undefined) => (id ? (mealById.get(id)?.name ?? "") : "");
  return (
    <div id="menu-print" className="hidden print:block">
      <p className="mb-4 font-display text-2xl font-extrabold">{title}</p>
      {weeks.map((w, wi) => (
        <table key={w.monday} className="mb-4 w-full table-fixed border-collapse text-[10pt]">
          <thead>
            <tr>
              <th className="w-24 border border-charcoal/30 bg-olive-soft p-1 text-left">{fill(t.week, { n: wi + 1 })}</th>
              {w.days.map(({ date }, i) => (
                <th key={date} className="border border-charcoal/30 bg-olive-soft p-1">
                  {t.days[i]} {shortDate(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOT_ORDER.map((slot) => (
              <tr key={slot}>
                <th className="border border-charcoal/30 p-1 text-left font-semibold">{t.slots[slot]}</th>
                {w.days.map(({ date, day }) => (
                  <td key={date} className="border border-charcoal/30 p-1 align-top">
                    {name(day?.slots[slot])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
      <p className="text-[8pt]">{t.legendNote}</p>
    </div>
  );
}
