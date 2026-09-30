import { site } from "@/data/site";

/**
 * Demande de soumission.
 *
 * V1 : aucune intégration backend. La demande est formatée puis ouverte dans
 * le logiciel de courriel de l'utilisateur (mailto), pour ne jamais perdre
 * un prospect silencieusement.
 *
 * V2 (à brancher) : server action → table Supabase `quote_requests`
 * + courriel transactionnel (confirmation client + alerte équipe).
 * Le type `QuoteRequest` ne changera pas.
 */

export interface QuoteRequest {
  establishmentName: string;
  establishmentType: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  city: string;
  childrenCount: string;
  frequency: string;
  formats: string[];
  startDate: string;
  restrictions: string;
  message: string;
}

export function buildQuoteMailto(q: QuoteRequest): string {
  const lines = [
    `Établissement : ${q.establishmentName} (${q.establishmentType})`,
    `Personne-ressource : ${q.contactName}${q.role ? ` — ${q.role}` : ""}`,
    `Courriel : ${q.email}`,
    `Téléphone : ${q.phone}`,
    `Ville : ${q.city}`,
    `Nombre d'enfants : ${q.childrenCount}`,
    `Fréquence souhaitée : ${q.frequency}`,
    `Formats : ${q.formats.join(", ") || "À discuter"}`,
    `Début souhaité : ${q.startDate || "À discuter"}`,
    `Allergies / restrictions : ${q.restrictions || "—"}`,
    "",
    q.message,
  ];
  const subject = `Demande de soumission — ${q.establishmentName}`;
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}
