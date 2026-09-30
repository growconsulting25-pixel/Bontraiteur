import { PageTitle, EmptyState } from "@/components/portal/ui/PortalUI";
import { AutoSubmitSelect, Flash, SubmitButton } from "@/components/admin/AdminUI";
import { createSessionClient } from "@/lib/supabase/session";
import { convertQuote, updateQuoteStatus } from "@/lib/actions/admin";
import { formatDate } from "@/lib/format";
import type { QuoteRequestRow } from "@/lib/supabase/types";

export const metadata = { title: "Soumissions" };

const statuses = [
  ["nouvelle", "Nouvelle"],
  ["en_cours", "En cours"],
  ["convertie", "Convertie en client"],
  ["fermee", "Fermée"],
  ["spam", "Spam"],
] as const;

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ msg?: string; statut?: string }> }) {
  const { msg, statut } = await searchParams;
  const supabase = await createSessionClient();
  let query = supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(100);
  if (statut) query = query.eq("status", statut);
  const quotes = ((await query).data ?? []) as QuoteRequestRow[];

  return (
    <>
      <PageTitle title="Soumissions" lead="Demandes reçues par le formulaire du site." />
      <Flash msg={msg} />
      <nav className="mb-6 flex flex-wrap gap-2 text-sm">
        {[["", "Toutes"], ...statuses].map(([value, label]) => (
          <a key={value} href={value ? `?statut=${value}` : "?"} className={`rounded-full px-3 py-1.5 font-semibold ring-1 ${statut === value || (!statut && !value) ? "bg-charcoal text-cream ring-charcoal" : "ring-line"}`}>
            {label}
          </a>
        ))}
      </nav>
      {quotes.length === 0 ? (
        <EmptyState>Aucune soumission.</EmptyState>
      ) : (
        <ul className="grid gap-4">
          {quotes.map((q) => (
            <li key={q.id} className="rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{q.establishment_name}</p>
                  <p className="text-sm text-ink-soft">
                    {q.establishment_type} · {q.city} · {q.children_count ?? "?"} enfants · reçue le {formatDate(q.created_at.slice(0, 10), "fr")} · {q.locale.toUpperCase()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={updateQuoteStatus}>
                    <input type="hidden" name="id" value={q.id} />
                    <AutoSubmitSelect name="status" defaultValue={q.status} aria-label="Statut">
                      {statuses.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </AutoSubmitSelect>
                  </form>
                  {q.status !== "convertie" && (
                    <form action={convertQuote}>
                      <input type="hidden" name="id" value={q.id} />
                      <SubmitButton tone="olive">Créer le client</SubmitButton>
                    </form>
                  )}
                </div>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div><dt className="text-ink-soft">Contact</dt><dd className="font-semibold">{q.contact_name}{q.role ? ` — ${q.role}` : ""}</dd></div>
                <div><dt className="text-ink-soft">Coordonnées</dt><dd><a className="font-semibold underline" href={`mailto:${q.email}`}>{q.email}</a> · <a className="font-semibold underline" href={`tel:${q.phone}`}>{q.phone}</a></dd></div>
                <div><dt className="text-ink-soft">Fréquence</dt><dd>{q.frequency}</dd></div>
                <div><dt className="text-ink-soft">Formats</dt><dd>{q.formats.join(", ") || "—"}</dd></div>
                <div><dt className="text-ink-soft">Début</dt><dd>{q.start_month || "—"}</dd></div>
                <div><dt className="text-ink-soft">Allergies / restrictions</dt><dd>{q.restrictions || "—"}</dd></div>
                {q.message && <div className="sm:col-span-2"><dt className="text-ink-soft">Message</dt><dd className="whitespace-pre-line">{q.message}</dd></div>}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
