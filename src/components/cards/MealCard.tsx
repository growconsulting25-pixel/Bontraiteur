import Image from "next/image";
import type { Meal, MealCategory } from "@/lib/types";
import { allergenLabels, categoryLabels, rotationLabels } from "@/data/menu";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const plateTone: Record<MealCategory, { bg: string; rim: string; dot: string }> = {
  volaille: { bg: "bg-saffron-soft", rim: "border-saffron", dot: "bg-saffron" },
  boeuf: { bg: "bg-coral-soft", rim: "border-coral", dot: "bg-coral" },
  pates: { bg: "bg-saffron-soft", rim: "border-coral/70", dot: "bg-coral" },
  poisson: { bg: "bg-olive-soft", rim: "border-olive/60", dot: "bg-olive" },
  vegetarien: { bg: "bg-olive-soft", rim: "border-olive", dot: "bg-olive" },
  autres: { bg: "bg-cream-deep", rim: "border-charcoal/25", dot: "bg-charcoal" },
  desserts: { bg: "bg-coral-soft", rim: "border-saffron", dot: "bg-saffron" },
  collations: { bg: "bg-cream-deep", rim: "border-olive/50", dot: "bg-olive" },
};

/** Visuel de remplacement : l'assiette de la marque, teintée par catégorie. */
function PlatePlaceholder({ category }: { category: MealCategory }) {
  const tone = plateTone[category];
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center", tone.bg)} aria-hidden="true">
      <div className="relative aspect-square h-[68%] transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105 group-hover:rotate-6">
        <div className={cn("absolute inset-0 rounded-full border-[10px] bg-paper/70", tone.rim)} />
        <div className="absolute inset-[24%] rounded-full border-2 border-charcoal/10" />
        <div className={cn("absolute top-[14%] right-[20%] size-3 rounded-full", tone.dot)} />
      </div>
      <span className="absolute bottom-3 left-3 rounded-full bg-paper/85 px-2 py-0.5 text-[0.65rem] font-bold tracking-[0.1em] text-ink-soft uppercase">
        Photo à venir
      </span>
    </div>
  );
}

export function MealCard({ meal, compact = false }: { meal: Meal; compact?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-paper ring-1 ring-line transition-[box-shadow,transform] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <div className={cn("relative overflow-hidden", compact ? "aspect-[5/3]" : "aspect-[4/3]")}>
        {meal.image ? (
          <Image
            src={meal.image}
            alt={meal.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <PlatePlaceholder category={meal.category} />
        )}
        {meal.rotationType && (
          <div className="absolute top-3 left-3">
            <Badge tone={meal.rotationType === "mensuelle" ? "dark" : "saffron"}>{rotationLabels[meal.rotationType]}</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="eyebrow text-[0.7rem] text-coral-ink">{categoryLabels[meal.category]}</p>
        <h3 className="font-display text-[1.15rem] leading-tight font-bold tracking-tight">{meal.name}</h3>
        {meal.description && <p className="text-sm text-ink-soft">{meal.description}</p>}

        <p className="mt-auto border-t border-line pt-3 text-[0.8rem] text-ink-soft">
          {meal.allergens.length > 0 ? (
            <>
              <span className="font-semibold text-charcoal">Allergènes déclarés :</span>{" "}
              {meal.allergens.map((a) => allergenLabels[a]).join(", ")}
            </>
          ) : (
            <>
              <span className="font-semibold text-charcoal">Allergènes :</span> à confirmer avec notre équipe
            </>
          )}
        </p>
      </div>
    </article>
  );
}
