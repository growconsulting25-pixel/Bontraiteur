import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary, type Locale } from "@/i18n";

/** Équipe & confiance — photos de l'équipe et de la cuisine, engagements concrets. */
export function Trust({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.home.trust;
  return (
    <Section labelledBy="trust-title">
      <Container>
        <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
          <Photo slot="teamPrep" locale={locale} showBrief={false} className="aspect-[4/3] rounded-[var(--radius-xl)] sm:aspect-auto sm:min-h-[26rem]" sizes="(min-width: 640px) 58vw, 100vw" />
          <Photo slot="kitchenSpace" locale={locale} showBrief={false} className="aspect-[4/3] rounded-[var(--radius-xl)] sm:aspect-auto" sizes="(min-width: 640px) 40vw, 100vw" />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading id="trust-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
          <dl className="grid gap-x-10 sm:grid-cols-2">
            {d.commitments.map((c, i) => (
              <Reveal key={c.title} delay={(i % 2) * 80} className="border-t border-line py-6">
                <dt className="font-display text-xl font-bold">{c.title}</dt>
                <dd className="mt-2 text-ink-soft">{c.text}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
