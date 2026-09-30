import { site } from "@/data/site";
import type { Dictionary } from "@/i18n/dictionaries/fr";

/** Demande de soumission — même forme côté formulaire, e-mail et base de données. */
export interface QuoteRequest {
  locale: "fr" | "en";
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
  /** Champ piège anti-spam : doit rester vide. */
  website?: string;
}

/**
 * Solution de repli : ouvre la demande dans le logiciel de courriel du
 * visiteur, pour ne jamais perdre un prospect si l'envoi serveur échoue
 * ou si Supabase n'est pas encore configuré.
 */
export function buildQuoteMailto(q: QuoteRequest, m: Dictionary["quotePage"]["form"]["mail"]): string {
  const lines = [
    `${m.establishment} : ${q.establishmentName} (${q.establishmentType})`,
    `${m.contact} : ${q.contactName}${q.role ? ` — ${q.role}` : ""}`,
    `${q.email} · ${q.phone}`,
    `${m.city} : ${q.city}`,
    `${m.children} : ${q.childrenCount}`,
    `${m.frequency} : ${q.frequency}`,
    `${m.formats} : ${q.formats.join(", ") || m.toDiscuss}`,
    `${m.start} : ${q.startDate || m.toDiscuss}`,
    `${m.restrictions} : ${q.restrictions || "—"}`,
    "",
    q.message,
  ];
  const subject = m.subject.replace("{name}", q.establishmentName);
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}
