"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/forms/fields";
import { createSupportRequest, type SupportState } from "@/lib/actions/portal";
import type { Dictionary } from "@/i18n/dictionaries/fr";

export function SupportForm({ locale, establishmentId, t, errorText }: { locale: string; establishmentId: string; t: Dictionary["portal"]["support"]; errorText: string }) {
  const [state, action, pending] = useActionState<SupportState, FormData>(createSupportRequest, { status: "idle" });
  return (
    <form action={action} className="grid gap-5" key={state.status === "sent" ? "sent" : "form"}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="establishmentId" value={establishmentId} />
      {state.status === "sent" && <p role="status" className="rounded-[var(--radius-md)] bg-olive-soft p-4 text-sm text-olive-deep">{t.sent}</p>}
      {state.status === "error" && <p role="alert" className="rounded-[var(--radius-md)] bg-coral-soft p-4 text-sm text-coral-ink">{errorText}</p>}
      <Field label={t.subject} required>
        <Input name="subject" required maxLength={160} />
      </Field>
      <Field label={t.message} required>
        <Textarea name="message" required maxLength={4000} />
      </Field>
      <Button type="submit" disabled={pending} className="justify-self-start">
        {t.send}
      </Button>
    </form>
  );
}
