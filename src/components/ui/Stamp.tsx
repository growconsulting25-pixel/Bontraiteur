import { cn } from "@/lib/cn";

/** Pastille circulaire au texte tournant (touche éditoriale discrète). */
export function Stamp({ text, center, className }: { text: string; center: string; className?: string }) {
  return (
    <div className={cn("relative flex size-28 items-center justify-center rounded-full bg-olive text-cream sm:size-32", className)} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full motion-safe:animate-[spin_28s_linear_infinite]">
        <defs>
          <path id="stamp-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-current text-[9.2px] font-bold tracking-[0.18em] uppercase">
          <textPath href="#stamp-circle">{text}</textPath>
        </text>
      </svg>
      <span className="font-display text-2xl font-extrabold text-saffron sm:text-3xl">{center}</span>
    </div>
  );
}
