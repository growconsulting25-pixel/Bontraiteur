import { Card, EmptyState, PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { SupportForm } from "@/components/portal/SupportForm";
import { requireClient } from "@/lib/auth";
import { getSupportRequests } from "@/lib/portal/data";
import { formatDate } from "@/lib/format";
import { supportTone } from "@/lib/portal/status";
import { site } from "@/data/site";
import { getDictionary, type Locale } from "@/i18n";

export async function PortalSupportView({ locale }: { locale: Locale }) {
  const ctx = await requireClient(locale);
  const d = getDictionary(locale);
  const t = d.portal.support;
  const requests = await getSupportRequests(ctx.organization.id);

  return (
    <>
      <PageTitle title={t.title} lead={t.lead} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <SupportForm locale={locale} establishmentId={ctx.establishment.id} t={t} errorText={d.auth.genericError} />
        </Card>
        <Card className="bg-olive text-cream ring-0">
          <p className="font-semibold">{t.callUs}</p>
          {site.contact.phones.map((p) => (
            <a key={p.href} href={p.href} className="mt-2 block font-display text-2xl font-bold hover:text-saffron">
              {p.display}
            </a>
          ))}
          <a href={`mailto:${site.contact.email}`} className="mt-4 block text-cream/80 hover:text-cream">
            {site.contact.email}
          </a>
        </Card>
      </div>

      <h2 className="mt-10 mb-3 text-xs font-bold tracking-[0.1em] text-ink-soft uppercase">{t.history}</h2>
      {requests.length === 0 ? (
        <EmptyState>{t.empty}</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {requests.map((r) => (
            <li key={r.id}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">{r.subject}</p>
                  <div className="flex items-center gap-3 text-sm text-ink-soft">
                    {formatDate(r.created_at.slice(0, 10), locale)}
                    <StatusPill tone={supportTone[r.status]}>{t.status[r.status]}</StatusPill>
                  </div>
                </div>
                <p className="mt-2 text-sm whitespace-pre-line text-ink-soft">{r.message}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
