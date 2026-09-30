import { Info } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { mealCardLabels } from "@/components/cards/MealCard";
import { getMeals } from "@/lib/menu-repository";
import { getDictionary, type Locale } from "@/i18n";

export async function MenuView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.menu;
  const meals = await getMeals();

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] bg-paper p-6 ring-1 ring-line">
            <p className="font-display text-lg font-bold">{t.monthlyTitle}</p>
            <p className="mt-1 text-sm text-ink-soft">{t.monthlyNote}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-saffron-soft p-6">
            <p className="font-display text-lg font-bold">{t.occasionalTitle}</p>
            <p className="mt-1 text-sm text-ink-soft">{t.occasionalNote}</p>
          </div>
        </div>
      </PageHero>

      <Container className="pb-8">
        <MenuExplorer meals={meals} locale={locale} t={t} cardLabels={mealCardLabels(d)} />
        <p className="mt-12 flex max-w-3xl gap-3 rounded-[var(--radius-md)] bg-cream-deep p-5 text-sm text-ink-soft">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {t.allergenDisclaimer} {t.formatsNote}
          </span>
        </p>
      </Container>

      <CTASection locale={locale} title={t.ctaTitle} />
    </>
  );
}
