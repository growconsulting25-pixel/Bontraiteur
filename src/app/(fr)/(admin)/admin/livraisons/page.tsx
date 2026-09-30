import { PageTitle, EmptyState } from "@/components/portal/ui/PortalUI";
import { AutoSubmitSelect, Flash, Label, SubmitButton, Table, inputClass } from "@/components/admin/AdminUI";
import { createSessionClient } from "@/lib/supabase/session";
import { createDelivery, updateDeliveryStatus } from "@/lib/actions/admin";
import { formatDate, todayISO } from "@/lib/format";
import { getDictionary } from "@/i18n";
import type { DeliveryRow } from "@/lib/supabase/types";

export const metadata = { title: "Livraisons" };

export default async function AdminDeliveriesPage({ searchParams }: { searchParams: Promise<{ msg?: string; date?: string }> }) {
  const { msg, date } = await searchParams;
  const from = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? date! : todayISO();
  const t = getDictionary("fr").portal.deliveries;
  const supabase = await createSessionClient();
  const [{ data }, { data: ests }] = await Promise.all([
    supabase.from("deliveries").select("*").gte("scheduled_for", from).order("scheduled_for").limit(300),
    supabase.from("establishments").select("id, name, city").order("name"),
  ]);
  const deliveries = (data ?? []) as DeliveryRow[];
  const estName = new Map((ests ?? []).map((e) => [e.id, `${e.name}${e.city ? ` (${e.city})` : ""}`]));

  return (
    <>
      <PageTitle title="Livraisons" lead="Tournées à venir. Les livraisons du mois se planifient aussi depuis la page Menus." />
      <Flash msg={msg} />
      <form action={createDelivery} className="mb-6 grid gap-3 rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <Label text="Établissement">
          <select name="establishmentId" required className={inputClass}>
            {(ests ?? []).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </Label>
        <Label text="Date"><input type="date" name="date" required min={todayISO()} className={inputClass} /></Label>
        <Label text="Plage horaire"><input name="window" placeholder="10 h – 11 h" className={inputClass} /></Label>
        <SubmitButton>Planifier</SubmitButton>
      </form>

      <form className="mb-4 flex items-end gap-2">
        <Label text="À partir du"><input type="date" name="date" defaultValue={from} className={inputClass} /></Label>
        <SubmitButton tone="light">Afficher</SubmitButton>
      </form>

      {deliveries.length === 0 ? (
        <EmptyState>Aucune livraison à partir de cette date.</EmptyState>
      ) : (
        <Table head={["Date", "Établissement", "Plage", "Statut"]}>
          {deliveries.map((dl) => (
            <tr key={dl.id}>
              <td className="px-4 py-2 font-semibold whitespace-nowrap">{formatDate(dl.scheduled_for, "fr", "weekday")}</td>
              <td className="px-4 py-2">{estName.get(dl.establishment_id)}</td>
              <td className="px-4 py-2 text-ink-soft">{dl.time_window ?? "—"}</td>
              <td className="px-4 py-2">
                <form action={updateDeliveryStatus}>
                  <input type="hidden" name="id" value={dl.id} />
                  <AutoSubmitSelect name="status" defaultValue={dl.status} aria-label="Statut">
                    {(Object.keys(t.status) as Array<keyof typeof t.status>).map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
                  </AutoSubmitSelect>
                </form>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
