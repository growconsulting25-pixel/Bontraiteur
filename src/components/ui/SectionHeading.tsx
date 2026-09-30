import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { rich } from "@/i18n";

/**
 * Titre de section éditorial : sur-titre + gros titre display
 * (avec accent serif optionnel via <em>) + chapeau.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  align = "left",
  as: Tag = "h2",
  tone = "dark",
  className,
}: {
  id?: string;
  eyebrow?: string;
  /** Chaîne avec `*accent*` ou nœud React. */
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("eyebrow mb-5 flex items-center gap-3", align === "center" && "justify-center", tone === "dark" ? "text-coral-ink" : "text-saffron")}>
          <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
          {eyebrow}
        </p>
      )}
      <Tag
        id={id}
        className={cn(
          "font-bold [&_em]:accent-serif [&_em]:font-normal", tone === "dark" ? "[&_em]:text-olive" : "[&_em]:text-saffron",
          Tag === "h1" ? "text-hero" : "text-h2",
        )}
      >
        {typeof title === "string" ? rich(title) : title}
      </Tag>
      {lead && (
        <p className={cn("text-lead mt-6", tone === "dark" ? "text-ink-soft" : "text-cream/85", align === "center" && "mx-auto max-w-2xl")}>
          {lead}
        </p>
      )}
    </div>
  );
}
