import Link from "next/link";
import { Card, EmptyState, PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { AutoSubmitSelect, Flash, Label, SubmitButton, inputClass } from "@/components/admin/AdminUI";
import { ConfirmSubmit } from "@/components/portal/ui/ConfirmSubmit";
import { createSessionClient } from "@/lib/supabase/session";
import { getMeals } from "@/lib/menu-repository";
import {
  deleteMenuDay,
  generateMenu,
  generateMenusForAll,
  publishMenu,
  scheduleMenuDeliveries,
  updateMenuDay,
  updateMenuDeadline,
} from "@/lib/actions/admin";
import { formatDate, formatMonth, monthStart } from "@/lib/format";
import { menuTone } from "@/lib/portal/status";
import { getDictionary } from "@/i18n";
import type { EstablishmentRow, MenuDayRow, MonthlyMenuRow } from "@/lib/supabase/types";

export const metadata = { title: "Menus" };

export default async function MenusPage({ searchParams }: { searchParams: Promise<{ msg?: string; mois?: string; etablissement?: string }> }) {
  const { msg, mois, etablissement } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(mois ?? "") ? `${mois}-01` : monthStart(1);
  const d = getDictionary("fr");
  const supabase = await createSessionClient();

  const [{ data: establishments }, { data: menus }, meals] = await Promise.all([
    supabase.from("establishments").select("id, organization_id, name").order("name"),
    supabase.from("monthly_menus").select("*").eq("month", month),
    getMeals(),
  ]);
  const ests = (establishments ?? []) as Pick<EstablishmentRow, "id" | "organization_id" | "name">[];
  const menuByEst = new Map(((menus ?? []) as MonthlyMenuRow[]).map((m) => [m.establishment_id, m]));
  const selected = ests.find((e) => e.id === etablissement);
  const menu = selected ? menuByEst.get(selected.id) : undefined;
  const days = menu ? (((await supabase.from("menu_days").select("*").eq("monthly_menu_id", menu.id).order("date")).data ?? []) as MenuDayRow[]) : [];
  const mains = meals.filter((m) => m.mealType === "repas");
  const desserts = meals.filter((m) => m.mealType === "dessert");
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
                    <span>· {days.filter((x) => x.original_meal_id).length} repas remplacé(s) par le client</span>
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

              <div className="overflow-x-auto rounded-[var(--radius-lg)] bg-paper ring-1 ring-line">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-xs tracking-[0.06em] text-ink-soft uppercase">
                    <tr>
                      <th className="px-4 py-3">Jour</th>
                      <th className="px-4 py-3">Repas</th>
                      <th className="px-4 py-3">Dessert</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {days.map((day) => (
                      <tr key={day.id}>
                        <td className="px-4 py-2 font-semibold whitespace-nowrap">{formatDate(day.date, "fr", "weekday")}</td>
                        <td className="px-4 py-2" colSpan={2}>
                          <form action={updateMenuDay} className="grid gap-2 sm:grid-cols-2">
                            <input type="hidden" name="dayId" value={day.id} />
                            <AutoSubmitSelect name="mealId" defaultValue={day.meal_id} aria-label="Repas" className={inputClass}>
                              {mains.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </AutoSubmitSelect>
                            <AutoSubmitSelect name="dessertId" defaultValue={day.dessert_id ?? ""} aria-label="Dessert" className={inputClass}>
                              <option value="">—</option>
                              {desserts.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </AutoSubmitSelect>
                          </form>
                          {day.original_meal_id && (
                            <p className="mt-1 text-xs font-semibold text-olive">
                              Remplacé par le client (proposé : {meals.find((m) => m.id === day.original_meal_id)?.name})
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <form action={deleteMenuDay}>
                            <input type="hidden" name="dayId" value={day.id} />
                            <ConfirmSubmit label="Retirer" confirm="Retirer ce jour (congé, fermeture)?" />
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
