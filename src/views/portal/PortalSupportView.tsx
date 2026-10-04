import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, EmptyState, PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { SupportForm } from "@/components/portal/SupportForm";
import { OpenAssistantButton } from "@/components/assistant/OpenAssistantButton";
import { requireClient } from "@/lib/auth";
import { getConversations } from "@/lib/portal/inbox";
import { formatDate } from "@/lib/format";
import { supportTone } from "@/lib/portal/status";
import { site } from "@/data/site";
import { getDictionary, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";
import { cn } from "@/lib/cn";

/** Messages : conversations avec l'équipe, nouvelle demande, assistant et téléphone. */
export async function PortalSupportView({ locale }: { locale: Locale }) {
  const ctx = await requireClient(locale);
  const d = getDictionary(locale);
  const t = d.portal.support;
  const conversations = await getConversations(ctx.organization.id);

  return (
    <>
      <PageTitle title={t.title} lead={t.lead} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid content-start gap-6">
          <section aria-labelledby="conversations-title">
            <h2 id="conversations-title" className="mb-3 text-xs font-bold tracking-[0.1em] text-ink-soft uppercase">
              {t.conversations}
            </h2>
            {conversations.length === 0 ? (
              <EmptyState>{t.empty}</EmptyState>
            ) : (
              <ul className="overflow-hidden rounded-[var(--radius-lg)] bg-paper ring-1 ring-line">
                {conversations.map((c) => (
                  <li key={c.id} className="border-b border-line last:border-0">
                    <Link href={`${portalHref("support", locale)}/${c.id}`} className={cn("flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream", c.client_unread && "bg-saffron-soft/40")}>
                      <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", c.client_unread ? "bg-coral" : "bg-transparent")} />
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate", c.client_unread ? "font-bold" : "font-semibold")}>{c.subject}</span>
                        <span className="block truncate text-sm text-ink-soft">{c.message}</span>
                      </span>
                      <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <span className="text-xs text-ink-soft">{formatDate((c.last_message_at ?? c.created_at).slice(0, 10), locale, "short")}</span>
                        {c.client_unread ? <StatusPill tone="warn">{t.newBadge}</StatusPill> : <StatusPill tone={supportTone[c.status]}>{t.status[c.status]}</StatusPill>}
                      </span>
                      <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-ink-soft" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Card>
            <h2 className="mb-4 font-display text-lg font-bold">{t.newConversation}</h2>
            <SupportForm locale={locale} establishmentId={ctx.establishment.id} t={t} errorText={d.auth.genericError} />
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <div className="rounded-[var(--radius-lg)] bg-saffron-soft p-5 sm:p-6">
            <p className="font-display text-lg font-bold">{t.chatTitle}</p>
            <p className="mt-1 text-sm text-ink-soft">{t.chatText}</p>
            <OpenAssistantButton label={t.chatButton} dark className="mt-4" />
          </div>
          <div className="rounded-[var(--radius-lg)] bg-olive p-5 text-cream sm:p-6">
            <p className="font-semibold">{t.callUs}</p>
            {site.contact.phones.map((p) => (
              <a key={p.href} href={p.href} className="mt-2 block font-display text-2xl font-bold hover:text-saffron">
                {p.display}
              </a>
            ))}
            <a href={`mailto:${site.contact.email}`} className="mt-4 block text-cream/80 hover:text-cream">
              {site.contact.email}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
