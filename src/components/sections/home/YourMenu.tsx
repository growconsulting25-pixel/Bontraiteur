import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MenuPlanner, type PlannerDay } from "@/components/portal/MenuPlanner";
import { getMainMeals, mealName } from "@/lib/menu-repository";
import { getDictionary, href, rich, type Locale } from "@/i18n";

const demoMealIds = [
  "poulet-au-pesto-sur-riz-et-legumes",
  "macaroni-sauce-bolognaise",
  "curry-de-pois-chiches-et-chou-fleur-sur-riz",
  "pate-chinois",
  "fajitas-au-poulet-et-creme-de-mais",
];

export async function YourMenu({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.home.yourMenu;
  const meals = (await getMainMeals()).map((m) => ({ id: m.id, name: mealName(m, locale), category: m.category }));
  const days: PlannerDay[] = d.planner.days.map((day, i) => ({ ...day, mealId: demoMealIds[i] }));

  return (
    <Section labelledBy="your-menu-title">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow flex items-center gap-3 text-coral-ink">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
              {t.eyebrow}
            </p>
            <h2 id="your-menu-title" className="mt-5 text-h2 font-bold [&_em]:accent-serif [&_em]:text-olive">
              {rich(t.title)}
            </h2>
            <p className="text-lead mt-6 text-ink-soft">{t.lead}</p>
            <ol className="mt-10 grid gap-6">
              {t.steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-saffron font-display text-sm font-bold">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-ink-soft">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ButtonLink href={href("menu", locale)} className="mt-10" arrow>
              {t.cta}
            </ButtonLink>
          </div>

          <Reveal>
            <p className="mb-4 text-center text-sm font-semibold text-ink-soft">{t.tryIt}</p>
            <MenuPlanner meals={meals} initialDays={days} t={d.planner} categories={d.menu.categories} />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
