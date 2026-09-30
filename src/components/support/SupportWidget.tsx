"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Phone, Mail, FileText } from "lucide-react";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

/**
 * Point d'entrée « Support » — V1 visuelle.
 *
 * Évolution prévue : assistant Bon Traiteur connecté au compte client
 * (Supabase + function calling / server actions) capable de préparer des
 * actions (« Change mon poulet de mercredi ») et de demander confirmation
 * avant toute action importante. L'interface de ce panneau est pensée pour
 * accueillir la conversation sans refonte.
 */
export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <div
        ref={panelRef}
        id="support-panel"
        role="dialog"
        aria-modal="false"
        aria-label="Nous joindre"
        hidden={!open}
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[var(--radius-xl)] bg-paper shadow-[var(--shadow-lift)] ring-1 ring-line"
      >
        <div className="bg-olive px-5 py-5 text-cream">
          <p className="font-display text-xl font-bold">Bonjour! Comment peut-on aider?</p>
          <p className="mt-1 text-sm text-cream/80">Une vraie personne vous répond. {site.contact.hours}.</p>
        </div>
        <ul className="grid gap-1 p-2">
          {[
            { href: site.contact.phoneHref, icon: Phone, label: "Appeler l'équipe", sub: site.contact.phone },
            { href: `mailto:${site.contact.email}`, icon: Mail, label: "Écrire un courriel", sub: site.contact.email },
            { href: "/soumission", icon: FileText, label: "Demander une soumission", sub: "Réponse personnalisée" },
          ].map(({ href, icon: Icon, label, sub }) => (
            <li key={label}>
              <Link href={href} className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 transition-colors hover:bg-cream">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream-deep">
                  <Icon aria-hidden="true" className="size-[1.1rem]" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{label}</span>
                  <span className="block truncate text-sm text-ink-soft">{sub}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="border-t border-line px-5 py-3 text-xs text-ink-soft">
          Bientôt : gérez votre menu et vos livraisons directement ici, avec l'assistant Bon Traiteur.
        </p>
      </div>

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="support-panel"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex size-14 items-center justify-center gap-2 rounded-full font-semibold sm:w-auto sm:pr-5 sm:pl-4 shadow-[var(--shadow-lift)] transition-colors",
          open ? "bg-charcoal text-cream" : "bg-saffron text-charcoal hover:bg-coral",
        )}
      >
        {open ? <X aria-hidden="true" className="size-5" /> : <MessageCircle aria-hidden="true" className="size-5" />}
        <span className="sr-only text-sm sm:not-sr-only">{open ? "Fermer" : "Besoin d'aide?"}</span>
      </button>
    </div>
  );
}
