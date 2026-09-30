import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/shell/PortalShell";
import { getAccount, resolveEstablishment } from "@/lib/auth";
import { href, type Locale } from "@/i18n";

/** Mise en page commune du portail (FR et EN). */
export async function PortalLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const account = await getAccount();
  if (!account) redirect(href("login", locale));
  const establishment = await resolveEstablishment(account);
  return (
    <PortalShell locale={locale} account={account} establishment={establishment}>
      {children}
    </PortalShell>
  );
}
