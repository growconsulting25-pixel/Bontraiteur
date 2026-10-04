import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/sections/PageHero";
import { Situations } from "@/components/sections/home/Situations";
import { SimplifyDaily } from "@/components/sections/home/SimplifyDaily";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { CTASection } from "@/components/sections/CTASection";
import { getDictionary, href, type Locale } from "@/i18n";
import { JsonLd, serviceSchema, breadcrumbSchema } from "@/lib/seo";

export function DaycaresView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.daycaresPage;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={href("quote", locale)} size="lg" arrow>
            {d.nav.quote}
          </ButtonLink>
          <ButtonLink href={href("howItWorks", locale)} size="lg" variant="secondary">
            {t.ctaHow}
          </ButtonLink>
        </div>
      </PageHero>

      <Container className="pb-4">
        <Photo slot="heroMain" locale={locale} className="aspect-[16/9] rounded-[var(--radius-2xl)] sm:aspect-[21/9]" sizes="100vw" />
      </Container>

      <Section labelledBy="profiles-title">
        <Container>
          <SectionHeading id="profiles-title" eyebrow={t.profilesEyebrow} title={t.profilesTitle} />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {d.audienceProfiles.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 80} className="rounded-[var(--radius-xl)] bg-paper p-8 ring-1 ring-line">
                <p className="font-display text-[2.4rem] leading-none font-extrabold">{p.title}</p>
                <p className="mt-5 text-ink-soft">{p.summary}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Situations locale={locale} />

      <Section labelledBy="reasons-title">
        <Container>
          <SectionHeading id="reasons-title" eyebrow={t.reasonsEyebrow} title={t.reasonsTitle} />
          <div className="mt-12 grid gap-x-10 gap-y-2 md:grid-cols-2">
            {t.reasons.map((r) => (
              <div key={r.title} className="border-t border-line py-7">
                <h3 className="font-display text-h3 font-bold">{r.title}</h3>
                <p className="mt-2 text-ink-soft">{r.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <SimplifyDaily locale={locale} />
      <Testimonials locale={locale} />
      <CTASection locale={locale} />
      <JsonLd data={serviceSchema("daycares", locale)} />
      <JsonLd data={breadcrumbSchema("daycares", locale)} />
    </>
  );
}
