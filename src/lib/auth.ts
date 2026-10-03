import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/session";
import { isSupabaseConfigured } from "@/lib/env";
import type { EstablishmentRow, MemberRole, MembershipRow, OrganizationRow } from "@/lib/supabase/types";
import { href, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";

export const ESTABLISHMENT_COOKIE = "bt_establishment";

export interface Account {
  user: User;
  isStaff: boolean;
  memberships: MembershipRow[];
  organizations: OrganizationRow[];
  establishments: EstablishmentRow[];
}

/** Utilisateur connecté (ou null). Mis en cache pour la durée de la requête. */
export const getUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

/** Compte complet : rôles, organisations et établissements accessibles (via RLS). */
export const getAccount = cache(async (): Promise<Account | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createSessionClient();
  const [staff, memberships, organizations, establishments] = await Promise.all([
    supabase.from("staff_members").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("memberships").select("user_id, organization_id, role, establishment_ids").eq("user_id", user.id),
    supabase.from("organizations").select("id, name, preferred_locale, created_at").order("name"),
    supabase.from("establishments").select("id, organization_id, name, kind, address, city, children_count, delivery_notes, watched_allergens").order("name"),
  ]);
  return {
    user,
    isStaff: Boolean(staff.data),
    memberships: (memberships.data ?? []) as MembershipRow[],
    organizations: (organizations.data ?? []) as OrganizationRow[],
    establishments: (establishments.data ?? []) as EstablishmentRow[],
  };
});

export interface ClientContext extends Account {
  establishment: EstablishmentRow;
  organization: OrganizationRow;
  role: MemberRole;
  /** Peut agir (confirmer, commander, suspendre) : owner, director, admin. */
  canAct: boolean;
  /** Peut voir les factures : owner, director, accounting. */
  canSeeInvoices: boolean;
}

/**
 * Exige un client connecté ayant accès à au moins un établissement.
 * L'établissement actif est mémorisé dans un cookie (multi-sites).
 */
export async function requireClient(locale: Locale): Promise<ClientContext> {
  const account = await getAccount();
  if (!account) redirect(href("login", locale));
  if (account.establishments.length === 0) {
    // Membre de l'équipe sans organisation : direction le back-office.
    if (account.isStaff) redirect("/admin");
    redirect(portalHref("noAccess", locale));
  }
  const establishment = (await resolveEstablishment(account))!;
  const organization = account.organizations.find((o) => o.id === establishment.organization_id)!;
  const role = account.memberships.find((m) => m.organization_id === establishment.organization_id)?.role ?? "viewer";
  return {
    ...account,
    establishment,
    organization,
    role,
    canAct: ["owner", "director", "admin"].includes(role),
    canSeeInvoices: ["owner", "director", "accounting"].includes(role),
  };
}

/** Établissement actif (cookie), ou le premier accessible. */
export async function resolveEstablishment(account: Account): Promise<EstablishmentRow | null> {
  if (account.establishments.length === 0) return null;
  const cookieStore = await cookies();
  const selected = cookieStore.get(ESTABLISHMENT_COOKIE)?.value;
  return account.establishments.find((e) => e.id === selected) ?? account.establishments[0];
}

/** Exige un membre de l'équipe Bon Traiteur (back-office). */
export async function requireStaff(): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect("/login?next=/admin");
  if (!account.isStaff) redirect(href("home", "fr"));
  return account;
}
