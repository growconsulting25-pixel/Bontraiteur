import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MenuCalendar, type CalendarDay } from "@/components/portal/calendar/MenuCalendar";
import { generateMenuDays } from "@/lib/admin/menu-generator";
import { getMeals } from "@/lib/menu-repository";
import { mealName } from "@/lib/meal-name";
import { formatMonth } from "@/lib/format";
import { getDictionary, href, rich, type Locale } from "@/i18n";

/** Mois de démonstration (fixe, pour que la page reste statique). */
const DEMO_MONTH = "2026-11-01";

export async function YourMenu({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.home.yourMenu;
  const meals = await getMeals();

  // Les deux premières semaines du mois, générées comme dans le back-office
  const demoDays: CalendarDay[] = generateMenuDays(DEMO_MONTH, meals)
    .slice(0, 10)
    .map((day) => ({
      id: day.date,
      date: day.date,
      slots: { collation_am: day.snack_am_id, repas: day.meal_id, dessert: day.dessert_id, collation_pm: day.snack_pm_id },
      originals: {},
    }));
  const calendarMeals = meals.map((m) => ({
    id: m.id,
    name: mealName(m, locale),
    category: d.menu.categories[m.category],
    type: m.mealType,
    allergens: m.allergens,
  }));

  return (
    <Section labelledBy="your-menu-title">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-3 text-coral-ink">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
              {t.eyebrow}
            </p>
            <h2 id="your-menu-title" className="mt-5 text-h2 font-bold [&_em]:accent-serif [&_em]:text-olive">
              {rich(t.title)}
            </h2>
            <p className="text-lead mt-6 text-ink-soft">{t.lead}</p>
          </div>
          <ol className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {t.steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-saffron font-display text-sm font-bold">{i + 1}</span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-ink-soft">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-12 rounded-[var(--radius-2xl)] bg-cream-deep p-3 sm:p-6 lg:p-8">
          <p className="mb-4 text-center text-sm font-semibold text-ink-soft">{t.tryIt}</p>
          <MenuCalendar
            demo
            locale={locale}
            menuId="demo"
            status="publie"
            initialDays={demoDays}
            meals={calendarMeals}
            editable
            mode="client"
            t={d.calendar}
            statusLabels={d.portal.menuStatus}
            monthLabel={formatMonth(DEMO_MONTH, locale)}
            establishmentName="Bon Traiteur"
          />
        </Reveal>

        <ButtonLink href={href("menu", locale)} className="mt-10" arrow>
          {t.cta}
        </ButtonLink>
      </Container>
    </Section>
  );
}
