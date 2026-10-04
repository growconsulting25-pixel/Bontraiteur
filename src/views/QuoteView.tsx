import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { site } from "@/data/site";
import { getDictionary, type Locale } from "@/i18n";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";

export function QuoteView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.quotePage;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
      <Container className="pb-section">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <QuoteForm locale={locale} t={t.form} optional={d.common.optional} />
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-coral-ink">{t.nextTitle}</p>
            <ol className="mt-6 grid gap-6">
              {t.next.map((n, i) => (
                <li key={n.title} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-saffron font-display text-sm font-bold">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-ink-soft">{n.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 rounded-[var(--radius-lg)] bg-cream-deep p-6">
              <p className="font-semibold">{t.preferCall}</p>
              {site.contact.phones.map((p) => (
                <a key={p.href} href={p.href} className="mt-1 block font-display text-2xl font-bold hover:text-olive">
                  {p.display}
                </a>
              ))}
              <p className="mt-1 text-sm text-ink-soft">{d.contact.hours}</p>
            </div>
          </aside>
        </div>
      </Container>
      <JsonLd data={breadcrumbSchema("quote", locale)} />
    </>
  );
}
