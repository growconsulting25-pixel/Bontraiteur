import { EmptyState, PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { SubmitButton } from "@/components/admin/AdminUI";
import { createSessionClient } from "@/lib/supabase/session";
import { resolveSupport } from "@/lib/actions/admin";
import { formatDate } from "@/lib/format";
import type { SupportRequestRow } from "@/lib/supabase/types";

export const metadata = { title: "Support" };

export default async function AdminSupportPage() {
  const supabase = await createSessionClient();
  const [{ data }, { data: ests }] = await Promise.all([
    supabase.from("support_requests").select("*").order("status").order("created_at", { ascending: false }).limit(100),
    supabase.from("establishments").select("id, name"),
  ]);
  const requests = (data ?? []) as SupportRequestRow[];
  const estName = new Map((ests ?? []).map((e) => [e.id, e.name]));

  return (
    <>
      <PageTitle title="Support" lead="Messages envoyés depuis le portail client." />
      {requests.length === 0 ? (
        <EmptyState>Aucune demande.</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {requests.map((r) => (
            <li key={r.id} className="rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.subject}</p>
                  <p className="text-sm text-ink-soft">
                    {r.establishment_id ? estName.get(r.establishment_id) : "—"} · {formatDate(r.created_at.slice(0, 10), "fr")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill tone={r.status === "ouverte" ? "warn" : "good"}>{r.status === "ouverte" ? "Ouverte" : "Résolue"}</StatusPill>
                  <form action={resolveSupport}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value={r.status === "ouverte" ? "resolue" : "ouverte"} />
                    <SubmitButton tone="light">{r.status === "ouverte" ? "Marquer résolue" : "Rouvrir"}</SubmitButton>
                  </form>
                </div>
              </div>
              <p className="mt-3 text-sm whitespace-pre-line">{r.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
