/**
 * Types des lignes Supabase utilisées par le portail et le back-office.
 * (Correspondent à supabase/migrations. À régénérer automatiquement plus tard
 * avec `supabase gen types typescript`.)
 */

export type MemberRole = "owner" | "director" | "admin" | "accounting" | "viewer";
export type EstablishmentKind = "cpe" | "garderie_subventionnee" | "garderie_privee" | "service_de_garde" | "autre";
export type MonthlyMenuStatus = "brouillon" | "publie" | "confirme" | "modifie";
export type OrderKind = "reguliere" | "ponctuelle" | "urgente";
export type OrderStatus = "brouillon" | "soumise" | "confirmee" | "annulee" | "livree";
export type DeliveryStatus = "planifiee" | "en_route" | "livree" | "suspendue" | "annulee";
export type InvoiceStatus = "brouillon" | "a_payer" | "payee" | "en_retard" | "annulee";
export type QuoteStatus = "nouvelle" | "en_cours" | "convertie" | "fermee" | "spam";
export type SupportStatus = "ouverte" | "resolue";
export type MealFormat = "chaud" | "pret_a_manger" | "congele";

export interface OrganizationRow {
  id: string;
  name: string;
  preferred_locale: "fr" | "en";
  created_at: string;
}

export interface EstablishmentRow {
  id: string;
  organization_id: string;
  name: string;
  kind: EstablishmentKind;
  address: string | null;
  city: string | null;
  children_count: number | null;
  delivery_notes: string | null;
  /** Allergènes présents dans les groupes (signalés dans le calendrier). */
  watched_allergens: Array<"lait" | "oeufs" | "poisson">;
}

export interface MembershipRow {
  user_id: string;
  organization_id: string;
  role: MemberRole;
  establishment_ids: string[];
}

export interface MonthlyMenuRow {
  id: string;
  establishment_id: string;
  month: string;
  status: MonthlyMenuStatus;
  change_deadline: string;
  published_at: string | null;
  confirmed_at: string | null;
}

export interface MenuDayRow {
  id: string;
  monthly_menu_id: string;
  date: string;
  meal_id: string;
  dessert_id: string | null;
  snack_am_id: string | null;
  snack_pm_id: string | null;
  original_meal_id: string | null;
  /** Plats proposés à l'origine, par case modifiée par le client. */
  original_slots: Partial<Record<MenuSlot, string | null>>;
}

/** Les 4 cases d'une journée de menu. */
export type MenuSlot = "collation_am" | "repas" | "dessert" | "collation_pm";

export interface OrderRow {
  id: string;
  establishment_id: string;
  kind: OrderKind;
  status: OrderStatus;
  delivery_date: string;
  notes: string | null;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  meal_id: string;
  format: MealFormat;
  portions: number;
}

export interface DeliveryRow {
  id: string;
  establishment_id: string;
  order_id: string | null;
  scheduled_for: string;
  time_window: string | null;
  status: DeliveryStatus;
}

export interface InvoiceRow {
  id: string;
  organization_id: string;
  establishment_id: string | null;
  number: string;
  period_start: string | null;
  period_end: string | null;
  amount_cents: number;
  currency: string;
  status: InvoiceStatus;
  due_date: string | null;
  paid_at: string | null;
  pdf_path: string | null;
  created_at: string;
}

export interface QuoteRequestRow {
  id: string;
  locale: "fr" | "en";
  establishment_name: string;
  establishment_type: string;
  contact_name: string;
  role: string | null;
  email: string;
  phone: string;
  city: string;
  children_count: number | null;
  frequency: string;
  formats: string[];
  start_month: string | null;
  restrictions: string | null;
  message: string | null;
  status: QuoteStatus;
  created_at: string;
}

export interface SupportRequestRow {
  id: string;
  organization_id: string;
  establishment_id: string | null;
  user_id: string;
  subject: string;
  message: string;
  status: SupportStatus;
  created_at: string;
  last_message_at?: string;
  client_unread?: boolean;
  staff_unread?: boolean;
}

export interface SupportMessageRow {
  id: string;
  request_id: string;
  author_id: string | null;
  from_staff: boolean;
  author_name: string | null;
  body: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  organization_id: string | null;
  kind: string;
  payload: Record<string, unknown>;
  link: string | null;
  created_at: string;
  read_at: string | null;
}

export interface ProfileRow {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_path: string | null;
  email_reminders: boolean;
  updated_at: string;
}
