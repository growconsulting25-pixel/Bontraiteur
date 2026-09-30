import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { getDictionary, type Locale } from "@/i18n";

export function Testimonials({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.home.testimonials;
  return (
    <Section tone="cream-deep" labelledBy="testimonials-title">
      <Container>
        <SectionHeading id="testimonials-title" eyebrow={t.eyebrow} title={t.title} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {d.testimonials.map((item, i) => (
            <Reveal key={item.id} delay={i * 80}>
              {/* Tous les témoignages actuels sont des placeholders (id « placeholder-* »). */}
              <TestimonialCard {...item} placeholderBadge={item.id.startsWith("placeholder") ? t.placeholderBadge : undefined} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
