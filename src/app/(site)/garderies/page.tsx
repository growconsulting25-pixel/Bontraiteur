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
import { audienceProfiles } from "@/data/content";
import { JsonLd, pageMetadata, serviceSchema } from "@/lib/seo";

const description =
  "Service de repas conçu pour les CPE, garderies subventionnées, garderies privées et services de garde du Québec. Menu mensuel flexible, quantités ajustables, dépannage rapide.";

export const metadata = pageMetadata({ title: "Service de repas pour garderies et CPE", description, path: "/garderies" });

const reasons = [
  { title: "Vous gardez de la flexibilité", text: "Service régulier, sans perdre la possibilité de changer un repas, des quantités ou une date." },
  { title: "Vous gérez moins", text: "Un menu à confirmer, des livraisons planifiées, une personne à appeler. C'est tout." },
  { title: "On vous dépanne", text: "Un imprévu? Une livraison urgente peut être organisée sous 48 h, selon les disponibilités et la zone." },
  { title: "Vous parlez à des gens", text: "Une équipe qui connaît les milieux de garde et qui vous répond directement." },
];

export default function GarderiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Pour les garderies et CPE"
        title={
          <>
            Le service de repas qui <em>s&apos;adapte à votre garderie.</em>
          </>
        }
        lead="CPE, garderies subventionnées ou privées, services de garde : vous avez un point en commun. Des enfants à nourrir tous les jours, et déjà beaucoup trop de choses à gérer."
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/soumission" size="lg" arrow>
            Demander une soumission
          </ButtonLink>
          <ButtonLink href="/comment-ca-fonctionne" size="lg" variant="secondary">
            Comment ça fonctionne
          </ButtonLink>
        </div>
      </PageHero>

      <Container className="pb-4">
        <Photo slot="heroMain" className="aspect-[16/9] rounded-[var(--radius-2xl)] sm:aspect-[21/9]" sizes="100vw" />
      </Container>

      <Section labelledBy="profiles-title">
        <Container>
          <SectionHeading
            id="profiles-title"
            eyebrow="Une clientèle, trois réalités"
            title={
              <>
                Pensé pour <em className="text-olive">votre type de milieu.</em>
              </>
            }
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {audienceProfiles.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 80} className="rounded-[var(--radius-xl)] bg-paper p-8 ring-1 ring-line">
                <p className="font-display text-[2.4rem] leading-none font-extrabold">{p.title}</p>
                <p className="mt-5 text-ink-soft">{p.summary}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Situations />

      <Section labelledBy="reasons-title">
        <Container>
          <SectionHeading
            id="reasons-title"
            eyebrow="Pourquoi Bon Traiteur"
            title={
              <>
                Un service régulier. <em className="text-olive">Sans perdre votre flexibilité.</em>
              </>
            }
          />
          <div className="mt-12 grid gap-x-10 gap-y-2 md:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.title} className="border-t border-line py-7">
                <h3 className="font-display text-h3 font-bold">{r.title}</h3>
                <p className="mt-2 text-ink-soft">{r.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <SimplifyDaily />
      <Testimonials />
      <CTASection />
      <JsonLd data={serviceSchema({ name: "Service de repas pour garderies et CPE", description, path: "/garderies" })} />
    </>
  );
}
