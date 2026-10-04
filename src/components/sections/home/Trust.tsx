import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary, type Locale } from "@/i18n";

/** Équipe & confiance — engagements concrets (les photos équipe et camion sont dans l'en-tête). */
export function Trust({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.home.trust;
  return (
    <Section labelledBy="trust-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
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
