import { EmptyState, PageTitle } from "@/components/portal/ui/PortalUI";
import { AutoSubmitSelect, Flash } from "@/components/admin/AdminUI";
import { createSessionClient } from "@/lib/supabase/session";
import { getMeals } from "@/lib/menu-repository";
import { updateOrderStatus } from "@/lib/actions/admin";
import { formatDate, todayISO } from "@/lib/format";
import { getDictionary } from "@/i18n";
import type { OrderItemRow, OrderRow } from "@/lib/supabase/types";

export const metadata = { title: "Commandes" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ msg?: string; tout?: string }> }) {
  const { msg, tout } = await searchParams;
  const d = getDictionary("fr").portal;
  const supabase = await createSessionClient();
  let query = supabase.from("orders").select("*").order("delivery_date").limit(200);
  if (!tout) query = query.gte("delivery_date", todayISO(-1));
  const orders = ((await query).data ?? []) as OrderRow[];
  const [{ data: items }, { data: ests }, meals] = await Promise.all([
    orders.length ? supabase.from("order_items").select("*").in("order_id", orders.map((o) => o.id)) : Promise.resolve({ data: [] }),
    supabase.from("establishments").select("id, name"),
    getMeals(),
  ]);
  const estName = new Map((ests ?? []).map((e) => [e.id, e.name]));
  const mealName = new Map(meals.map((m) => [m.id, m.name]));

  return (
    <>
      <PageTitle title="Commandes" lead="Commandes ponctuelles et urgentes passées par les clients." />
      <Flash msg={msg} />
      <a href={tout ? "?" : "?tout=1"} className="mb-4 inline-block text-sm font-semibold underline underline-offset-4">
        {tout ? "Voir seulement les commandes à venir" : "Voir aussi les commandes passées"}
      </a>
      {orders.length === 0 ? (
        <EmptyState>Aucune commande.</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {orders.map((o) => (
            <li key={o.id} className={`rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ${o.kind === "urgente" && o.status === "soumise" ? "ring-coral" : "ring-line"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">
                    {estName.get(o.establishment_id)} · {formatDate(o.delivery_date, "fr", "weekday")}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {o.kind === "urgente" ? <strong className="text-coral-ink">URGENTE</strong> : d.orders.kind[o.kind]} · reçue le {formatDate(o.created_at.slice(0, 10), "fr")}
                  </p>
                </div>
                <form action={updateOrderStatus}>
                  <input type="hidden" name="id" value={o.id} />
                  <AutoSubmitSelect name="status" defaultValue={o.status} aria-label="Statut">
                    {(Object.keys(d.orders.status) as Array<keyof typeof d.orders.status>).map((s) => (
                      <option key={s} value={s}>{d.orders.status[s]}</option>
                    ))}
                  </AutoSubmitSelect>
                </form>
              </div>
              <ul className="mt-3 grid gap-1 border-t border-line pt-3 text-sm">
                {((items ?? []) as OrderItemRow[]).filter((i) => i.order_id === o.id).map((i) => (
                  <li key={i.id} className="flex justify-between gap-4">
                    <span>{mealName.get(i.meal_id)} <span className="text-ink-soft">· {d.formats[i.format]}</span></span>
                    <strong className="tabular-nums">{i.portions}</strong>
                  </li>
                ))}
              </ul>
              {o.notes && <p className="mt-2 text-sm text-ink-soft">{o.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
