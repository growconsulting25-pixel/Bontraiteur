"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/** Ouvre la fenêtre de l'assistant (comme le bouton « Clavarder » des plateformes de support). */
export const OPEN_ASSISTANT_EVENT = "bt-open-assistant";

export function OpenAssistantButton({ label, dark = false, className }: { label: string; dark?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_ASSISTANT_EVENT))}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-semibold transition-colors",
        dark ? "bg-charcoal text-cream hover:bg-olive-deep" : "bg-saffron text-charcoal hover:bg-coral",
        className,
      )}
    >
      <MessageCircle aria-hidden="true" className="size-5" /> {label}
    </button>
  );
}
