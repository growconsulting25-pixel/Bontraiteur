import { Download, Info } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { SampleWeeks } from "@/components/menu/SampleWeeks";
import { mealCardLabels } from "@/components/cards/MealCard";
import { getMeals } from "@/lib/menu-repository";
import { sampleWeeks } from "@/lib/menu-sample";
import { ButtonLink } from "@/components/ui/Button";
import { getDictionary, href, type Locale } from "@/i18n";

export async function MenuView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.menu;
  const meals = await getMeals();

  const download = (
    <a
      href={`/api/menu-pdf/${locale}`}
      download={t.pdfFile}
      className="inline-flex h-12 items-center gap-2.5 rounded-full bg-charcoal px-6 text-[0.95rem] font-semibold text-cream transition-colors hover:bg-olive-deep"
    >
      <Download aria-hidden="true" className="size-4" /> {t.download}
    </a>
  );

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
        <div className="mt-8 flex flex-col items-start gap-2">
          {download}
          <p className="text-sm text-ink-soft">{t.downloadHint}</p>
        </div>
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

      {/* Exemple de 2 semaines, comme le menu affiché à la garderie */}
      <Section tone="cream-deep" labelledBy="sample-title">
        <Container>
          <SectionHeading id="sample-title" eyebrow={t.sampleEyebrow} title={t.sampleTitle} lead={t.sampleLead} />
          <div className="mt-10">
            <SampleWeeks weeks={sampleWeeks(meals)} locale={locale} t={t} cal={d.calendar} />
          </div>
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-sm text-ink-soft">{t.sampleNote}</p>
            <ButtonLink href={href("quote", locale)} arrow className="shrink-0 self-start sm:self-auto">
              {d.nav.quote}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Tous les plats */}
      <Section labelledBy="full-menu-title">
        <Container>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading id="full-menu-title" eyebrow={t.fullEyebrow} title={t.fullTitle} />
            <div className="shrink-0">{download}</div>
          </div>
          <div className="mt-8">
            <MenuExplorer meals={meals} locale={locale} t={t} cardLabels={mealCardLabels(d)} />
          </div>
          <p className="mt-10 flex max-w-3xl gap-3 rounded-[var(--radius-md)] bg-cream-deep p-5 text-sm text-ink-soft">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              {t.allergenDisclaimer} {t.formatsNote}
            </span>
          </p>
        </Container>
      </Section>

      <CTASection locale={locale} title={t.ctaTitle} />
    </>
  );
}
