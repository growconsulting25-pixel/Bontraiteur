import Link from "next/link";
import { Card, EmptyState, PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { Flash, Label, SubmitButton, inputClass } from "@/components/admin/AdminUI";
import { MenuCalendar } from "@/components/portal/calendar/MenuCalendar";
import { ConfirmSubmit } from "@/components/portal/ui/ConfirmSubmit";
import { createSessionClient } from "@/lib/supabase/session";
import { getMeals } from "@/lib/menu-repository";
import {
  deleteMenuDay,
  generateMenu,
  generateMenusForAll,
  publishMenu,
  scheduleMenuDeliveries,
  updateMenuDeadline,
} from "@/lib/actions/admin";
import { formatDate, formatMonth, monthStart } from "@/lib/format";
import { menuTone } from "@/lib/portal/status";
import { getDictionary } from "@/i18n";
import type { EstablishmentRow, MenuDayRow, MenuSlot, MonthlyMenuRow } from "@/lib/supabase/types";

export const metadata = { title: "Menus" };

export default async function MenusPage({ searchParams }: { searchParams: Promise<{ msg?: string; mois?: string; etablissement?: string }> }) {
  const { msg, mois, etablissement } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(mois ?? "") ? `${mois}-01` : monthStart(1);
  const d = getDictionary("fr");
  const supabase = await createSessionClient();

  const [{ data: establishments }, { data: menus }, meals] = await Promise.all([
    supabase.from("establishments").select("id, organization_id, name, watched_allergens").order("name"),
    supabase.from("monthly_menus").select("*").eq("month", month),
    getMeals(),
  ]);
  const ests = (establishments ?? []) as Pick<EstablishmentRow, "id" | "organization_id" | "name" | "watched_allergens">[];
  const menuByEst = new Map(((menus ?? []) as MonthlyMenuRow[]).map((m) => [m.establishment_id, m]));
  const selected = ests.find((e) => e.id === etablissement);
  const menu = selected ? menuByEst.get(selected.id) : undefined;
  const days = menu ? (((await supabase.from("menu_days").select("*").eq("monthly_menu_id", menu.id).order("date")).data ?? []) as MenuDayRow[]) : [];
  const months = [-1, 0, 1, 2].map((o) => monthStart(o));
  const self = `/admin/menus?mois=${month.slice(0, 7)}${selected ? `&etablissement=${selected.id}` : ""}`;

  return (
    <>
      <PageTitle title="Menus mensuels" lead="Générez la proposition du mois, ajustez, publiez. Le client garde ou remplace ses repas jusqu'à la date limite." />
      <Flash msg={msg} />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {months.map((m) => (
          <Link
            key={m}
            href={`/admin/menus?mois=${m.slice(0, 7)}${selected ? `&etablissement=${selected.id}` : ""}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ring-1 ${m === month ? "bg-charcoal text-cream ring-charcoal" : "ring-line"}`}
          >
            {formatMonth(m, "fr")}
          </Link>
        ))}
        <form action={generateMenusForAll} className="ml-auto">
          <input type="hidden" name="month" value={month.slice(0, 7)} />
          <SubmitButton tone="olive">Générer tous les brouillons du mois</SubmitButton>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <Card className="h-fit p-3 sm:p-3">
          {ests.length === 0 ? (
            <p className="p-3 text-sm text-ink-soft">Aucun établissement. Créez d&apos;abord un client.</p>
          ) : (
            <ul className="grid gap-1">
              {ests.map((e) => {
                const m = menuByEst.get(e.id);
                return (
                  <li key={e.id}>
                    <Link
                      href={`/admin/menus?mois=${month.slice(0, 7)}&etablissement=${e.id}`}
                      className={`flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm ${selected?.id === e.id ? "bg-cream-deep font-semibold" : "hover:bg-cream"}`}
                    >
                      <span className="truncate">{e.name}</span>
                      {m ? <StatusPill tone={menuTone[m.status]}>{d.portal.menuStatus[m.status]}</StatusPill> : <span className="text-xs text-ink-soft">—</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div>
          {!selected ? (
            <EmptyState>Choisissez un établissement.</EmptyState>
          ) : !menu ? (
            <Card>
              <p className="font-display text-lg font-bold">{selected.name}</p>
              <p className="mt-1 text-sm text-ink-soft">Aucun menu pour {formatMonth(month, "fr")}.</p>
              <form action={generateMenu} className="mt-4">
                <input type="hidden" name="establishmentId" value={selected.id} />
                <input type="hidden" name="month" value={month.slice(0, 7)} />
                <SubmitButton tone="olive">Générer la proposition</SubmitButton>
              </form>
            </Card>
          ) : (
            <>
              <Card className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-bold">
                    {selected.name} · <span className="capitalize">{formatMonth(month, "fr")}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                    <StatusPill tone={menuTone[menu.status]}>{d.portal.menuStatus[menu.status]}</StatusPill>
                    {menu.confirmed_at && <span>confirmé le {formatDate(menu.confirmed_at.slice(0, 10), "fr")}</span>}
                    <span>· {days.reduce((n, x) => n + Object.keys(x.original_slots ?? {}).length, 0)} case(s) modifiée(s) par le client</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <form action={updateMenuDeadline} className="flex items-end gap-2">
                    <input type="hidden" name="menuId" value={menu.id} />
                    <Label text="Date limite client">
                      <input type="date" name="deadline" defaultValue={menu.change_deadline} className={inputClass} />
                    </Label>
                    <SubmitButton tone="light">OK</SubmitButton>
                  </form>
                  {menu.status === "brouillon" && (
                    <form action={publishMenu}>
                      <input type="hidden" name="menuId" value={menu.id} />
                      <input type="hidden" name="back" value={self} />
                      <SubmitButton tone="olive">Publier au client</SubmitButton>
                    </form>
                  )}
                  <form action={scheduleMenuDeliveries} className="flex items-end gap-2">
                    <input type="hidden" name="menuId" value={menu.id} />
                    <input type="hidden" name="back" value={self} />
                    <Label text="Plage horaire">
                      <input name="window" placeholder="10 h – 11 h" className={`${inputClass} w-32`} />
                    </Label>
                    <SubmitButton tone="light">Planifier les livraisons</SubmitButton>
                  </form>
                </div>
              </Card>

              <MenuCalendar
                key={menu.id}
                locale="fr"
                menuId={menu.id}
                status={menu.status}
                initialDays={days.map((day) => ({
                  id: day.id,
                  date: day.date,
                  slots: { collation_am: day.snack_am_id, repas: day.meal_id, dessert: day.dessert_id, collation_pm: day.snack_pm_id },
                  originals: (day.original_slots ?? {}) as Partial<Record<MenuSlot, string | null>>,
                }))}
                meals={meals.map((m) => ({ id: m.id, name: m.name, category: d.menu.categories[m.category], type: m.mealType, allergens: m.allergens }))}
                editable
                mode="staff"
                t={d.calendar}
                statusLabels={d.portal.menuStatus}
                monthLabel={formatMonth(month, "fr")}
                establishmentName={selected.name}
                establishmentId={selected.id}
                initialWatched={selected.watched_allergens ?? []}
                canEditWatched
              />

              {/* Congés, journées pédagogiques : retirer un jour du menu */}
              <details className="mt-6 rounded-[var(--radius-lg)] bg-paper p-4 ring-1 ring-line">
                <summary className="cursor-pointer text-sm font-semibold">Retirer un jour (congé, fermeture)</summary>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {days.map((day) => (
                    <li key={day.id}>
                      <form action={deleteMenuDay}>
                        <input type="hidden" name="dayId" value={day.id} />
                        <ConfirmSubmit label={formatDate(day.date, "fr", "short")} confirm={`Retirer le ${formatDate(day.date, "fr", "weekday")} du menu?`} />
                      </form>
                    </li>
                  ))}
                </ul>
              </details>
            </>
          )}
        </div>
      </div>
    </>
  );
}
