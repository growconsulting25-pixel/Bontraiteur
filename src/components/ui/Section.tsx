import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SectionTone = "cream" | "paper" | "olive" | "saffron" | "charcoal" | "cream-deep";

const tones: Record<SectionTone, string> = {
  cream: "bg-cream text-charcoal",
  "cream-deep": "bg-cream-deep text-charcoal",
  paper: "bg-paper text-charcoal",
  olive: "bg-olive text-cream",
  saffron: "bg-saffron text-charcoal",
  charcoal: "bg-charcoal text-cream",
};

export function Section({
  id,
  tone = "cream",
  className,
  children,
  labelledBy,
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("relative py-section", tones[tone], className)}>
      {children}
    </section>
  );
}
