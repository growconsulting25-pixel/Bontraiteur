import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MealCard } from "@/components/cards/MealCard";
import { getMeals } from "@/lib/menu-repository";
import { ALLERGEN_DISCLAIMER } from "@/data/menu";

const featured = [
  "poulet-au-pesto-sur-riz-et-legumes",
  "macaroni-sauce-bolognaise",
  "tofu-general-tao-sur-riz-aux-legumes",
  "pate-au-saumon-primavera",
];

export async function MenuTeaser() {
  const all = await getMeals();
  const meals = featured.map((slug) => all.find((m) => m.slug === slug)).filter((m) => m !== undefined);
  const mainCount = all.filter((m) => m.mealType === "repas").length;

  return (
    <Section labelledBy="menu-teaser-title">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            id="menu-teaser-title"
            eyebrow="Le menu"
            title={
              <>
                Des plats que les enfants <em className="text-olive">reconnaissent.</em>
              </>
            }
            lead={`Poulet, pâtes, bœuf, poisson, végétarien : ${mainCount} plats en rotation, plus des desserts et des collations.`}
          />
          <ButtonLink href="/menu" variant="secondary" arrow className="self-start lg:self-auto">
            Voir le menu complet
          </ButtonLink>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {meals.map((meal, i) => (
            <Reveal key={meal.id} delay={i * 70}>
              <MealCard meal={meal} />
            </Reveal>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm text-ink-soft">{ALLERGEN_DISCLAIMER}</p>
      </Container>
    </Section>
  );
}
