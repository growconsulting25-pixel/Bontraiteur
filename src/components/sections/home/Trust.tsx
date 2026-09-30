import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { commitments } from "@/data/content";

/** Équipe & confiance — cuisine, livraison et engagements concrets. */
export function Trust() {
  return (
    <Section labelledBy="trust-title">
      <Container>
        <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
          <Photo slot="kitchenTeam" className="aspect-[4/3] rounded-[var(--radius-xl)] sm:aspect-auto sm:min-h-[26rem]" sizes="(min-width: 640px) 58vw, 100vw" />
          <Photo slot="delivery" className="aspect-[4/3] rounded-[var(--radius-xl)] sm:aspect-auto" sizes="(min-width: 640px) 40vw, 100vw" />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading
            id="trust-title"
            eyebrow="Notre équipe"
            title={
              <>
                Une cuisine, une équipe, <em className="text-olive">des engagements simples.</em>
              </>
            }
            lead="Derrière chaque livraison, il y a des gens qui préparent, portionnent, étiquettent et livrent. Et qui connaissent votre garderie par son nom."
          />
          <dl className="grid gap-x-10 sm:grid-cols-2">
            {commitments.map((c, i) => (
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
