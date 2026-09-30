"use server";

import { getPublicSupabase } from "@/lib/supabase/server";
import { notifyTeam } from "@/lib/email";
import type { QuoteRequest } from "@/lib/quote";

export type QuoteResult = { ok: true } | { ok: false; reason: "not-configured" | "invalid" | "error" };

const clip = (value: string, max: number) => value.trim().slice(0, max);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Enregistre une demande de soumission dans la table `quote_requests`.
 * - Supabase absent → « not-configured » : le formulaire bascule sur le courriel.
 * - Les contraintes sont revérifiées ici ET dans la base (checks SQL + RLS).
 *
 * L'équipe est avertie par courriel (si RESEND_API_KEY et TEAM_NOTIFICATION_EMAIL
 * sont configurées) et retrouve la demande dans le back-office (/admin/soumissions).
 */
export async function submitQuoteRequest(request: QuoteRequest): Promise<QuoteResult> {
  if (request.website) return { ok: true }; // robot (champ piège rempli) : ignoré silencieusement

  const email = clip(request.email, 200);
  const phone = clip(request.phone, 40);
  const children = Number.parseInt(request.childrenCount, 10);
  if (!request.establishmentName.trim() || !request.contactName.trim() || !EMAIL.test(email) || phone.length < 7) {
    return { ok: false, reason: "invalid" };
  }

  const supabase = getPublicSupabase();
  if (!supabase) return { ok: false, reason: "not-configured" };

  // Pas de .select() : le public n'a pas le droit de relire les soumissions (RLS).
  const { error } = await supabase.from("quote_requests").insert({
    locale: request.locale === "en" ? "en" : "fr",
    establishment_name: clip(request.establishmentName, 160),
    establishment_type: clip(request.establishmentType, 80),
    contact_name: clip(request.contactName, 120),
    role: clip(request.role, 120) || null,
    email,
    phone,
    city: clip(request.city, 120),
    children_count: Number.isFinite(children) && children >= 0 && children <= 10000 ? children : null,
    frequency: clip(request.frequency, 80),
    formats: request.formats.slice(0, 10).map((f) => clip(f, 60)),
    start_month: clip(request.startDate, 20) || null,
    restrictions: clip(request.restrictions, 500) || null,
    message: clip(request.message, 3000) || null,
  });

  if (error) {
    console.error("[soumission] Échec de l'enregistrement :", error.message);
    return { ok: false, reason: "error" };
  }

  await notifyTeam(
    `Nouvelle soumission : ${request.establishmentName} (${request.city})`,
    [
      `${request.establishmentName} — ${request.establishmentType}`,
      `Contact : ${request.contactName}${request.role ? ` (${request.role})` : ""}`,
      `${email} · ${phone}`,
      `Ville : ${request.city} · Enfants : ${request.childrenCount}`,
      `Fréquence : ${request.frequency} · Formats : ${request.formats.join(", ") || "—"}`,
      request.restrictions ? `Restrictions : ${request.restrictions}` : "",
      request.message ? `\n${request.message}` : "",
      "",
      "Back-office : /admin/soumissions",
    ],
    email,
  );
  return { ok: true };
}
