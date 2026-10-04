/** Types partagés entre le serveur et le widget de l'assistant. */

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** Actions que l'assistant du portail peut PRÉPARER. Rien n'est exécuté sans le clic « Confirmer ». */
export type AssistantAction =
  | { type: "confirm_menu"; menuId: string }
  | { type: "set_menu_slot"; menuDayId: string; slot: "collation_am" | "repas" | "dessert" | "collation_pm"; mealId: string | null }
  | { type: "cancel_order"; orderId: string }
  | { type: "pause_delivery"; deliveryId: string }
  | {
      type: "create_order";
      kind: "ponctuelle" | "urgente";
      deliveryDate: string;
      notes: string;
      lines: Array<{ mealId: string; format: "chaud" | "pret_a_manger" | "congele"; portions: number }>;
    }
  | { type: "contact_team"; subject: string; message: string };

export interface ProposedAction {
  id: string;
  /** Résumé lisible, rédigé par l'assistant, affiché sur la carte de confirmation. */
  summary: string;
  action: AssistantAction;
}

export interface AssistantReply {
  text: string;
  actions: ProposedAction[];
  /** L'assistant n'est pas configuré (clé API absente) ou indisponible. */
  unavailable?: boolean;
}
