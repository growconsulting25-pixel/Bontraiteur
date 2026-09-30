import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Carte texte simple : numéro/icône optionnel, titre, texte. */
export function FeatureCard({
  index,
  icon,
  title,
  children,
  tone = "paper",
  className,
}: {
  index?: string;
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  tone?: "paper" | "transparent" | "olive";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-3 rounded-[var(--radius-lg)] p-6 sm:p-7",
        tone === "paper" && "bg-paper ring-1 ring-line",
        tone === "transparent" && "border-t border-current/15 px-0 pt-6 sm:px-0",
        tone === "olive" && "bg-olive-deep/60 text-cream ring-1 ring-cream/10",
        className,
      )}
    >
      {index && <span className="font-display text-sm font-bold text-coral-ink">{index}</span>}
      {icon}
      <h3 className="font-display text-h3 font-bold">{title}</h3>
      <div className={cn("text-[0.98rem]", tone === "olive" ? "text-cream/80" : "text-ink-soft")}>{children}</div>
    </div>
  );
}
