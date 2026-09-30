import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Éléments de formulaire compacts pour le back-office. */
export const inputClass =
  "h-10 w-full rounded-[var(--radius-sm)] bg-paper px-3 text-sm ring-1 ring-line outline-none ring-inset focus:ring-2 focus:ring-charcoal";

export function Flash({ msg }: { msg?: string }) {
  if (!msg) return null;
  const isError = /erreur|impossible|invalide|introuvable/i.test(msg);
  return (
    <p role={isError ? "alert" : "status"} className={cn("mb-6 rounded-[var(--radius-md)] p-4 text-sm", isError ? "bg-coral-soft text-coral-ink" : "bg-olive-soft text-olive-deep")}>
      {msg}
    </p>
  );
}

export function Label({ text, children, className }: { text: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1 text-sm", className)}>
      <span className="font-semibold">{text}</span>
      {children}
    </label>
  );
}

export function SubmitButton({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "olive" | "light" }) {
  const tones = { dark: "bg-charcoal text-cream hover:bg-olive-deep", olive: "bg-olive text-cream hover:bg-olive-deep", light: "bg-paper ring-1 ring-line hover:ring-charcoal" };
  return (
    <button type="submit" className={cn("inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors", tones[tone])}>
      {children}
    </button>
  );
}

/** Select qui envoie son formulaire dès qu'on change la valeur. */
export { AutoSubmitSelect } from "./AutoSubmitSelect";

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] bg-paper ring-1 ring-line">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs tracking-[0.06em] text-ink-soft uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-bold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}
