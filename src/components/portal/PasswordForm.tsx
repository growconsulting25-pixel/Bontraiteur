"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/forms/fields";
import { updatePassword, type PasswordState } from "@/lib/actions/auth";
import type { Dictionary } from "@/i18n/dictionaries/fr";

export function PasswordForm({ t }: { t: Dictionary["portal"]["account"] }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(updatePassword, { status: "idle" });
  return (
    <form action={action} className="grid gap-4">
      {state.status === "saved" && <p role="status" className="rounded-[var(--radius-md)] bg-olive-soft p-3 text-sm text-olive-deep">{t.saved}</p>}
      {state.status === "error" && <p role="alert" className="rounded-[var(--radius-md)] bg-coral-soft p-3 text-sm text-coral-ink">{t.error}</p>}
      <Field label={t.newPassword} hint={t.passwordHelp} required>
        <Input type="password" name="password" minLength={8} autoComplete="new-password" required />
      </Field>
      <Button type="submit" disabled={pending} className="justify-self-start">
        {t.save}
      </Button>
    </form>
  );
}
