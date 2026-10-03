import { Camera } from "lucide-react";
import { media, type MediaKey, type PhotoTone } from "@/data/media";
import { getDictionary, type Locale } from "@/i18n";
import { SmartImage } from "./SmartImage";
import { cn } from "@/lib/cn";

/**
 * Emplacement photo piloté par le registre `src/data/media.ts`.
 * - `src` renseigné : photo (locale ou illustration temporaire), avec repli.
 * - sinon : placeholder de marque clairement identifié « Photo à venir ».
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
  locale,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  showBrief = true,
}: {
  slot: MediaKey;
  locale: Locale;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showBrief?: boolean;
}) {
  const photo: { alt: Record<Locale, string>; brief: string; src: string | null; tone: PhotoTone; focus?: string } = media[slot];
  const t = getDictionary(locale).common;
  const tone = toneStyles[photo.tone];

  const placeholder = (
    <div
      role="img"
      aria-label={`${t.photoComingAria} ${photo.alt[locale]}`}
      className={cn("absolute inset-0 isolate overflow-hidden", tone.bg, tone.text)}
    >
      <div aria-hidden="true" className="absolute -right-[18%] -bottom-[28%] aspect-square w-[85%]">
        <div className={cn("absolute inset-0 rounded-full border-[1.5rem] transition-transform duration-700 group-hover:scale-105", tone.ring)} />
        <div className={cn("absolute inset-[22%] rounded-full border-2", tone.ring)} />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 sm:p-5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-charcoal/85 px-2.5 py-1 text-[0.7rem] font-bold tracking-[0.12em] text-cream uppercase">
          <Camera aria-hidden="true" className="size-3" strokeWidth={2.5} />
          {t.photoComing}
        </span>
        {showBrief && locale === "fr" && <span className="max-w-[28ch] text-xs leading-snug font-medium opacity-80">{photo.brief}</span>}
      </div>
    </div>
  );

  return (
    <div className={cn("relative overflow-hidden", tone.bg, className)}>
      {photo.src ? (
        <SmartImage src={photo.src} alt={photo.alt[locale]} sizes={sizes} priority={priority} fallback={placeholder} focus={photo.focus} />
      ) : (
        placeholder
      )}
    </div>
  );
}
