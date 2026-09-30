import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-[var(--radius-md)] bg-paper px-4 text-base ring-1 ring-line outline-none ring-inset transition-shadow placeholder:text-ink-soft/70 focus:ring-2 focus:ring-charcoal aria-[invalid=true]:ring-coral";

export function Field({ label, hint, required, children, className }: { label: string; hint?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-semibold">
        {label}
        {required ? <span className="text-coral-ink"> *</span> : <span className="font-normal text-ink-soft"> (facultatif)</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cn(control, "h-12", props.className)} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cn(control, "h-12 appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10", props.className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231d1d1b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(control, "min-h-32 py-3", props.className)} />;
}

export function ChoiceChip({ label, ...props }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="relative cursor-pointer">
      <input {...props} className="peer sr-only" />
      <span className="inline-flex h-11 items-center rounded-full bg-paper px-4 text-sm font-semibold ring-1 ring-line ring-inset transition-colors peer-checked:bg-charcoal peer-checked:text-cream peer-checked:ring-charcoal peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-coral hover:ring-charcoal">
        {label}
      </span>
    </label>
  );
}
