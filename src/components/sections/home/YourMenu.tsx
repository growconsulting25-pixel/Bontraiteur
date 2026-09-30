import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MenuPlanner, type PlannerDay } from "@/components/portal/MenuPlanner";
import { getMainMeals } from "@/lib/menu-repository";

const demoWeek: PlannerDay[] = [
  { label: "Lundi", date: "2 nov.", mealId: "poulet-au-pesto-sur-riz-et-legumes" },
  { label: "Mardi", date: "3 nov.", mealId: "macaroni-sauce-bolognaise" },
  { label: "Mercredi", date: "4 nov.", mealId: "curry-de-pois-chiches-et-chou-fleur-sur-riz" },
  { label: "Jeudi", date: "5 nov.", mealId: "pate-chinois" },
  { label: "Vendredi", date: "6 nov.", mealId: "fajitas-au-poulet-et-creme-de-mais" },
];

const steps = [
  { title: "Vous gardez le menu?", text: "Un clic suffit. C'est confirmé." },
  { title: "Vous voulez changer un repas?", text: "Choisissez simplement une alternative dans le menu complet." },
  { title: "Vous confirmez.", text: "Normalement jusqu'à 2 semaines avant la période concernée." },
];

export async function YourMenu() {
  const meals = (await getMainMeals()).map(({ id, name, category }) => ({ id, name, category }));

  return (
    <Section labelledBy="your-menu-title">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow flex items-center gap-3 text-coral-ink">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
              Votre menu, votre façon
            </p>
            <h2 id="your-menu-title" className="mt-5 text-h2 font-bold">
              Un menu chaque mois. <em className="accent-serif text-olive">Vous gardez le contrôle.</em>
            </h2>
            <p className="text-lead mt-6 text-ink-soft">
              Chaque mois, Bon Traiteur vous propose un menu varié. Vous le gardez tel quel, ou vous remplacez les repas que
              vous voulez.
            </p>
            <ol className="mt-10 grid gap-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-saffron font-display text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-ink-soft">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ButtonLink href="/menu" className="mt-10" arrow>
              Voir notre menu
            </ButtonLink>
          </div>

          <Reveal>
            <p className="mb-4 text-center text-sm font-semibold text-ink-soft">
              Essayez-le : cliquez sur « Modifier mon menu »
            </p>
            <MenuPlanner meals={meals} initialDays={demoWeek} monthLabel="novembre" deadlineLabel="16 octobre" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
