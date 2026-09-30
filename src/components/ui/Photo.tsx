import Image from "next/image";
import { Camera } from "lucide-react";
import { media, type MediaKey, type PhotoTone } from "@/data/media";
import { cn } from "@/lib/cn";

/**
 * Emplacement photo piloté par le registre `src/data/media.ts`.
 *
 * - Vraie photo (`src` renseigné) : <Image> optimisée, lazy par défaut.
 * - Sinon : placeholder de marque, clairement identifié « Photo à venir »
 *   avec la consigne de prise de vue — impossible à confondre avec une
 *   vraie photo, mais assez soigné pour juger la mise en page.
 */

const toneStyles: Record<PhotoTone, { bg: string; ring: string; text: string }> = {
  olive: { bg: "bg-olive", ring: "border-cream/15", text: "text-cream" },
  saffron: { bg: "bg-saffron", ring: "border-charcoal/10", text: "text-charcoal" },
  coral: { bg: "bg-coral", ring: "border-charcoal/10", text: "text-charcoal" },
  cream: { bg: "bg-cream-deep", ring: "border-charcoal/10", text: "text-charcoal" },
  charcoal: { bg: "bg-charcoal", ring: "border-cream/10", text: "text-cream" },
};

export function Photo({
  slot,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  showBrief = true,
}: {
  slot: MediaKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showBrief?: boolean;
}) {
  const photo = media[slot];

  if (photo.src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  const tone = toneStyles[photo.tone];
  return (
    <div
      role="img"
      aria-label={`Photo à venir : ${photo.alt}`}
      className={cn("relative isolate overflow-hidden", tone.bg, tone.text, className)}
    >
      {/* Motif « assiette » de la marque */}
      <div aria-hidden="true" className="absolute -right-[18%] -bottom-[28%] aspect-square w-[85%]">
        <div className={cn("absolute inset-0 rounded-full border-[1.5rem] transition-transform duration-700 group-hover:scale-105", tone.ring)} />
        <div className={cn("absolute inset-[22%] rounded-full border-2", tone.ring)} />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 sm:p-5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-charcoal/85 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-cream">
          <Camera aria-hidden="true" className="size-3" strokeWidth={2.5} />
          Photo à venir
        </span>
        {showBrief && <span className="max-w-[28ch] text-xs font-medium leading-snug opacity-80">{photo.brief}</span>}
      </div>
    </div>
  );
}
