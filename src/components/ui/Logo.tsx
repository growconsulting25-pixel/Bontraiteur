import { cn } from "@/lib/cn";

/**
 * WORDMARK TEMPORAIRE — Bon Traiteur.
 *
 * Le « O » de BON devient le symbole : une assiette vue de dessus dont le
 * rebord forme un soleil et le creux un sourire. Le symbole fonctionne seul
 * (favicon, app, contenants, camions) via <LogoMark />.
 * À remplacer par le logo final : seul ce fichier devra changer.
 */

type Tone = "dark" | "light";

export function LogoMark({ className, tone = "dark" }: { className?: string; tone?: Tone }) {
  const ink = tone === "dark" ? "var(--color-charcoal)" : "var(--color-cream)";
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("shrink-0", className)}>
      <circle cx="24" cy="24" r="23" fill="var(--color-saffron)" />
      <circle cx="24" cy="24" r="15.5" fill="none" stroke={ink} strokeWidth="2.6" />
      <path d="M16.5 25.5c1.8 4 4.4 6 7.5 6s5.7-2 7.5-6" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, tone = "dark" }: { className?: string; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.3em] font-display font-extrabold uppercase leading-none tracking-[-0.02em]",
        tone === "dark" ? "text-charcoal" : "text-cream",
        className,
      )}
    >
      <span className="inline-flex items-center" aria-hidden="true">
        B
        <LogoMark tone={tone} className="mx-[0.04em] h-[0.92em] w-[0.92em] translate-y-[-0.02em]" />
        N
      </span>
      <span aria-hidden="true">Traiteur</span>
      <span className="sr-only">Bon Traiteur</span>
    </span>
  );
}
