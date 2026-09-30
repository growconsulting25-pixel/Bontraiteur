"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "./fields";
import type { Dictionary } from "@/i18n/dictionaries/fr";

/** Formulaire visuel. TODO : brancher `supabase.auth.signInWithPassword` / `signInWithOtp`. */
export function LoginForm({ t }: { t: Dictionary["loginPage"] }) {
  return (
    <form className="mt-8 grid gap-5" onSubmit={(e) => e.preventDefault()} aria-describedby="login-status">
      <Field label={t.email} required>
        <Input type="email" name="email" autoComplete="email" required disabled />
      </Field>
      <Field label={t.password} required>
        <Input type="password" name="password" autoComplete="current-password" required disabled />
      </Field>
      <Button type="submit" size="lg" disabled>
        {t.submit}
      </Button>
      <p id="login-status" className="text-center text-sm text-ink-soft">
        {t.status}
      </p>
    </form>
  );
}
