import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MealCard, mealCardLabels } from "@/components/cards/MealCard";
import { getMeals } from "@/lib/menu-repository";
import { format, getDictionary, href, type Locale } from "@/i18n";

const featured = [
  "poulet-au-pesto-sur-riz-et-legumes",
  "macaroni-sauce-bolognaise",
  "tofu-general-tao-sur-riz-aux-legumes",
  "pate-au-saumon-primavera",
];

export async function MenuTeaser({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.home.menuTeaser;
  const all = await getMeals();
  const meals = featured.map((slug) => all.find((m) => m.slug === slug)).filter((m) => m !== undefined);
  const mainCount = all.filter((m) => m.mealType === "repas").length;
  const labels = mealCardLabels(d);

  return (
    <Section labelledBy="menu-teaser-title" className="pt-4! sm:pt-6!">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="menu-teaser-title" eyebrow={t.eyebrow} title={t.title} lead={format(t.lead, { count: mainCount })} />
          <ButtonLink href={href("menu", locale)} variant="secondary" arrow className="self-start lg:self-auto">
            {t.cta}
          </ButtonLink>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {meals.map((meal, i) => (
            <Reveal key={meal.id} delay={i * 70}>
              <MealCard meal={meal} locale={locale} t={labels} />
            </Reveal>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm text-ink-soft">{d.menu.allergenDisclaimer}</p>
      </Container>
    </Section>
  );
}
