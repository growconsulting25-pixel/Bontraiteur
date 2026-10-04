import { Hero } from "@/components/sections/home/Hero";
import { Situations } from "@/components/sections/home/Situations";
import { Formulas } from "@/components/sections/home/Formulas";
import { SimplifyDaily } from "@/components/sections/home/SimplifyDaily";
import { MenuTeaser } from "@/components/sections/home/MenuTeaser";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { CTASection } from "@/components/sections/CTASection";
import type { Locale } from "@/i18n";

export function HomeView({ locale }: { locale: Locale }) {
  return (
    <>
      <Hero locale={locale} />
      <MenuTeaser locale={locale} />
      <Situations locale={locale} />
      <SimplifyDaily locale={locale} learnMore />
      <Formulas locale={locale} />
      <Testimonials locale={locale} />
      <CTASection locale={locale} />
    </>
  );
}
