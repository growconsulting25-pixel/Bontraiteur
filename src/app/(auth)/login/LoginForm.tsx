"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/forms/fields";

/** Formulaire visuel. TODO : brancher `supabase.auth.signInWithPassword` / `signInWithOtp`. */
export function LoginForm() {
  return (
    <form className="mt-8 grid gap-5" onSubmit={(e) => e.preventDefault()} aria-describedby="login-status">
      <Field label="Courriel" required>
        <Input type="email" name="email" autoComplete="email" required disabled />
      </Field>
      <Field label="Mot de passe" required>
        <Input type="password" name="password" autoComplete="current-password" required disabled />
      </Field>
      <Button type="submit" size="lg" disabled>
        Se connecter
      </Button>
      <p id="login-status" className="text-center text-sm text-ink-soft">
        Connexion disponible à l&apos;ouverture du portail.
      </p>
    </form>
  );
}
