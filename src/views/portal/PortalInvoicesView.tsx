import { CreditCard, FileDown } from "lucide-react";
import { Card, EmptyState, Notice, PageTitle, StatusPill } from "@/components/portal/ui/PortalUI";
import { requireClient } from "@/lib/auth";
import { getInvoices } from "@/lib/portal/data";
import { payInvoice } from "@/lib/actions/payments";
import { isStripeConfigured } from "@/lib/stripe";
import { formatDate, formatMoney } from "@/lib/format";
import { invoiceTone } from "@/lib/portal/status";
import { format, getDictionary, type Locale } from "@/i18n";

export async function PortalInvoicesView({ locale, payment }: { locale: Locale; payment?: string }) {
  const ctx = await requireClient(locale);
  const t = getDictionary(locale).portal.invoices;

  if (!ctx.canSeeInvoices) {
    return (
      <>
        <PageTitle title={t.title} lead={t.lead} />
        <EmptyState>{t.noAccess}</EmptyState>
      </>
    );
  }

  const invoices = await getInvoices(ctx.organization.id);
  const payable = isStripeConfigured();

  return (
    <>
      <PageTitle title={t.title} lead={t.lead} />
      <div className="mb-6 grid gap-3">
        {payment === "succes" && <Notice tone="success">{t.paymentSuccess}</Notice>}
        {payment === "annule" && <Notice>{t.paymentCancelled}</Notice>}
        {payment === "indisponible" && <Notice>{t.paymentUnavailable}</Notice>}
      </div>

      {invoices.length === 0 ? (
        <EmptyState>{t.empty}</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {invoices
            .filter((invoice) => invoice.status !== "brouillon")
            .map((invoice) => (
              <li key={invoice.id}>
                <Card className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold">
                      {invoice.number} · {formatMoney(invoice.amount_cents, locale, invoice.currency)}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {invoice.paid_at
                        ? format(t.paidOn, { date: formatDate(invoice.paid_at.slice(0, 10), locale) })
                        : invoice.due_date
                          ? format(t.due, { date: formatDate(invoice.due_date, locale) })
                          : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={invoiceTone[invoice.status]}>{t.status[invoice.status]}</StatusPill>
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-line hover:ring-charcoal"
                      >
                        <FileDown aria-hidden="true" className="size-3.5" /> {t.download}
                      </a>
                    )}
                    {payable && ["a_payer", "en_retard"].includes(invoice.status) && (
                      <form action={payInvoice}>
                        <input type="hidden" name="invoiceId" value={invoice.id} />
                        <input type="hidden" name="locale" value={locale} />
                        <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-olive px-4 py-2 text-xs font-bold text-cream hover:bg-olive-deep">
                          <CreditCard aria-hidden="true" className="size-3.5" /> {t.pay}
                        </button>
                      </form>
                    )}
                  </div>
                </Card>
              </li>
            ))}
        </ul>
      )}
    </>
  );
}
