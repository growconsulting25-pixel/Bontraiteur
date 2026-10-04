import type { Allergen } from "@/lib/types";

/** Couleur d'une case de menu selon les allergènes déclarés (comme sur le menu imprimé). */
export type AllergenTone = "milkEggs" | "milk" | "eggs" | "fish" | null;

export function allergenTone(allergens: Allergen[]): AllergenTone {
  const milk = allergens.includes("lait");
  const eggs = allergens.includes("oeufs");
  if (milk && eggs) return "milkEggs";
  if (milk) return "milk";
  if (eggs) return "eggs";
  if (allergens.includes("poisson")) return "fish";
  return null;
}

export const allergenToneClass: Record<Exclude<AllergenTone, null>, string> = {
  milkEggs: "bg-saffron/85 ring-saffron",
  milk: "bg-coral/80 ring-coral",
  eggs: "bg-saffron-soft ring-saffron",
  fish: "bg-olive-soft ring-olive/50",
};

/** Pastille par allergène (liste des plats). */
export const allergenChipClass: Record<Allergen, string> = {
  lait: "bg-coral/80 text-charcoal",
  oeufs: "bg-saffron-soft text-charcoal ring-1 ring-saffron",
  poisson: "bg-olive-soft text-charcoal",
};
