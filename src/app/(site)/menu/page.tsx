import { Info } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { getMeals } from "@/lib/menu-repository";
import { ALLERGEN_DISCLAIMER, ROTATION_NOTES } from "@/data/menu";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Menu complet pour CPE et garderies",
  description:
    "Consultez le menu Bon Traiteur : volaille, bœuf, pâtes, poisson, plats végétariens, desserts et collations. Menu mensuel flexible pour les milieux de garde du Québec.",
  path: "/menu",
});

export default async function MenuPage() {
  const meals = await getMeals();

  return (
    <>
      <PageHero
        eyebrow="Menu complet"
        title={
          <>
            Le menu. <em>Et toutes vos alternatives.</em>
          </>
        }
        lead="Chaque mois, on vous propose un menu à partir de ces plats. Vous pouvez le garder, ou remplacer n'importe quel repas par une alternative de cette liste."
      >
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] bg-paper p-6 ring-1 ring-line">
            <p className="font-display text-lg font-bold">Rotation mensuelle</p>
            <p className="mt-1 text-sm text-ink-soft">{ROTATION_NOTES.mensuelle}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-saffron-soft p-6">
            <p className="font-display text-lg font-bold">Rotation ponctuelle</p>
            <p className="mt-1 text-sm text-ink-soft">{ROTATION_NOTES.ponctuelle}</p>
          </div>
        </div>
      </PageHero>

      <Container className="pb-8">
        <MenuExplorer meals={meals} />
        <p className="mt-12 flex max-w-3xl gap-3 rounded-[var(--radius-md)] bg-cream-deep p-5 text-sm text-ink-soft">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {ALLERGEN_DISCLAIMER} Les formats offerts (chaud, prêt-à-manger, congelé) peuvent varier selon le plat : confirmez avec
            notre équipe.
          </span>
        </p>
      </Container>

      <CTASection
        title={
          <>
            Envie de voir votre <em>premier menu?</em>
          </>
        }
      />
    </>
  );
}
