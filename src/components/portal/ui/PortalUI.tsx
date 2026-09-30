import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Petits éléments visuels partagés par les pages du portail et du back-office. */

export function PageTitle({ title, lead, action }: { title: string; lead?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[clamp(1.9rem,1.5rem+1.4vw,2.6rem)] font-extrabold">{title}</h1>
        {lead && <p className="mt-2 max-w-2xl text-ink-soft">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line sm:p-6", className)}>{children}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-paper/60 p-8 text-center text-ink-soft">{children}</p>;
}

const statusTones: Record<string, string> = {
  good: "bg-olive-soft text-olive-deep",
  warn: "bg-saffron-soft text-charcoal",
  bad: "bg-coral-soft text-coral-ink",
  neutral: "bg-cream-deep text-ink-soft",
};

export function StatusPill({ tone = "neutral", children }: { tone?: keyof typeof statusTones; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", statusTones[tone])}>{children}</span>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "success" | "error"; children: ReactNode }) {
  const tones = { info: "bg-saffron-soft text-charcoal", success: "bg-olive-soft text-olive-deep", error: "bg-coral-soft text-coral-ink" };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("rounded-[var(--radius-md)] p-4 text-sm", tones[tone])}>
      {children}
    </p>
  );
}
