import type { AssistantAction, ProposedAction } from "@/lib/assistant/types";

/** Données passées par le serveur au widget (aucune IA : tout est prévu d'avance). */
export interface SiteGuideData {
  faq: Array<{ group: string; question: string; answer: string }>;
  groups: Record<string, string>;
  meals: Array<{ name: string; category: string; allergens: string[]; occasional: boolean }>;
  occasionalLabel: string;
  links: { menu: string; quote: string; how: string; contact: string; login: string };
}

export interface PortalGuideData {
  links: { menu: string; deliveries: string; invoices: string; newOrder: string; support: string };
  slots: Record<"collation_am" | "repas" | "dessert" | "collation_pm", string>;
  menuStatus: Record<string, string>;
  orderKind: Record<string, string>;
  orderStatus: Record<string, string>;
  deliveryStatus: Record<string, string>;
  invoiceStatus: Record<string, string>;
}

export type Slot = keyof PortalGuideData["slots"];

/** Étapes du parcours (sérialisables : la conversation est conservée pendant la visite). */
export type Step =
  | { s: "start" }
  | { s: "topic"; g: string }
  | { s: "faq"; i: number }
  | { s: "client" }
  | { s: "human" }
  | { s: "p:next" }
  | { s: "p:menu" }
  | { s: "p:confirmMenu"; menuId: string; month: string }
  | { s: "p:change" }
  | { s: "p:week"; w: string }
  | { s: "p:day"; dayId: string }
  | { s: "p:slot"; dayId: string; slot: Slot }
  | { s: "p:meal"; dayId: string; slot: Slot; mealId: string | null; label: string }
  | { s: "p:pause" }
  | { s: "p:pauseOne"; id: string; date: string }
  | { s: "p:cancel" }
  | { s: "p:cancelOne"; id: string; date: string }
  | { s: "p:order" }
  | { s: "p:invoices" }
  | { s: "p:human" }
  | { s: "p:humanSubject"; subject: string }
  | { s: "p:faq" };

export interface Chip {
  label: string;
  step: Step;
}

export type ActionState = "pending" | "running" | "done" | "failed" | "cancelled";

export type Entry =
  | { kind: "user"; text: string }
  | { kind: "bot"; text: string; chips?: Chip[]; links?: Array<{ label: string; href: string }>; contacts?: boolean }
  | { kind: "action"; proposal: ProposedAction; state: ActionState };

export type { AssistantAction, ProposedAction };
