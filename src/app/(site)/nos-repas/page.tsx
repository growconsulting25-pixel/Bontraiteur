import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { PageHero } from "@/components/sections/PageHero";
import { Formulas } from "@/components/sections/home/Formulas";
import { MenuTeaser } from "@/components/sections/home/MenuTeaser";
import { CTASection } from "@/components/sections/CTASection";
import { JsonLd, pageMetadata, serviceSchema } from "@/lib/seo";

const description =
  "Repas chauds, prêts-à-manger ou congelés pour CPE et garderies. Livraison régulière, commande ponctuelle ou service urgent selon disponibilité. Sans abonnement obligatoire.";

export const metadata = pageMetadata({ title: "Nos repas et formules pour garderies", description, path: "/nos-repas" });

const principles = [
  { title: "Des plats familiers", text: "Pâté chinois, macaroni, poulet, tourtière : des repas que les enfants reconnaissent et qu'ils mangent." },
  { title: "Des portions pour les tout-petits", text: "Les quantités sont pensées pour vos groupes, et ajustées selon le nombre d'enfants." },
  { title: "De la variété", text: "Une rotation mensuelle et des plats ponctuels, pour que le menu ne tourne pas en rond." },
];

export default function NosRepasPage() {
  return (
    <>
      <PageHero
        eyebrow="Nos repas"
        title={
          <>
            Des repas simples, bons, <em>et adaptés à votre garderie.</em>
          </>
        }
        lead="Choisissez le format et la fréquence qui fonctionnent pour vous. Vous pouvez les combiner et les changer en cours de route."
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/menu" size="lg" arrow>
            Voir notre menu
          </ButtonLink>
          <ButtonLink href="/soumission" size="lg" variant="secondary">
            Demander une soumission
          </ButtonLink>
        </div>
      </PageHero>

      <Formulas showHeading={false} />

      <Section labelledBy="principles-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <Photo slot="aboutKitchen" className="aspect-[4/3] rounded-[var(--radius-xl)]" />
            <div>
              <SectionHeading
                id="principles-title"
                eyebrow="Notre approche"
                title={
                  <>
                    Des repas pensés <em className="text-olive">pour les tout-petits.</em>
                  </>
                }
              />
              <dl className="mt-10 grid gap-6">
                {principles.map((p) => (
                  <div key={p.title} className="border-t border-line pt-5">
                    <dt className="font-display text-xl font-bold">{p.title}</dt>
                    <dd className="mt-1 text-ink-soft">{p.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <MenuTeaser />
      <CTASection />
      <JsonLd data={serviceSchema({ name: "Repas pour CPE et garderies", description, path: "/nos-repas" })} />
    </>
  );
}
