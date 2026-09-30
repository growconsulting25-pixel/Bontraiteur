"use server";

import type { QuoteRequest } from "@/lib/quote";

export type QuoteResult = { ok: true } | { ok: false; reason: "not-configured" | "invalid" | "error" };

/**
 * Enregistre une demande de soumission.
 * Branché sur Supabase à l'étape suivante ; tant que ce n'est pas configuré,
 * renvoie « not-configured » et le formulaire bascule sur le courriel.
 */
export async function submitQuoteRequest(request: QuoteRequest): Promise<QuoteResult> {
  if (request.website) return { ok: true }; // robot : on ignore silencieusement
  return { ok: false, reason: "not-configured" };
}
