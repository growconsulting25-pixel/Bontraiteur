import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { getDictionary, href, type Locale } from "@/i18n";
import { JsonLd, faqSchema, breadcrumbSchema } from "@/lib/seo";

export function FaqView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.faqPage;
  const groups = Object.entries(t.groups);

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <Container size="narrow" className="pb-8">
        <div className="grid gap-14">
          {groups.map(([key, label]) => (
            <section key={key} aria-labelledby={`faq-${key}`}>
              <h2 id={`faq-${key}`} className="font-display text-h3 font-bold">
                {label}
              </h2>
              <div className="mt-5 border-t border-line">
                {t.items
                  .filter((item) => item.group === key)
                  .map((item) => (
                    <details key={item.question} className="group border-b border-line">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                        {item.question}
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream-deep transition-transform duration-300 group-open:rotate-45">
                          <Plus aria-hidden="true" className="size-4" />
                        </span>
                      </summary>
                      <p className="pr-12 pb-6 text-ink-soft">{item.answer}</p>
                    </details>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={href("contact", locale)} arrow>
            {t.contactCta}
          </ButtonLink>
          <ButtonLink href={href("quote", locale)} variant="secondary">
            {d.nav.quote}
          </ButtonLink>
        </div>
      </Container>

      <CTASection locale={locale} />
      <JsonLd data={faqSchema(t.items)} />
      <JsonLd data={breadcrumbSchema("faq", locale)} />
    </>
  );
}
