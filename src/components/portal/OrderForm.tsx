"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/forms/fields";
import { createOrder } from "@/lib/actions/portal";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import type { MealFormat } from "@/lib/supabase/types";

type Line = { key: number; mealId: string; format: MealFormat; portions: string };

export function OrderForm({
  locale,
  establishmentId,
  minDate,
  meals,
  t,
  formats,
  successHref,
}: {
  locale: Locale;
  establishmentId: string;
  minDate: string;
  meals: Array<{ id: string; name: string; group: string }>;
  t: Dictionary["portal"]["orders"];
  formats: Record<MealFormat, string>;
  successHref: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const [kind, setKind] = useState<"ponctuelle" | "urgente">("ponctuelle");
  const [lines, setLines] = useState<Line[]>([{ key: 0, mealId: "", format: "chaud", portions: "" }]);

  const groups = meals.reduce<Record<string, typeof meals>>((acc, m) => ({ ...acc, [m.group]: [...(acc[m.group] ?? []), m] }), {});
  const update = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    startTransition(async () => {
      setError(false);
      const result = await createOrder({
        locale,
        establishmentId,
        kind,
        deliveryDate: String(data.get("deliveryDate")),
        notes: String(data.get("notes") ?? ""),
        lines: lines.map((l) => ({ mealId: l.mealId, format: l.format, portions: Number.parseInt(l.portions, 10) })),
      });
      if (result.ok) router.push(successHref);
      else setError(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fieldDate} required>
          <Input type="date" name="deliveryDate" min={minDate} required />
        </Field>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold">
            {t.fieldKind} <span className="text-coral-ink">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(["ponctuelle", "urgente"] as const).map((k) => (
              <label key={k} className={`flex h-12 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-sm font-semibold ring-1 transition-colors ${kind === k ? (k === "urgente" ? "bg-coral text-charcoal ring-coral" : "bg-charcoal text-cream ring-charcoal") : "ring-line hover:ring-charcoal"}`}>
                <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                {t.kind[k]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {kind === "urgente" && <p className="-mt-4 rounded-[var(--radius-md)] bg-coral-soft p-3 text-sm text-coral-ink">{t.urgentNote}</p>}

      <div className="grid gap-4">
        {lines.map((line, index) => (
          <div key={line.key} className="grid gap-3 rounded-[var(--radius-md)] bg-cream/60 p-4 sm:grid-cols-[1fr_10rem_7rem_auto] sm:items-end">
            <Field label={`${t.fieldMeal} ${index + 1}`} required>
              <Select value={line.mealId} onChange={(e) => update(line.key, { mealId: e.target.value })} required>
                <option value="" disabled>
                  —
                </option>
                {Object.entries(groups).map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>
            <Field label={t.fieldFormat} required>
              <Select value={line.format} onChange={(e) => update(line.key, { format: e.target.value as MealFormat })}>
                {(Object.keys(formats) as MealFormat[]).map((f) => (
                  <option key={f} value={f}>
                    {formats[f]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.fieldPortions} required>
              <Input type="number" min={1} max={2000} inputMode="numeric" value={line.portions} onChange={(e) => update(line.key, { portions: e.target.value })} required />
            </Field>
            {lines.length > 1 && (
              <button
                type="button"
                onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))}
                className="inline-flex h-12 items-center justify-center gap-1 rounded-full px-3 text-sm font-semibold text-ink-soft hover:text-coral-ink"
              >
                <Trash2 aria-hidden="true" className="size-4" /> <span className="sm:sr-only">{t.removeLine}</span>
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLines((ls) => [...ls, { key: Date.now(), mealId: "", format: "chaud", portions: "" }])}
          className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line hover:ring-charcoal"
        >
          <Plus aria-hidden="true" className="size-4" /> {t.addLine}
        </button>
      </div>

      <Field label={t.fieldNotes}>
        <Textarea name="notes" placeholder={t.notesPlaceholder} maxLength={2000} />
      </Field>

      {error && (
        <p role="alert" className="rounded-[var(--radius-md)] bg-coral-soft p-4 text-sm text-coral-ink">
          {t.invalid}
        </p>
      )}
      <Button type="submit" size="lg" arrow disabled={pending} className="justify-self-start">
        {t.submit}
      </Button>
    </form>
  );
}
