import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { getDictionary, href, type Locale } from "@/i18n";

/** « Conçu pour les milieux de garde » — une clientèle, trois déclinaisons. */
export function Audience({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.home.audience;
  return (
    <Section tone="cream-deep" labelledBy="audience-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <SectionHeading id="audience-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
          <Photo slot="kidsEating" locale={locale} className="aspect-[16/10] rounded-[var(--radius-xl)]" sizes="(min-width: 1024px) 40vw, 100vw" />
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {d.audienceProfiles.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 80} className="flex flex-col rounded-[var(--radius-xl)] bg-paper p-7 ring-1 ring-line sm:p-8">
              <p className="font-display text-[clamp(2rem,1.6rem+1.4vw,2.75rem)] leading-none font-extrabold">{p.title}</p>
              <p className="mt-5 flex-1 text-ink-soft">{p.summary}</p>
            </Reveal>
          ))}
        </ul>
        <ButtonLink href={href("daycares", locale)} className="mt-10" arrow>
          {t.cta}
        </ButtonLink>
      </Container>
    </Section>
  );
}
