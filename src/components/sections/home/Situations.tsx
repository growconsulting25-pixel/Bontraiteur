import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { situations } from "@/data/content";

/** « Conçu pour les garderies » — la réalité quotidienne d'une direction. */
export function Situations() {
  return (
    <Section tone="cream-deep" labelledBy="situations-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow flex items-center gap-3 text-coral-ink">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
              Conçu pour les garderies
            </p>
            <h2 id="situations-title" className="mt-5 text-h2 font-bold">
              Les repas ne sont qu&apos;une des <em className="accent-serif text-olive">100 choses</em> à gérer aujourd&apos;hui.
            </h2>
            <p className="text-lead mt-6 max-w-lg text-ink-soft">
              Ratios, horaires, absences, parents, dossiers. On le sait. Notre rôle, c&apos;est que les repas ne soient plus une
              source de gestion.
            </p>
            <Photo slot="situationsTable" className="mt-10 hidden aspect-[16/11] rounded-[var(--radius-xl)] lg:block" sizes="40vw" />
          </div>

          <div>
            <ol className="border-t border-charcoal/15">
              {situations.map((s, i) => (
                <Reveal as="li" key={s.question} delay={i * 60} className="grid gap-2 border-b border-charcoal/15 py-7 sm:grid-cols-[3rem_1fr] sm:py-8">
                  <span aria-hidden="true" className="font-display text-sm font-bold text-coral-ink">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="font-display text-[clamp(1.4rem,1.1rem+1.1vw,2rem)] leading-tight font-bold tracking-tight">{s.question}</p>
                    <p className="mt-2 text-lg text-ink-soft">{s.answer}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Reveal className="mt-10 flex items-center gap-5">
              <span aria-hidden="true" className="h-px flex-1 bg-charcoal/15" />
              <p className="accent-serif text-[clamp(2rem,1.5rem+2vw,3.2rem)] text-olive">On s&apos;adapte.</p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
