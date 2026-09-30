import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card, EmptyState, PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { ConfirmSubmit } from "@/components/portal/ui/ConfirmSubmit";
import { requireClient } from "@/lib/auth";
import { getOrders } from "@/lib/portal/data";
import { getMeals } from "@/lib/menu-repository";
import { mealName } from "@/lib/meal-name";
import { cancelOrder } from "@/lib/actions/portal";
import { formatDate, todayISO } from "@/lib/format";
import { orderTone } from "@/lib/portal/status";
import { format, getDictionary, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";

export async function PortalOrdersView({ locale, sent }: { locale: Locale; sent?: boolean }) {
  const ctx = await requireClient(locale);
  const d = getDictionary(locale);
  const t = d.portal.orders;
  const [orders, meals] = await Promise.all([getOrders(ctx.establishment.id), getMeals()]);
  const byId = new Map(meals.map((m) => [m.id, m]));
  const today = todayISO();

  return (
    <>
      <PageTitle
        title={t.title}
        lead={t.lead}
        action={
          ctx.canAct && (
            <ButtonLink href={portalHref("newOrder", locale)}>
              <Plus aria-hidden="true" className="size-4" /> {t.new}
            </ButtonLink>
          )
        }
      />
      {sent && <p role="status" className="mb-6 rounded-[var(--radius-md)] bg-olive-soft p-4 text-sm text-olive-deep">{t.sent}</p>}

      {orders.length === 0 ? (
        <EmptyState>{t.empty}</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold">{formatDate(order.delivery_date, locale, "weekday")}</p>
                    <p className="text-sm text-ink-soft">
                      {t.kind[order.kind]} · {t.deliveryDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill tone={order.kind === "urgente" && order.status === "soumise" ? "bad" : orderTone[order.status]}>
                      {t.status[order.status]}
                    </StatusPill>
                    {ctx.canAct && (order.status === "soumise" || order.status === "brouillon") && order.delivery_date > today && (
                      <form action={cancelOrder}>
                        <input type="hidden" name="id" value={order.id} />
                        <input type="hidden" name="locale" value={locale} />
                        <ConfirmSubmit label={t.cancel} confirm={t.cancelConfirm} />
                      </form>
                    )}
                  </div>
                </div>
                {order.items.length > 0 && (
                  <ul className="mt-4 grid gap-1 border-t border-line pt-4 text-sm">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-4">
                        <span>
                          {byId.get(item.meal_id) ? mealName(byId.get(item.meal_id)!, locale) : "—"}{" "}
                          <span className="text-ink-soft">· {d.portal.formats[item.format]}</span>
                        </span>
                        <span className="font-semibold tabular-nums">{format(t.portions, { count: item.portions })}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {order.notes && <p className="mt-3 text-sm text-ink-soft">{order.notes}</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
