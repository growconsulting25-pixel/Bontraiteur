import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { PageHero } from "@/components/sections/PageHero";
import { Trust } from "@/components/sections/home/Trust";
import { CTASection } from "@/components/sections/CTASection";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "À propos",
  description:
    "Depuis plus de 15 ans, Bon Traiteur prépare et livre des repas pour les CPE, garderies et services de garde du Québec.",
  path: "/a-propos",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title={
          <>
            Plus de 15 ans à nourrir <em>des enfants en garderie.</em>
          </>
        }
        lead="Bon Traiteur, c'est une cuisine, une équipe de livraison et des gens qui comprennent la réalité des milieux de garde."
      />

      <Section tone="paper" labelledBy="story-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="grid grid-cols-2 gap-4">
              <Photo slot="kitchenTeam" className="col-span-2 aspect-[16/10] rounded-[var(--radius-xl)]" />
              <Photo slot="aboutKitchen" className="aspect-square rounded-[var(--radius-lg)]" showBrief={false} />
              <Photo slot="delivery" className="aspect-square rounded-[var(--radius-lg)]" showBrief={false} />
            </div>
            <div>
              <SectionHeading
                id="story-title"
                eyebrow="Notre histoire"
                title={
                  <>
                    Une seule mission : <em className="text-olive">bien nourrir, simplement.</em>
                  </>
                }
              />
              {/* PLACEHOLDER — à remplacer par l'histoire réelle de Bon Traiteur (fondation, fondateurs, cuisine, région). */}
              <div className="mt-8 grid gap-5 text-lg text-ink-soft">
                <p className="rounded-[var(--radius-md)] border border-dashed border-coral/60 bg-coral-soft/40 p-4 text-sm text-coral-ink">
                  [Texte à venir] Histoire de Bon Traiteur : année de fondation, fondateurs, emplacement de la cuisine, région
                  desservie, anecdote marquante.
                </p>
                <p>
                  Depuis plus de 15 ans, nous préparons des repas pour les milieux de garde. Avec le temps, on a compris une chose :
                  une direction de garderie n&apos;a pas besoin d&apos;un fournisseur de plus à gérer. Elle a besoin qu&apos;on lui
                  enlève quelque chose de sa liste.
                </p>
                <p>
                  C&apos;est pour ça qu&apos;on travaille avec un menu mensuel simple à confirmer, des quantités qui s&apos;ajustent
                  et une équipe qui répond quand il y a un imprévu.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Trust />
      <CTASection />
    </>
  );
}
