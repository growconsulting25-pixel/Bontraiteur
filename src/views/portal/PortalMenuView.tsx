import Link from "next/link";
import { EmptyState, Notice, PageTitle } from "@/components/portal/ui/PortalUI";
import { MonthlyMenuEditor, type EditorDay } from "@/components/portal/MonthlyMenuEditor";
import { requireClient } from "@/lib/auth";
import { getMenuDays, getPublishedMenus } from "@/lib/portal/data";
import { getMeals } from "@/lib/menu-repository";
import { mealName } from "@/lib/meal-name";
import { formatDate, formatMonth, monthStart, todayISO } from "@/lib/format";
import { format, getDictionary, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";
import { cn } from "@/lib/cn";

/** Lundi de la semaine d'une date (YYYY-MM-DD). */
function weekStart(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

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
  const byId = new Map(meals.map((m) => [m.id, m]));
  const name = (id: string | null) => (id && byId.get(id) ? mealName(byId.get(id)!, locale) : null);

  const editorDays: EditorDay[] = days.map((day) => ({
    id: day.id,
    dateLabel: formatDate(day.date, locale, "weekday"),
    weekLabel: format(t.week, { date: formatDate(weekStart(day.date), locale, "short") }),
    mealId: day.meal_id,
    mealName: name(day.meal_id) ?? "—",
    dessertName: name(day.dessert_id),
    originalMealName: name(day.original_meal_id),
  }));

  const alternatives = meals
    .filter((m) => m.mealType === "repas" && m.status === "disponible")
    .map((m) => ({ id: m.id, name: mealName(m, locale), category: d.menu.categories[m.category] }));

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

      <MonthlyMenuEditor
        menuId={selected.id}
        status={selected.status}
        days={editorDays}
        alternatives={alternatives}
        editable={editable}
        confirmedLabel={selected.confirmed_at ? format(t.confirmed, { date: formatDate(selected.confirmed_at.slice(0, 10), locale) }) : null}
        t={t}
        statusLabels={d.portal.menuStatus}
      />
    </>
  );
}
