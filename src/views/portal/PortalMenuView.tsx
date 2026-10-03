import Link from "next/link";
import { EmptyState, Notice, PageTitle } from "@/components/portal/ui/PortalUI";
import { MenuCalendar, type CalendarDay, type CalendarMeal } from "@/components/portal/calendar/MenuCalendar";
import { requireClient } from "@/lib/auth";
import { getMenuDays, getPublishedMenus } from "@/lib/portal/data";
import { getMeals } from "@/lib/menu-repository";
import { mealName } from "@/lib/meal-name";
import { formatDate, formatMonth, monthStart, todayISO } from "@/lib/format";
import type { MenuSlot } from "@/lib/supabase/types";
import { format, getDictionary, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";
import { cn } from "@/lib/cn";

export async function PortalMenuView({ locale, month }: { locale: Locale; month?: string }) {
  const ctx = await requireClient(locale);
  const d = getDictionary(locale);
  const t = d.portal.menu;

  const menus = await getPublishedMenus(ctx.establishment.id);
  if (menus.length === 0) {
    return (
      <>
        <PageTitle title={t.title} lead={t.lead} />
        <EmptyState>{t.empty}</EmptyState>
      </>
    );
  }

  // Mois demandé, sinon le prochain à confirmer, sinon le mois en cours, sinon le plus récent.
  const today = todayISO();
  const selected =
    menus.find((m) => month && m.month.startsWith(month)) ??
    menus.find((m) => m.status === "publie" && m.change_deadline >= today) ??
    menus.find((m) => m.month === monthStart(0)) ??
    menus[0];

  const [days, meals] = await Promise.all([getMenuDays(selected.id), getMeals()]);
  const calendarDays: CalendarDay[] = days.map((day) => ({
    id: day.id,
    date: day.date,
    slots: { collation_am: day.snack_am_id, repas: day.meal_id, dessert: day.dessert_id, collation_pm: day.snack_pm_id },
    originals: (day.original_slots ?? {}) as Partial<Record<MenuSlot, string | null>>,
  }));
  const calendarMeals: CalendarMeal[] = meals
    .filter((m) => m.status !== "indisponible")
    .map((m) => ({ id: m.id, name: mealName(m, locale), category: d.menu.categories[m.category], type: m.mealType, allergens: m.allergens }));

  const beforeDeadline = today <= selected.change_deadline;
  const editable = ctx.canAct && beforeDeadline;

  return (
    <>
      <PageTitle title={t.title} lead={t.lead} />

      {menus.length > 1 && (
        <nav aria-label={t.selectMonth} className="mb-6 flex flex-wrap gap-2">
          {menus
            .slice()
            .reverse()
            .map((m) => (
              <Link
                key={m.id}
                href={`${portalHref("menu", locale)}?mois=${m.month.slice(0, 7)}`}
                aria-current={m.id === selected.id ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors",
                  m.id === selected.id ? "bg-charcoal text-cream" : "bg-paper ring-1 ring-line hover:ring-charcoal",
                )}
              >
                {formatMonth(m.month, locale)}
              </Link>
            ))}
        </nav>
      )}

      <div className="mb-6 grid gap-3">
        {!ctx.canAct && <Notice>{d.portal.readOnly}</Notice>}
        {ctx.canAct &&
          (beforeDeadline ? (
            <Notice>{format(t.deadline, { date: formatDate(selected.change_deadline, locale) })}</Notice>
          ) : (
            <Notice tone="error">{t.deadlinePassed}</Notice>
          ))}
      </div>

      <MenuCalendar
        key={selected.id}
        locale={locale}
        menuId={selected.id}
        status={selected.status}
        initialDays={calendarDays}
        meals={calendarMeals}
        editable={editable}
        mode="client"
        t={d.calendar}
        statusLabels={d.portal.menuStatus}
        monthLabel={formatMonth(selected.month, locale)}
        establishmentName={ctx.establishment.name}
      />
    </>
  );
}
