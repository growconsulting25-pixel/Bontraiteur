import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { PageHero } from "@/components/sections/PageHero";
import { Formulas } from "@/components/sections/home/Formulas";
import { MenuTeaser } from "@/components/sections/home/MenuTeaser";
import { CTASection } from "@/components/sections/CTASection";
import { getDictionary, href, type Locale } from "@/i18n";
import { JsonLd, serviceSchema } from "@/lib/seo";

export function MealsView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.mealsPage;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={href("menu", locale)} size="lg" arrow>
            {d.home.hero.ctaMenu}
          </ButtonLink>
          <ButtonLink href={href("quote", locale)} size="lg" variant="secondary">
            {d.nav.quote}
          </ButtonLink>
        </div>
      </PageHero>

      <Formulas locale={locale} showHeading={false} />

      <Section labelledBy="principles-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <Photo slot="kidsSnack" locale={locale} showBrief={false} className="aspect-[4/3] rounded-[var(--radius-xl)]" sizes="(min-width: 1024px) 50vw, 100vw" />
            <div>
              <SectionHeading id="principles-title" eyebrow={t.approachEyebrow} title={t.approachTitle} />
              <dl className="mt-10 grid gap-6">
                {t.principles.map((p) => (
                  <div key={p.title} className="border-t border-line pt-5">
                    <dt className="font-display text-xl font-bold">{p.title}</dt>
                    <dd className="mt-1 text-ink-soft">{p.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <MenuTeaser locale={locale} />
      <CTASection locale={locale} />
      <JsonLd data={serviceSchema("meals", locale)} />
    </>
  );
}
