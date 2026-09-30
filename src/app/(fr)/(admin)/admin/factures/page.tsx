import { PageTitle, EmptyState } from "@/components/portal/ui/PortalUI";
import { AutoSubmitSelect, Flash, Label, SubmitButton, Table, inputClass } from "@/components/admin/AdminUI";
import { createSessionClient } from "@/lib/supabase/session";
import { createInvoice, updateInvoiceStatus, uploadInvoicePdf } from "@/lib/actions/admin";
import { isStripeConfigured } from "@/lib/stripe";
import { formatDate, formatMoney } from "@/lib/format";
import { getDictionary } from "@/i18n";
import type { InvoiceRow } from "@/lib/supabase/types";

export const metadata = { title: "Factures" };

export default async function AdminInvoicesPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  const t = getDictionary("fr").portal.invoices;
  const supabase = await createSessionClient();
  const [{ data }, { data: orgs }, { data: ests }] = await Promise.all([
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("organizations").select("id, name").order("name"),
    supabase.from("establishments").select("id, organization_id, name").order("name"),
  ]);
  const invoices = (data ?? []) as InvoiceRow[];
  const orgName = new Map((orgs ?? []).map((o) => [o.id, o.name]));

  return (
    <>
      <PageTitle title="Factures" lead={`Numérotation automatique (BT-1001…). Paiement en ligne : ${isStripeConfigured() ? "Stripe activé" : "Stripe non configuré"}.`} />
      <Flash msg={msg} />
      <form action={createInvoice} className="mb-6 grid gap-3 rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line sm:grid-cols-3 sm:items-end">
        <Label text="Organisation">
          <select name="organizationId" required className={inputClass}>{(orgs ?? []).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
        </Label>
        <Label text="Établissement (facultatif)">
          <select name="establishmentId" className={inputClass}>
            <option value="">—</option>
            {(ests ?? []).map((e) => <option key={e.id} value={e.id}>{orgName.get(e.organization_id)} · {e.name}</option>)}
          </select>
        </Label>
        <Label text="Montant ($, taxes incluses)"><input name="amount" required inputMode="decimal" placeholder="1234.56" className={inputClass} /></Label>
        <Label text="Période du"><input type="date" name="periodStart" className={inputClass} /></Label>
        <Label text="au"><input type="date" name="periodEnd" className={inputClass} /></Label>
        <Label text="Échéance"><input type="date" name="dueDate" className={inputClass} /></Label>
        <Label text="Statut">
          <select name="status" className={inputClass}>
            <option value="brouillon">Brouillon (invisible au client)</option>
            <option value="a_payer">À payer (visible)</option>
          </select>
        </Label>
        <SubmitButton>Créer la facture</SubmitButton>
      </form>

      {invoices.length === 0 ? (
        <EmptyState>Aucune facture.</EmptyState>
      ) : (
        <Table head={["Numéro", "Client", "Montant", "Échéance", "Statut", "PDF"]}>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="px-4 py-2 font-semibold">{inv.number}</td>
              <td className="px-4 py-2">{orgName.get(inv.organization_id)}</td>
              <td className="px-4 py-2 tabular-nums">{formatMoney(inv.amount_cents, "fr", inv.currency)}</td>
              <td className="px-4 py-2 whitespace-nowrap">{inv.due_date ? formatDate(inv.due_date, "fr") : "—"}</td>
              <td className="px-4 py-2">
                <form action={updateInvoiceStatus}>
                  <input type="hidden" name="id" value={inv.id} />
                  <AutoSubmitSelect name="status" defaultValue={inv.status} aria-label="Statut">
                    {(Object.keys(t.status) as Array<keyof typeof t.status>).map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
                  </AutoSubmitSelect>
                </form>
              </td>
              <td className="px-4 py-2">
                <form action={uploadInvoicePdf} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={inv.id} />
                  <input type="file" name="file" accept="application/pdf" required className="w-44 text-xs" />
                  <SubmitButton tone="light">{inv.pdf_path ? "Remplacer" : "Ajouter"}</SubmitButton>
                </form>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
