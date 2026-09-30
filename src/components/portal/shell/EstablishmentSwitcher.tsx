"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { setEstablishment } from "@/lib/actions/portal";

/** Sélecteur d'établissement pour les organisations multi-sites. */
export function EstablishmentSwitcher({
  locale,
  label,
  current,
  options,
}: {
  locale: string;
  label: string;
  current: string;
  options: Array<{ id: string; name: string }>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();
  return (
    <form ref={formRef} action={setEstablishment}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="back" value={pathname} />
      <label className="grid gap-1">
        <span className="text-[0.7rem] font-bold tracking-[0.1em] text-ink-soft uppercase">{label}</span>
        <select
          name="establishmentId"
          defaultValue={current}
          onChange={() => formRef.current?.requestSubmit()}
          className="h-10 w-full rounded-[var(--radius-sm)] bg-paper px-3 text-sm font-semibold ring-1 ring-line outline-none focus:ring-2 focus:ring-charcoal"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      <noscript>
        <button type="submit" className="mt-2 text-sm underline">
          OK
        </button>
      </noscript>
    </form>
  );
}
