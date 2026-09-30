import Link from "next/link";
import { ArrowRight, CalendarDays, ShoppingBag, LifeBuoy, Check } from "lucide-react";
import { Card, StatusPill } from "@/components/portal/ui/PortalUI";
import { requireClient } from "@/lib/auth";
import { getDeliveries, getInvoices, getPublishedMenus } from "@/lib/portal/data";
import { formatDate, formatMoney, monthName, monthStart, todayISO } from "@/lib/format";
import { deliveryTone, invoiceTone } from "@/lib/portal/status";
import { format, getDictionary, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";

/** Accueil du portail : quatre informations, une action. Rien de plus. */
export async function PortalHomeView({ locale }: { locale: Locale }) {
  const ctx = await requireClient(locale);
  const t = getDictionary(locale).portal;
  const today = todayISO();

  const [menus, deliveries, invoices] = await Promise.all([
    getPublishedMenus(ctx.establishment.id),
    getDeliveries(ctx.establishment.id),
    ctx.canSeeInvoices ? getInvoices(ctx.organization.id) : Promise.resolve([]),
  ]);

  const nextDelivery = deliveries.upcoming.find((d) => d.status === "planifiee" || d.status === "en_route");
  const currentMenu = menus.find((m) => m.month === monthStart(0));
  const toConfirm = menus
    .filter((m) => m.status === "publie" && m.change_deadline >= today)
    .sort((a, b) => a.change_deadline.localeCompare(b.change_deadline))[0];
  const lastInvoice = invoices[0];

  return (
    <>
      <h1 className="text-[clamp(1.9rem,1.5rem+1.4vw,2.6rem)] font-extrabold">{format(t.home.hello, { name: ctx.establishment.name })}</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-bold tracking-[0.1em] text-ink-soft uppercase">{t.home.nextDelivery}</p>
          {nextDelivery ? (
            <>
              <p className="mt-2 font-display text-2xl font-bold">{formatDate(nextDelivery.scheduled_for, locale, "weekday")}</p>
              <div className="mt-2">
                <StatusPill tone={deliveryTone[nextDelivery.status]}>{t.deliveries.status[nextDelivery.status]}</StatusPill>
              </div>
            </>
          ) : (
            <p className="mt-2 text-ink-soft">{t.home.noDelivery}</p>
          )}
        </Card>

        <Card>
          <p className="text-xs font-bold tracking-[0.1em] text-ink-soft uppercase">
            {format(t.home.currentMenu, { month: monthName(monthStart(0), locale) })}
          </p>
          {currentMenu ? (
            <p className="mt-2 inline-flex items-center gap-2 font-display text-2xl font-bold">
              {(currentMenu.status === "confirme" || currentMenu.status === "modifie") && <Check aria-hidden="true" className="size-5 text-olive" strokeWidth={3} />}
              {t.menuStatus[currentMenu.status]}
            </p>
          ) : (
            <p className="mt-2 text-ink-soft">{t.home.noMenu}</p>
          )}
        </Card>

        <Link
          href={portalHref("menu", locale) + (toConfirm ? `?mois=${toConfirm.month.slice(0, 7)}` : "")}
          className="group rounded-[var(--radius-lg)] bg-saffron p-5 transition-colors hover:bg-saffron/85 sm:col-span-2 sm:p-6"
        >
          <p className="text-xs font-bold tracking-[0.1em] uppercase">{t.home.nextAction}</p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="font-display text-xl leading-snug font-bold sm:text-2xl">
              {toConfirm
                ? format(t.home.confirmBefore, { month: monthName(toConfirm.month, locale), date: formatDate(toConfirm.change_deadline, locale) })
                : t.home.nothingToDo}
            </p>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-charcoal text-cream transition-transform group-hover:translate-x-0.5">
              <ArrowRight aria-hidden="true" className="size-5" />
            </span>
          </div>
        </Link>

        {ctx.canSeeInvoices && (
          <Card className="flex items-center justify-between gap-4 sm:col-span-2">
            <div>
              <p className="text-xs font-bold tracking-[0.1em] text-ink-soft uppercase">{t.home.lastInvoice}</p>
              {lastInvoice ? (
                <p className="mt-1 font-semibold">
                  {lastInvoice.number} · {formatMoney(lastInvoice.amount_cents, locale, lastInvoice.currency)}
                </p>
              ) : (
                <p className="mt-1 text-ink-soft">{t.home.noInvoice}</p>
              )}
            </div>
            {lastInvoice && <StatusPill tone={invoiceTone[lastInvoice.status]}>{t.invoices.status[lastInvoice.status]}</StatusPill>}
          </Card>
        )}
      </div>

      <h2 className="mt-12 text-xs font-bold tracking-[0.1em] text-ink-soft uppercase">{t.home.quickActions}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { href: portalHref("menu", locale), icon: CalendarDays, label: t.home.viewMenu },
          { href: portalHref("newOrder", locale), icon: ShoppingBag, label: t.home.newOrder },
          { href: portalHref("support", locale), icon: LifeBuoy, label: t.home.contact },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-paper p-4 font-semibold ring-1 ring-line transition-shadow hover:shadow-[var(--shadow-soft)]">
            <Icon aria-hidden="true" className="size-5 text-coral-ink" /> {label}
          </Link>
        ))}
      </div>

    </>
  );
}
