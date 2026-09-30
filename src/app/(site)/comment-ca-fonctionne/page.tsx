import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/sections/PageHero";
import { YourMenu } from "@/components/sections/home/YourMenu";
import { SimplifyDaily } from "@/components/sections/home/SimplifyDaily";
import { CTASection } from "@/components/sections/CTASection";
import { howItWorks } from "@/data/content";
import { URGENT_NOTE } from "@/data/offers";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Comment ça fonctionne",
  description:
    "Soumission, menu mensuel à garder ou modifier, confirmation et livraison : voici comment Bon Traiteur simplifie les repas de votre CPE ou garderie.",
  path: "/comment-ca-fonctionne",
});

const flexibility = [
  { q: "Vous gardez le menu?", a: "Un clic suffit." },
  { q: "Vous voulez changer un repas?", a: "Choisissez simplement une alternative." },
  { q: "Besoin de repas supplémentaires?", a: "Ajoutez-les à votre commande." },
  { q: "Un imprévu?", a: "Communiquez rapidement avec notre équipe." },
  { q: "Une modification tardive?", a: "Elle peut devenir une demande urgente, selon les disponibilités." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="Comment ça fonctionne"
        title={
          <>
            Quatre étapes. <em>Puis, presque rien à gérer.</em>
          </>
        }
        lead="Une fois votre service en place, la seule chose à faire chaque mois, c'est confirmer votre menu."
      />

      <Section tone="paper" labelledBy="steps-title">
        <Container>
          <h2 id="steps-title" className="sr-only">
            Les étapes
          </h2>
          <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {howItWorks.map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 80} className="flex flex-col rounded-[var(--radius-xl)] bg-cream p-7 ring-1 ring-line">
                <span className="font-display text-5xl font-extrabold text-saffron">{s.step}</span>
                <h3 className="mt-6 font-display text-h3 font-bold">{s.title}</h3>
                <p className="mt-3 text-ink-soft">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <YourMenu />

      <Section tone="cream-deep" labelledBy="flex-title">
        <Container>
          <SectionHeading
            id="flex-title"
            eyebrow="En cours de route"
            title={
              <>
                Ça change? <em className="text-olive">On s&apos;ajuste.</em>
              </>
            }
          />
          <dl className="mt-12 grid gap-x-10 md:grid-cols-2">
            {flexibility.map((f) => (
              <div key={f.q} className="flex flex-col gap-1 border-t border-charcoal/15 py-6">
                <dt className="font-display text-xl font-bold">{f.q}</dt>
                <dd className="text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-ink-soft">{URGENT_NOTE}</p>
        </Container>
      </Section>

      <SimplifyDaily />
      <CTASection />
    </>
  );
}
