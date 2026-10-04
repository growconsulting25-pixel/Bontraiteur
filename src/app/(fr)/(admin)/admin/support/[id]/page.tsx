import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { SubmitButton } from "@/components/admin/AdminUI";
import { createSessionClient } from "@/lib/supabase/session";
import { markStaffRead, resolveSupport, staffReply } from "@/lib/actions/admin";
import type { SupportMessageRow, SupportRequestRow } from "@/lib/supabase/types";
import { cn } from "@/lib/cn";

export const metadata = { title: "Conversation" };

const when = (iso: string) =>
  new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "America/Toronto" }).format(new Date(iso));

export default async function AdminThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createSessionClient();
  const [{ data: request }, { data: messages }] = await Promise.all([
    supabase.from("support_requests").select("*, establishments(name), organizations(name)").eq("id", id).maybeSingle(),
    supabase.from("support_messages").select("*").eq("request_id", id).order("created_at"),
  ]);
  if (!request) notFound();
  const r = request as SupportRequestRow & { establishments: { name: string } | null; organizations: { name: string } | null };
  if (r.staff_unread) await markStaffRead(id);

  const all = [
    { id: "first", fromStaff: false, name: "Client", body: r.message, at: r.created_at },
    ...((messages ?? []) as SupportMessageRow[]).map((m) => ({ id: m.id, fromStaff: m.from_staff, name: m.author_name ?? "", body: m.body, at: m.created_at })),
  ];

  return (
    <>
      <Link href="/admin/support" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-charcoal">
        <ArrowLeft aria-hidden="true" className="size-4" /> Toutes les conversations
      </Link>
      <div className="mt-4">
        <PageTitle
          title={r.subject}
          lead={`${r.organizations?.name ?? ""} · ${r.establishments?.name ?? "—"}`}
          action={
            <form action={resolveSupport} className="flex items-center gap-2">
              <StatusPill tone={r.status === "ouverte" ? "warn" : "good"}>{r.status === "ouverte" ? "Ouverte" : "Résolue"}</StatusPill>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value={r.status === "ouverte" ? "resolue" : "ouverte"} />
              <SubmitButton tone="light">{r.status === "ouverte" ? "Marquer résolue" : "Rouvrir"}</SubmitButton>
            </form>
          }
        />
      </div>

      <ol className="grid gap-4">
        {all.map((m) => (
          <li key={m.id} className={cn("flex", m.fromStaff ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] rounded-[1.1rem] px-4 py-3 text-sm", m.fromStaff ? "rounded-br-sm bg-olive text-cream" : "rounded-bl-sm bg-paper ring-1 ring-line")}>
              <p className={cn("mb-1 text-xs font-semibold", m.fromStaff ? "text-cream/75" : "text-ink-soft")}>
                {m.name || (m.fromStaff ? "Équipe" : "Client")} · {when(m.at)}
              </p>
              <p className="leading-relaxed whitespace-pre-line">{m.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <form action={staffReply} className="mt-6 grid gap-3 rounded-[var(--radius-lg)] bg-paper p-4 ring-1 ring-line">
        <input type="hidden" name="requestId" value={r.id} />
        <label htmlFor="staff-reply" className="text-sm font-semibold">
          Répondre au client
        </label>
        <textarea
          id="staff-reply"
          name="body"
          required
          maxLength={4000}
          rows={4}
          className="w-full rounded-[var(--radius-md)] bg-cream px-3.5 py-2.5 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-charcoal"
        />
        <p className="text-xs text-ink-soft">Le client reçoit une notification dans son portail et un courriel.</p>
        <div>
          <SubmitButton tone="olive">Envoyer la réponse</SubmitButton>
        </div>
      </form>
    </>
  );
}
