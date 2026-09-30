import Link from "next/link";
import { PageTitle, EmptyState } from "@/components/portal/ui/PortalUI";
import { Flash, Label, SubmitButton, inputClass } from "@/components/admin/AdminUI";
import { createSessionClient } from "@/lib/supabase/session";
import { createOrganization } from "@/lib/actions/admin";

export const metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  const supabase = await createSessionClient();
  const [{ data: orgs }, { data: establishments }, { data: members }] = await Promise.all([
    supabase.from("organizations").select("id, name, preferred_locale").order("name"),
    supabase.from("establishments").select("id, organization_id, name, city"),
    supabase.from("memberships").select("organization_id"),
  ]);

  return (
    <>
      <PageTitle title="Clients" lead="Organisations, établissements et accès au portail." />
      <Flash msg={msg} />
      <form action={createOrganization} className="mb-8 flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line">
        <Label text="Nouvelle organisation" className="min-w-64 flex-1">
          <input name="name" required maxLength={160} placeholder="Ex. : CPE Les Petits Explorateurs" className={inputClass} />
        </Label>
        <Label text="Langue">
          <select name="locale" className={inputClass}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </Label>
        <SubmitButton>Créer</SubmitButton>
      </form>

      {!orgs?.length ? (
        <EmptyState>Aucun client. Créez une organisation ou convertissez une soumission.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {orgs.map((o) => {
            const ests = (establishments ?? []).filter((e) => e.organization_id === o.id);
            const users = (members ?? []).filter((m) => m.organization_id === o.id).length;
            return (
              <li key={o.id}>
                <Link href={`/admin/clients/${o.id}`} className="block rounded-[var(--radius-lg)] bg-paper p-5 ring-1 ring-line transition-shadow hover:shadow-[var(--shadow-soft)]">
                  <p className="font-display text-lg font-bold">{o.name}</p>
                  <p className="text-sm text-ink-soft">
                    {ests.length} établissement(s) · {users} utilisateur(s) · {o.preferred_locale.toUpperCase()}
                  </p>
                  {ests.length > 0 && <p className="mt-2 text-sm">{ests.map((e) => e.name).join(" · ")}</p>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
