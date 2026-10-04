"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { saveProfile, type ProfileState } from "@/lib/actions/inbox";
import { Avatar } from "@/components/portal/topbar/Avatar";
import { Field, Input } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n/dictionaries/fr";

/** Profil : photo (aperçu immédiat), nom, téléphone, préférence de rappels. */
export function ProfileForm({
  t,
  email,
  fullName,
  phone,
  emailReminders,
  avatarUrl,
}: {
  t: Dictionary["portal"]["account"];
  email: string;
  fullName: string;
  phone: string;
  emailReminders: boolean;
  avatarUrl: string | null;
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, { status: "idle" });
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [removed, setRemoved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="grid gap-5">
      {state.status === "saved" && <p role="status" className="rounded-[var(--radius-md)] bg-olive-soft p-3 text-sm text-olive-deep">{t.profileSaved}</p>}
      {state.status === "error" && <p role="alert" className="rounded-[var(--radius-md)] bg-coral-soft p-3 text-sm text-coral-ink">{t.profileError}</p>}

      <div className="flex flex-wrap items-center gap-5">
        <Avatar url={preview} name={fullName || email} size="lg" />
        <div className="grid gap-2">
          <p className="text-sm font-semibold">{t.photo}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-charcoal px-4 text-sm font-semibold text-cream hover:bg-olive-deep"
            >
              <Camera aria-hidden="true" className="size-4" /> {t.changePhoto}
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setRemoved(true);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-line hover:ring-charcoal"
              >
                <Trash2 aria-hidden="true" className="size-4" /> {t.removePhoto}
              </button>
            )}
          </div>
          <p className="text-xs text-ink-soft">{t.photoHint}</p>
          <input
            ref={fileRef}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setPreview(URL.createObjectURL(f));
                setRemoved(false);
              }
            }}
          />
          <input type="hidden" name="removeAvatar" value={removed ? "1" : ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.fullName}>
          <Input name="fullName" defaultValue={fullName} maxLength={120} autoComplete="name" />
        </Field>
        <Field label={t.phone}>
          <Input name="phone" type="tel" defaultValue={phone} maxLength={40} autoComplete="tel" />
        </Field>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">{t.preferences}</legend>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="emailReminders" defaultChecked={emailReminders} className="mt-0.5 size-4 accent-olive" />
          {t.emailReminders}
        </label>
      </fieldset>

      <Button type="submit" disabled={pending} className="justify-self-start">
        {t.saveProfile}
      </Button>
    </form>
  );
}
