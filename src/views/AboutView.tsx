import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { PageHero } from "@/components/sections/PageHero";
import { Trust } from "@/components/sections/home/Trust";
import { CTASection } from "@/components/sections/CTASection";
import { getDictionary, type Locale } from "@/i18n";

export function AboutView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).aboutPage;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <Section tone="paper" labelledBy="story-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="grid grid-cols-2 gap-4">
              <Photo slot="kitchenTeam" locale={locale} className="col-span-2 aspect-[16/10] rounded-[var(--radius-xl)]" />
              <Photo slot="aboutKitchen" locale={locale} className="aspect-square rounded-[var(--radius-lg)]" showBrief={false} sizes="25vw" />
              <Photo slot="delivery" locale={locale} className="aspect-square rounded-[var(--radius-lg)]" showBrief={false} sizes="25vw" />
            </div>
            <div>
              <SectionHeading id="story-title" eyebrow={t.storyEyebrow} title={t.storyTitle} />
              <div className="mt-8 grid gap-5 text-lg text-ink-soft">
                {/* PLACEHOLDER — histoire réelle de Bon Traiteur à fournir. */}
                <p className="rounded-[var(--radius-md)] border border-dashed border-coral/60 bg-coral-soft/40 p-4 text-sm text-coral-ink">{t.storyPlaceholder}</p>
                {t.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Trust locale={locale} />
      <CTASection locale={locale} />
    </>
  );
}
