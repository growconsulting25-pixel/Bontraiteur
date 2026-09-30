import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: { absolute: "Bon Traiteur — Repas pour CPE, garderies et services de garde au Québec" },
  description:
    "Des repas qui plaisent aux enfants, un service qui simplifie vos journées. Menus mensuels flexibles, repas chauds, prêts-à-manger ou congelés, livraison régulière ou urgente.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Situations />
      <YourMenu />
      <Formulas />
      <SimplifyDaily />
      <MenuTeaser />
      <Audience />
      <Trust />
      <Testimonials />
      <CTASection />
    </>
  );
}
