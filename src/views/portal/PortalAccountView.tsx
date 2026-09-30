import { LogOut } from "lucide-react";
import { Card, PageTitle } from "@/components/portal/ui/PortalUI";
import { PasswordForm } from "@/components/portal/PasswordForm";
import { getAccount } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { getDictionary, href, type Locale } from "@/i18n";
import { redirect } from "next/navigation";

/** Mon compte : accessible même sans établissement (ex. première connexion après invitation). */
export async function PortalAccountView({ locale }: { locale: Locale }) {
  const account = await getAccount();
  if (!account) redirect(href("login", locale));
  const d = getDictionary(locale);
  const t = d.portal.account;

  return (
    <>
      <PageTitle title={t.title} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-ink-soft">{t.email}</dt>
              <dd className="font-semibold">{account.user.email}</dd>
            </div>
            {account.memberships.map((m) => (
              <div key={m.organization_id}>
                <dt className="text-ink-soft">{t.organizations}</dt>
                <dd className="font-semibold">
                  {account.organizations.find((o) => o.id === m.organization_id)?.name} · {d.portal.roles[m.role]}
                </dd>
              </div>
            ))}
          </dl>
          <form action={signOut} className="mt-6 border-t border-line pt-5">
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-charcoal">
              <LogOut aria-hidden="true" className="size-4" /> {d.auth.signOut}
            </button>
          </form>
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold">{t.setPassword}</h2>
          <PasswordForm t={t} />
        </Card>
      </div>
    </>
  );
}
