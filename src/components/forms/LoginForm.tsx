"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "./fields";
import { sendMagicLink, signInWithPassword, type AuthState } from "@/lib/actions/auth";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";

const initial: AuthState = { status: "idle" };

export function LoginForm({
  locale,
  t,
  a,
  next,
  linkError,
}: {
  locale: Locale;
  t: Dictionary["loginPage"];
  a: Dictionary["auth"];
  next?: string;
  linkError?: boolean;
}) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [pwState, pwAction, pwPending] = useActionState(signInWithPassword, initial);
  const [linkState, linkAction, linkPending] = useActionState(sendMagicLink, initial);
  const state = mode === "password" ? pwState : linkState;

  const hidden = (
    <>
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}
    </>
  );

  return (
    <div className="mt-8">
      <div role="tablist" aria-label={t.title} className="mb-6 grid grid-cols-2 rounded-full bg-cream-deep p-1 text-sm">
        {(
          [
            ["password", a.usePassword],
            ["link", a.useMagicLink],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`rounded-full px-3 py-2 font-semibold transition-colors ${mode === value ? "bg-paper shadow-[var(--shadow-soft)]" : "text-ink-soft hover:text-charcoal"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {linkError && state.status === "idle" && <Notice tone="error">{a.callbackError}</Notice>}
      {state.status === "error" && (
        <Notice tone="error">{state.message === "invalid" ? a.invalid : state.message === "notConfigured" ? a.notConfigured : a.genericError}</Notice>
      )}

      {mode === "password" ? (
        <form action={pwAction} className="grid gap-5">
          {hidden}
          <Field label={t.email} required>
            <Input type="email" name="email" autoComplete="email" required />
          </Field>
          <Field label={t.password} required>
            <Input type="password" name="password" autoComplete="current-password" required />
          </Field>
          <Button type="submit" size="lg" disabled={pwPending}>
            {t.submit}
          </Button>
          <button type="button" onClick={() => setMode("link")} className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-charcoal">
            {a.forgot}
          </button>
        </form>
      ) : linkState.status === "sent" ? (
        <Notice tone="success">{a.linkSent}</Notice>
      ) : (
        <form action={linkAction} className="grid gap-5">
          {hidden}
          <p className="text-sm text-ink-soft">{a.magicLinkHelp}</p>
          <Field label={t.email} required>
            <Input type="email" name="email" autoComplete="email" required />
          </Field>
          <Button type="submit" size="lg" disabled={linkPending}>
            {a.sendLink}
          </Button>
        </form>
      )}
      <p className="mt-6 text-xs text-ink-soft">{a.accountsNote}</p>
    </div>
  );
}

function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`mb-5 flex items-start gap-2 rounded-[var(--radius-md)] p-4 text-sm ${tone === "error" ? "bg-coral-soft text-coral-ink" : "bg-olive-soft text-olive-deep"}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
