"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChoiceChip, Field, Input, Select, Textarea } from "./fields";
import { buildQuoteMailto, type QuoteRequest } from "@/lib/quote";
import { submitQuoteRequest } from "@/lib/actions/quote";
import { site, primaryPhone } from "@/data/site";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";

type Status = "idle" | "saved" | "mailto" | "error";

const fill = (template: string, vars: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");

export function QuoteForm({ locale, t, optional }: { locale: Locale; t: Dictionary["quotePage"]["form"]; optional: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [pending, startTransition] = useTransition();
  const frequencyRef = useRef<HTMLSelectElement>(null);

  // Arrivée depuis « Livraison régulière / Commande ponctuelle / Service urgent » : fréquence déjà choisie
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    const index = { reguliere: 0, ponctuelle: 2, urgente: 3 }[type ?? ""];
    if (index !== undefined && frequencyRef.current) frequencyRef.current.value = t.frequencies[index];
  }, [t.frequencies]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const request: QuoteRequest = {
      locale,
      establishmentName: get("establishmentName"),
      establishmentType: get("establishmentType"),
      contactName: get("contactName"),
      role: get("role"),
      email: get("email"),
      phone: get("phone"),
      city: get("city"),
      childrenCount: get("childrenCount"),
      frequency: get("frequency"),
      formats: data.getAll("formats").map(String),
      startDate: get("startDate"),
      restrictions: get("restrictions"),
      message: get("message"),
      // Champ piège anti-robots (invisible pour les humains)
      website: get("company_website"),
    };

    startTransition(async () => {
      const result = await submitQuoteRequest(request).catch(() => ({ ok: false as const, reason: "error" as const }));
      if (result.ok) {
        setStatus("saved");
      } else if (result.reason === "not-configured") {
        // Backend pas encore branché : on ne perd pas la demande.
        window.location.href = buildQuoteMailto(request, t.mail);
        setStatus("mailto");
      } else {
        setStatus("error");
      }
    });
  }

  if (status === "saved" || status === "mailto") {
    return (
      <div role="status" className="rounded-[var(--radius-xl)] bg-paper p-8 ring-1 ring-line sm:p-10">
        <CheckCircle2 aria-hidden="true" className="size-10 text-olive" />
        <p className="mt-5 font-display text-h3 font-bold">{status === "saved" ? t.successTitle : t.mailtoTitle}</p>
        <p className="mt-3 text-ink-soft">
          {status === "saved"
            ? fill(t.successText, { phone: primaryPhone.display })
            : fill(t.mailtoText, { email: site.contact.email, phone: primaryPhone.display })}
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-6 text-sm font-semibold underline underline-offset-4">
          {t.edit}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-10 rounded-[var(--radius-xl)] bg-paper p-6 ring-1 ring-line sm:p-10">
      <fieldset className="grid gap-5">
        <legend className="mb-5 font-display text-xl font-bold">{t.step1}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.establishmentName} required>
            <Input name="establishmentName" required autoComplete="organization" maxLength={160} />
          </Field>
          <Field label={t.establishmentType} required>
            <Select name="establishmentType" required defaultValue="">
              <option value="" disabled>
                {t.choose}
              </option>
              {t.types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
          </Field>
          <Field label={t.city} required>
            <Input name="city" required autoComplete="address-level2" maxLength={120} />
          </Field>
          <Field label={t.childrenCount} required>
            <Input name="childrenCount" required inputMode="numeric" pattern="[0-9]*" maxLength={5} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-5 font-display text-xl font-bold">{t.step2}</legend>
        <Field label={t.frequency} required>
          <Select ref={frequencyRef} name="frequency" required defaultValue="">
            <option value="" disabled>
              {t.choose}
            </option>
            {t.frequencies.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-3">
          <span className="text-sm font-semibold">
            {t.formatsLabel} <span className="font-normal text-ink-soft">{optional}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {t.formats.map((f) => (
              <ChoiceChip key={f} type="checkbox" name="formats" value={f} label={f} />
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.startDate} optionalLabel={optional}>
            <Input name="startDate" type="month" />
          </Field>
          <Field label={t.restrictions} optionalLabel={optional}>
            <Input name="restrictions" placeholder={t.restrictionsPlaceholder} maxLength={500} />
          </Field>
        </div>
        <Field label={t.message} optionalLabel={optional}>
          <Textarea name="message" placeholder={t.messagePlaceholder} maxLength={3000} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-5 font-display text-xl font-bold">{t.step3}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.contactName} required>
            <Input name="contactName" required autoComplete="name" maxLength={120} />
          </Field>
          <Field label={t.role} optionalLabel={optional}>
            <Input name="role" placeholder={t.rolePlaceholder} autoComplete="organization-title" maxLength={120} />
          </Field>
          <Field label={t.email} required>
            <Input name="email" type="email" required autoComplete="email" maxLength={200} />
          </Field>
          <Field label={t.phone} required>
            <Input name="phone" type="tel" required autoComplete="tel" maxLength={40} />
          </Field>
        </div>
        {/* Champ piège anti-spam : masqué aux humains et aux lecteurs d'écran */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label>
            Website
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </fieldset>

      {status === "error" && (
        <p role="alert" className="flex items-start gap-2 rounded-[var(--radius-md)] bg-coral-soft p-4 text-sm text-coral-ink">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {fill(t.errorText, { phone: primaryPhone.display })}
        </p>
      )}

      <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">{t.noCommitment}</p>
        <Button type="submit" size="lg" arrow disabled={pending}>
          {pending ? t.sending : t.submit}
        </Button>
      </div>
    </form>
  );
}
