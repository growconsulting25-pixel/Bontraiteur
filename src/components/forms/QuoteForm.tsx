"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChoiceChip, Field, Input, Select, Textarea } from "./fields";
import { buildQuoteMailto, type QuoteRequest } from "@/lib/quote";
import { site } from "@/data/site";

const types = ["CPE", "Garderie subventionnée", "Garderie privée", "Service de garde", "Autre milieu de garde"];
const frequencies = ["Tous les jours", "Quelques jours par semaine", "Ponctuellement", "Besoin urgent"];
const formats = ["Repas chauds", "Prêts-à-manger", "Repas congelés", "Collations"];

export function QuoteForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const request: QuoteRequest = {
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
    };
    window.location.href = buildQuoteMailto(request);
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-[var(--radius-xl)] bg-paper p-8 ring-1 ring-line sm:p-10">
        <CheckCircle2 aria-hidden="true" className="size-10 text-olive" />
        <p className="mt-5 font-display text-h3 font-bold">Votre demande est prête à être envoyée.</p>
        <p className="mt-3 text-ink-soft">
          Votre logiciel de courriel s&apos;est ouvert avec votre demande : il ne reste qu&apos;à cliquer sur « Envoyer ». Rien ne
          s&apos;est ouvert? Écrivez-nous à{" "}
          <a className="font-semibold text-charcoal underline" href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>{" "}
          ou appelez au{" "}
          <a className="font-semibold text-charcoal underline" href={site.contact.phoneHref}>
            {site.contact.phone}
          </a>
          .
        </p>
        <button type="button" onClick={() => setSent(false)} className="mt-6 text-sm font-semibold underline underline-offset-4">
          Modifier ma demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="grid gap-10 rounded-[var(--radius-xl)] bg-paper p-6 ring-1 ring-line sm:p-10">
      <fieldset className="grid gap-5">
        <legend className="mb-5 font-display text-xl font-bold">1. Votre établissement</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom de l'établissement" required>
            <Input name="establishmentName" required autoComplete="organization" />
          </Field>
          <Field label="Type de milieu" required>
            <Select name="establishmentType" required defaultValue="">
              <option value="" disabled>
                Choisir…
              </option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Ville" required>
            <Input name="city" required autoComplete="address-level2" />
          </Field>
          <Field label="Nombre d'enfants (approx.)" required>
            <Input name="childrenCount" required inputMode="numeric" pattern="[0-9]*" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-5 font-display text-xl font-bold">2. Vos besoins</legend>
        <Field label="Fréquence souhaitée" required>
          <Select name="frequency" required defaultValue="">
            <option value="" disabled>
              Choisir…
            </option>
            {frequencies.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-3">
          <span className="text-sm font-semibold">
            Formats qui vous intéressent <span className="font-normal text-ink-soft">(facultatif)</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <ChoiceChip key={f} type="checkbox" name="formats" value={f} label={f} />
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Début souhaité">
            <Input name="startDate" type="month" />
          </Field>
          <Field label="Allergies ou restrictions à prévoir">
            <Input name="restrictions" placeholder="Ex. : 2 enfants allergiques aux œufs" />
          </Field>
        </div>
        <Field label="Autre chose à nous dire?">
          <Textarea name="message" placeholder="Horaire des repas, particularités, questions…" />
        </Field>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-5 font-display text-xl font-bold">3. Vos coordonnées</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Votre nom" required>
            <Input name="contactName" required autoComplete="name" />
          </Field>
          <Field label="Votre rôle">
            <Input name="role" placeholder="Ex. : directrice, adjointe administrative" autoComplete="organization-title" />
          </Field>
          <Field label="Courriel" required>
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label="Téléphone" required>
            <Input name="phone" type="tel" required autoComplete="tel" />
          </Field>
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">Aucun engagement. On vous revient avec une formule adaptée.</p>
        <Button type="submit" size="lg" arrow>
          Envoyer ma demande
        </Button>
      </div>
    </form>
  );
}
