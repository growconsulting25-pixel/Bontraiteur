import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { testimonials } from "@/data/content";

export function Testimonials() {
  return (
    <Section tone="cream-deep" labelledBy="testimonials-title">
      <Container>
        <SectionHeading
          id="testimonials-title"
          eyebrow="Ils nous font confiance"
          title={
            <>
              Ce que disent <em className="text-olive">les directions.</em>
            </>
          }
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 80}>
              <TestimonialCard {...t} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
