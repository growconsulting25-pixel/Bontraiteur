import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { PageHero } from "@/components/sections/PageHero";
import { YourMenu } from "@/components/sections/home/YourMenu";
import { SimplifyDaily } from "@/components/sections/home/SimplifyDaily";
import { CTASection } from "@/components/sections/CTASection";
import { getDictionary, type Locale } from "@/i18n";

export function HowItWorksView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.howPage;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <Section tone="paper" labelledBy="steps-title">
        <Container>
          <h2 id="steps-title" className="sr-only">
            {t.stepsTitle}
          </h2>
          <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {t.steps.map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 80} className="flex flex-col rounded-[var(--radius-xl)] bg-cream p-7 ring-1 ring-line">
                <span className="font-display text-5xl font-extrabold text-saffron">{s.step}</span>
                <h3 className="mt-6 font-display text-h3 font-bold">{s.title}</h3>
                <p className="mt-3 text-ink-soft">{s.text}</p>
              </Reveal>
            ))}
          </ol>
          <Photo slot="delivery" locale={locale} showBrief={false} className="mt-10 aspect-[4/3] rounded-[var(--radius-xl)] sm:aspect-[16/9] lg:aspect-[2/1]" sizes="(min-width: 1280px) 1200px, 100vw" />
        </Container>
      </Section>

      <YourMenu locale={locale} />

      <Section tone="cream-deep" labelledBy="flex-title">
        <Container>
          <SectionHeading id="flex-title" eyebrow={t.flexEyebrow} title={t.flexTitle} />
          <dl className="mt-12 grid gap-x-10 md:grid-cols-2">
            {t.flexibility.map((f) => (
              <div key={f.q} className="flex flex-col gap-1 border-t border-charcoal/15 py-6">
                <dt className="font-display text-xl font-bold">{f.q}</dt>
                <dd className="text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-ink-soft">{d.urgentNote}</p>
        </Container>
      </Section>

      <SimplifyDaily locale={locale} />
      <CTASection locale={locale} />
    </>
  );
}
