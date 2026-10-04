import "server-only";
import { getAccount, resolveEstablishment, type Account } from "@/lib/auth";
import type { EstablishmentRow, MemberRole, OrganizationRow } from "@/lib/supabase/types";

export interface AssistantClient {
  account: Account;
  establishment: EstablishmentRow;
  organization: OrganizationRow;
  role: MemberRole;
  canAct: boolean;
  canSeeInvoices: boolean;
}

/** Client connecté + établissement demandé (s'il y a accès), sinon l'établissement actif. */
export async function assistantClient(establishmentId?: unknown): Promise<AssistantClient | null> {
  const account = await getAccount();
  if (!account || account.establishments.length === 0) return null;
  const establishment =
    (typeof establishmentId === "string" && account.establishments.find((e) => e.id === establishmentId)) || (await resolveEstablishment(account));
  if (!establishment) return null;
  const organization = account.organizations.find((o) => o.id === establishment.organization_id);
  if (!organization) return null;
  const role = account.memberships.find((m) => m.organization_id === establishment.organization_id)?.role ?? "viewer";
  return {
    account,
    establishment,
    organization,
    role,
    canAct: ["owner", "director", "admin"].includes(role),
    canSeeInvoices: ["owner", "director", "accounting"].includes(role),
  };
}
