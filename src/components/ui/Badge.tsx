import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "olive" | "saffron" | "coral" | "outline" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-cream-deep text-charcoal",
  olive: "bg-olive-soft text-olive-deep",
  saffron: "bg-saffron-soft text-charcoal",
  coral: "bg-coral-soft text-coral-ink",
  outline: "ring-1 ring-inset ring-line text-ink-soft",
  dark: "bg-charcoal text-cream",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none", tones[tone], className)}>
      {children}
    </span>
  );
}
