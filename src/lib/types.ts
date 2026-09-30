/**
 * Modèle de domaine Bon Traiteur.
 *
 * Ces types sont la « source de vérité » partagée entre le site public,
 * le futur portail client et le futur back-office. Ils sont pensés pour
 * correspondre 1:1 aux tables Postgres/Supabase à venir (voir docs/ARCHITECTURE.md).
 */

/* ------------------------------------------------------------------ */
/* Repas & menu                                                        */
/* ------------------------------------------------------------------ */

export type MealCategory =
  | "volaille"
  | "boeuf"
  | "pates"
  | "poisson"
  | "vegetarien"
  | "autres"
  | "desserts"
  | "collations";

/** Repas principal, dessert ou collation. */
export type MealType = "repas" | "dessert" | "collation";

/**
 * - `mensuelle` : fait partie du cycle de 20 plats qui tourne chaque mois.
 * - `ponctuelle` : plat supplémentaire intégrable au menu mensuel sur demande
 *   (au moins 2 semaines à l'avance).
 */
export type RotationType = "mensuelle" | "ponctuelle";

export type MealStatus = "disponible" | "indisponible" | "saisonnier";

/**
 * Allergènes déclarés dans la fiche interne.
 * IMPORTANT : ces données ne sont PAS validées. Elles ne doivent jamais être
 * présentées comme une garantie (« sans allergènes »).
 */
export type Allergen = "lait" | "oeufs" | "poisson";

/** `null` = information pas encore confirmée par l'équipe. */
export type Availability = boolean | null;

export interface Meal {
  id: string;
  slug: string;
  name: string;
  /** Libellé exact de la feuille Google Sheets, conservé pour la migration. */
  sourceName: string;
  category: MealCategory;
  mealType: MealType;
  rotationType: RotationType | null;
  /** Description courte. Vide tant qu'aucune description validée n'existe. */
  description: string;
  allergens: Allergen[];
  /** Statut de validation des allergènes pour ce plat. */
  allergensVerified: boolean;
  status: MealStatus;
  /** Chemin vers la photo réelle du plat. `null` = placeholder visuel. */
  image: string | null;
  availableHot: Availability;
  availableFrozen: Availability;
  availableReadyToEat: Availability;
}

/* ------------------------------------------------------------------ */
/* Futur portail client — types préparés, non utilisés en V1            */
/* ------------------------------------------------------------------ */

export type UserRole = "owner" | "director" | "admin" | "accounting" | "viewer";

/** Ex. « Organisation ABC » qui regroupe plusieurs garderies. */
export interface Organization {
  id: string;
  name: string;
}

/** Une garderie / un CPE / une installation physique livrée. */
export interface Establishment {
  id: string;
  organizationId: string;
  name: string;
  kind: "cpe" | "garderie-subventionnee" | "garderie-privee" | "service-de-garde";
  address: string;
  childrenCount?: number;
}

export interface Membership {
  userId: string;
  organizationId: string;
  role: UserRole;
  /** Vide = accès à tous les établissements de l'organisation. */
  establishmentIds: string[];
}

export type MonthlyMenuStatus = "brouillon" | "publie" | "a-confirmer" | "confirme" | "modifie";

export interface MenuDay {
  date: string; // ISO yyyy-mm-dd
  mealId: string;
  dessertId?: string;
  snackIds?: string[];
}

export interface MonthlyMenu {
  id: string;
  establishmentId: string;
  month: string; // yyyy-mm
  status: MonthlyMenuStatus;
  /** Date limite de modification (normalement 2 semaines avant la période). */
  changeDeadline: string;
  days: MenuDay[];
}

export type DeliveryStatus = "planifiee" | "en-route" | "livree" | "suspendue";
export type InvoiceStatus = "a-payer" | "payee" | "en-retard";
