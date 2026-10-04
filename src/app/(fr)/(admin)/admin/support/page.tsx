import Link from "next/link";
import { EmptyState, PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { SubmitButton } from "@/components/admin/AdminUI";
import { createSessionClient } from "@/lib/supabase/session";
import { resolveSupport } from "@/lib/actions/admin";
import { formatDate } from "@/lib/format";
import type { SupportRequestRow } from "@/lib/supabase/types";

export const metadata = { title: "Messages" };

export default async function AdminSupportPage() {
  const supabase = await createSessionClient();
  const [{ data }, { data: ests }] = await Promise.all([
    supabase.from("support_requests").select("*").order("status").order("last_message_at", { ascending: false }).limit(100),
    supabase.from("establishments").select("id, name"),
  ]);
  const requests = (data ?? []) as SupportRequestRow[];
  const estName = new Map((ests ?? []).map((e) => [e.id, e.name]));

  return (
    <>
      <PageTitle title="Messages" lead="Conversations avec les clients (portail et assistant). Ouvrez-en une pour répondre." />
      {requests.length === 0 ? (
        <EmptyState>Aucune demande.</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {requests.map((r) => (
            <li key={r.id} className="rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/admin/support/${r.id}`} className="font-semibold underline-offset-4 hover:underline">
                    {r.staff_unread && <span className="mr-2 inline-block size-2 rounded-full bg-coral align-middle" aria-label="Non lu" />}
                    {r.subject}
                  </Link>
                  <p className="text-sm text-ink-soft">
                    {r.establishment_id ? estName.get(r.establishment_id) : "—"} · {formatDate((r.last_message_at ?? r.created_at).slice(0, 10), "fr")}
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
              <p className="mt-3 line-clamp-2 text-sm whitespace-pre-line">{r.message}</p>
              <Link href={`/admin/support/${r.id}`} className="mt-2 inline-block text-sm font-semibold text-olive hover:underline">
                Ouvrir et répondre →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
