import { Card, EmptyState, PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { ConfirmSubmit } from "@/components/portal/ui/ConfirmSubmit";
import { requireClient } from "@/lib/auth";
import { getDeliveries } from "@/lib/portal/data";
import { pauseDelivery } from "@/lib/actions/portal";
import { formatDate, todayISO } from "@/lib/format";
import { deliveryTone } from "@/lib/portal/status";
import { format, getDictionary, type Locale } from "@/i18n";
import type { DeliveryRow } from "@/lib/supabase/types";

export async function PortalDeliveriesView({ locale }: { locale: Locale }) {
  const ctx = await requireClient(locale);
  const t = getDictionary(locale).portal.deliveries;
  const { upcoming, past } = await getDeliveries(ctx.establishment.id);
  const today = todayISO();

  const row = (delivery: DeliveryRow, canPause: boolean) => (
    <li key={delivery.id}>
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">{formatDate(delivery.scheduled_for, locale, "weekday")}</p>
          {delivery.time_window && <p className="text-sm text-ink-soft">{format(t.window, { window: delivery.time_window })}</p>}
        </div>
        <div className="flex items-center gap-3">
          <StatusPill tone={deliveryTone[delivery.status]}>{t.status[delivery.status]}</StatusPill>
          {canPause && (
            <form action={pauseDelivery}>
              <input type="hidden" name="id" value={delivery.id} />
              <input type="hidden" name="locale" value={locale} />
              <ConfirmSubmit label={t.pause} confirm={t.pauseConfirm} />
            </form>
          )}
        </div>
      </Card>
    </li>
  );

  return (
    <>
      <PageTitle title={t.title} lead={t.lead} />
      <h2 className="mb-3 text-xs font-bold tracking-[0.1em] text-ink-soft uppercase">{t.upcoming}</h2>
      {upcoming.length === 0 ? (
        <EmptyState>{t.empty}</EmptyState>
      ) : (
        <ul className="grid gap-3">{upcoming.map((dl) => row(dl, ctx.canAct && dl.status === "planifiee" && dl.scheduled_for > today))}</ul>
      )}
      {past.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 text-xs font-bold tracking-[0.1em] text-ink-soft uppercase">{t.past}</h2>
          <ul className="grid gap-3 opacity-80">{past.map((dl) => row(dl, false))}</ul>
        </>
      )}
    </>
  );
}
