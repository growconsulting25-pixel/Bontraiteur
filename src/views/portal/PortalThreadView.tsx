import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusPill } from "@/components/portal/ui/PortalUI";
import { ReplyForm } from "@/components/portal/ReplyForm";
import { MarkRead } from "@/components/portal/MarkRead";
import { Avatar } from "@/components/portal/topbar/Avatar";
import { requireClient } from "@/lib/auth";
import { getProfile, getThread } from "@/lib/portal/inbox";
import { supportTone } from "@/lib/portal/status";
import { getDictionary, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";
import { cn } from "@/lib/cn";

/** Une conversation avec l'équipe : fil de messages + réponse. */
export async function PortalThreadView({ locale, id }: { locale: Locale; id: string }) {
  const ctx = await requireClient(locale);
  const d = getDictionary(locale);
  const t = d.portal.support;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const thread = await getThread(id);
  if (!thread || thread.request.organization_id !== ctx.organization.id) notFound();
  const { avatarUrl } = await getProfile(ctx.user.id);
  const { request, messages } = thread;
  const when = (iso: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "America/Toronto" }).format(new Date(iso));

  const all = [
    { id: "first", fromStaff: false, mine: request.user_id === ctx.user.id, name: null as string | null, body: request.message, createdAt: request.created_at },
    ...messages.map((m) => ({ id: m.id, fromStaff: m.from_staff, mine: m.author_id === ctx.user.id, name: m.author_name, body: m.body, createdAt: m.created_at })),
  ];

  return (
    <>
      <MarkRead requestId={request.id} unread={Boolean(request.client_unread)} />
      <Link href={portalHref("support", locale)} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-charcoal">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t.back}
      </Link>
      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h3 font-bold">{request.subject}</h1>
        <StatusPill tone={supportTone[request.status]}>{t.status[request.status]}</StatusPill>
      </div>

      <ol className="grid gap-4">
        {all.map((m) => (
          <li key={m.id} className={cn("flex items-end gap-3", m.fromStaff ? "justify-start" : "flex-row-reverse")}>
            {m.fromStaff ? (
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-olive font-display text-xs font-bold text-cream">
                BT
              </span>
            ) : (
              <Avatar url={m.mine ? avatarUrl : null} name={m.name ?? ctx.user.email ?? "?"} size="sm" />
            )}
            <div className={cn("max-w-[80%] rounded-[1.1rem] px-4 py-3 text-sm", m.fromStaff ? "rounded-bl-sm bg-paper ring-1 ring-line" : "rounded-br-sm bg-charcoal text-cream")}>
              <p className={cn("mb-1 text-xs font-semibold", m.fromStaff ? "text-olive" : "text-cream/70")}>
                {m.fromStaff ? t.team : m.mine ? t.you : (m.name ?? "")} · {when(m.createdAt)}
              </p>
              <p className="leading-relaxed whitespace-pre-line">{m.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <ReplyForm requestId={request.id} t={t} />
      </div>
    </>
  );
}
