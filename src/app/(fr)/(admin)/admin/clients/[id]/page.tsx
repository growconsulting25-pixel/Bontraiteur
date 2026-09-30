import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, PageTitle } from "@/components/portal/ui/PortalUI";
import { AutoSubmitSelect, Flash, Label, SubmitButton, inputClass } from "@/components/admin/AdminUI";
import { ConfirmSubmit } from "@/components/portal/ui/ConfirmSubmit";
import { createSessionClient } from "@/lib/supabase/session";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { createEstablishment, deleteDocument, inviteMember, removeMember, updateMemberRole, uploadDocument } from "@/lib/actions/admin";
import type { EstablishmentRow, MembershipRow } from "@/lib/supabase/types";

export const metadata = { title: "Client" };

const roles = [
  ["owner", "Propriétaire"],
  ["director", "Direction"],
  ["admin", "Administration"],
  ["accounting", "Comptabilité"],
  ["viewer", "Lecture seule"],
] as const;

const kinds = [
  ["cpe", "CPE"],
  ["garderie_subventionnee", "Garderie subventionnée"],
  ["garderie_privee", "Garderie privée"],
  ["service_de_garde", "Service de garde"],
  ["autre", "Autre"],
] as const;

export default async function ClientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const [{ id }, { msg }] = await Promise.all([params, searchParams]);
  const supabase = await createSessionClient();
  const [{ data: org }, { data: establishments }, { data: members }, { data: files }] = await Promise.all([
    supabase.from("organizations").select("id, name, preferred_locale").eq("id", id).maybeSingle(),
    supabase.from("establishments").select("*").eq("organization_id", id).order("name"),
    supabase.from("memberships").select("user_id, organization_id, role, establishment_ids").eq("organization_id", id),
    supabase.storage.from("documents").list(id),
  ]);
  if (!org) notFound();

  // Courriels des membres (nécessite la clé service role)
  const admin = getAdminSupabase();
  const emails = new Map<string, string>();
  if (admin) {
    await Promise.all(
      ((members ?? []) as MembershipRow[]).map(async (m) => {
        const { data } = await admin.auth.admin.getUserById(m.user_id);
        if (data.user?.email) emails.set(m.user_id, data.user.email);
      }),
    );
  }

  return (
    <>
      <Link href="/admin/clients" className="text-sm font-semibold text-ink-soft hover:text-charcoal">
        ← Clients
      </Link>
      <PageTitle title={org.name} lead={`Langue préférée : ${org.preferred_locale === "en" ? "anglais" : "français"}`} />
      <Flash msg={msg} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-bold">Établissements</h2>
          <ul className="mt-4 grid gap-3">
            {((establishments ?? []) as EstablishmentRow[]).map((e) => (
              <li key={e.id} className="rounded-[var(--radius-md)] bg-cream/60 p-3 text-sm">
                <p className="font-semibold">{e.name}</p>
                <p className="text-ink-soft">
                  {kinds.find(([k]) => k === e.kind)?.[1]} · {e.city ?? "—"} · {e.children_count ?? "?"} enfants
                </p>
                {e.address && <p className="text-ink-soft">{e.address}</p>}
                {e.delivery_notes && <p className="mt-1 whitespace-pre-line">{e.delivery_notes}</p>}
                <Link href={`/admin/menus?etablissement=${e.id}`} className="mt-2 inline-block font-semibold underline underline-offset-4">
                  Menus
                </Link>
              </li>
            ))}
          </ul>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold">+ Ajouter un établissement</summary>
            <form action={createEstablishment} className="mt-3 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="organizationId" value={org.id} />
              <Label text="Nom"><input name="name" required className={inputClass} /></Label>
              <Label text="Type">
                <select name="kind" className={inputClass}>{kinds.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </Label>
              <Label text="Ville"><input name="city" className={inputClass} /></Label>
              <Label text="Nombre d'enfants"><input name="childrenCount" inputMode="numeric" className={inputClass} /></Label>
              <Label text="Adresse" className="sm:col-span-2"><input name="address" className={inputClass} /></Label>
              <Label text="Notes de livraison" className="sm:col-span-2"><textarea name="deliveryNotes" className={`${inputClass} h-20 py-2`} /></Label>
              <SubmitButton>Ajouter</SubmitButton>
            </form>
          </details>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-bold">Accès au portail</h2>
          {!admin && (
            <p className="mt-2 rounded-[var(--radius-md)] bg-saffron-soft p-3 text-sm">
              Pour inviter des utilisateurs et voir leurs courriels, ajoutez la variable <code>SUPABASE_SERVICE_ROLE_KEY</code>.
            </p>
          )}
          <ul className="mt-4 grid gap-2">
            {((members ?? []) as MembershipRow[]).map((m) => (
              <li key={m.user_id} className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] bg-cream/60 p-3 text-sm">
                <span className="font-semibold">{emails.get(m.user_id) ?? m.user_id.slice(0, 8)}</span>
                <span className="flex items-center gap-2">
                  <form action={updateMemberRole}>
                    <input type="hidden" name="userId" value={m.user_id} />
                    <input type="hidden" name="organizationId" value={org.id} />
                    <AutoSubmitSelect name="role" defaultValue={m.role} aria-label="Rôle">
                      {roles.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </AutoSubmitSelect>
                  </form>
                  <form action={removeMember}>
                    <input type="hidden" name="userId" value={m.user_id} />
                    <input type="hidden" name="organizationId" value={org.id} />
                    <ConfirmSubmit label="Retirer" confirm="Retirer l'accès de cet utilisateur?" />
                  </form>
                </span>
              </li>
            ))}
          </ul>
          <form action={inviteMember} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <input type="hidden" name="organizationId" value={org.id} />
            <Label text="Inviter par courriel"><input name="email" type="email" required className={inputClass} /></Label>
            <Label text="Rôle">
              <select name="role" defaultValue="director" className={inputClass}>{roles.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </Label>
            <SubmitButton tone="olive">Inviter</SubmitButton>
          </form>
          <p className="mt-3 text-xs text-ink-soft">
            Direction et administration peuvent confirmer les menus et commander. La comptabilité voit les factures. Lecture seule : consultation.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Documents partagés</h2>
          <ul className="mt-4 grid gap-2">
            {(files ?? []).filter((f) => f.id).map((f) => (
              <li key={f.name} className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-cream/60 p-3 text-sm">
                <span className="truncate font-semibold">{f.name}</span>
                <form action={deleteDocument}>
                  <input type="hidden" name="organizationId" value={org.id} />
                  <input type="hidden" name="name" value={f.name} />
                  <ConfirmSubmit label="Supprimer" confirm="Supprimer ce document?" />
                </form>
              </li>
            ))}
          </ul>
          <form action={uploadDocument} className="mt-4 flex flex-wrap items-end gap-3">
            <input type="hidden" name="organizationId" value={org.id} />
            <Label text="Ajouter un document (10 Mo max)">
              <input type="file" name="file" required className="text-sm" />
            </Label>
            <SubmitButton>Partager</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
