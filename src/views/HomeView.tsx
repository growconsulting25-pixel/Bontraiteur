import { Hero } from "@/components/sections/home/Hero";
import { Situations } from "@/components/sections/home/Situations";
import { YourMenu } from "@/components/sections/home/YourMenu";
import { Formulas } from "@/components/sections/home/Formulas";
import { SimplifyDaily } from "@/components/sections/home/SimplifyDaily";
import { MenuTeaser } from "@/components/sections/home/MenuTeaser";
import { Audience } from "@/components/sections/home/Audience";
import { Trust } from "@/components/sections/home/Trust";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { CTASection } from "@/components/sections/CTASection";
import type { Locale } from "@/i18n";

export function HomeView({ locale }: { locale: Locale }) {
  return (
    <>
      <Hero locale={locale} />
      <Situations locale={locale} />
      <YourMenu locale={locale} />
      <Formulas locale={locale} />
      <SimplifyDaily locale={locale} />
      <MenuTeaser locale={locale} />
      <Audience locale={locale} />
      <Trust locale={locale} />
      <Testimonials locale={locale} />
      <CTASection locale={locale} />
    </>
  );
}
