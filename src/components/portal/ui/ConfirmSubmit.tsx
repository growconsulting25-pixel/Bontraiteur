"use client";

import { useFormStatus } from "react-dom";

/** Bouton d'envoi avec demande de confirmation (annuler, suspendre…). */
export function ConfirmSubmit({ label, confirm, className }: { label: string; confirm: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
      className={className ?? "rounded-full px-3 py-1.5 text-xs font-bold text-coral-ink ring-1 ring-coral/40 transition-colors hover:bg-coral-soft disabled:opacity-50"}
    >
      {label}
    </button>
  );
}
