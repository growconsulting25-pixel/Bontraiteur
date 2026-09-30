import { Check } from "lucide-react";
import type { MealFormat } from "@/data/offers";
import { Photo } from "@/components/ui/Photo";

/** Carte d'un format de repas (chaud, prêt-à-manger, congelé). */
export function FormatCard({ format, index }: { format: MealFormat; index: number }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] bg-paper ring-1 ring-line">
      <Photo slot={format.photo} className="aspect-[4/3]" sizes="(min-width: 1024px) 30vw, 100vw" showBrief={false} />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="font-display text-sm font-bold text-coral-ink">0{index + 1}</p>
        <h3 className="mt-2 font-display text-h3 font-bold">{format.title}</h3>
        <p className="mt-3 text-ink-soft">{format.summary}</p>
        <ul className="mt-6 grid gap-2 border-t border-line pt-5 text-sm">
          {format.details.map((d) => (
            <li key={d} className="flex items-start gap-2">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-olive" strokeWidth={2.5} />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
