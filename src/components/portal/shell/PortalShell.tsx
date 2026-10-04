import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { PortalNav } from "./PortalNav";
import { EstablishmentSwitcher } from "./EstablishmentSwitcher";
import { Assistant } from "@/components/assistant/Assistant";
import { PortalTopBar } from "@/components/portal/topbar/PortalTopBar";
import { getDictionary, href, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";
import type { Account } from "@/lib/auth";
import type { EstablishmentRow } from "@/lib/supabase/types";

/** Habillage du portail client : volontairement simple, comme une application. */
export function PortalShell({
  locale,
  account,
  establishment,
  children,
}: {
  locale: Locale;
  account: Account;
  establishment: EstablishmentRow | null;
  children: React.ReactNode;
}) {
  const d = getDictionary(locale);
  const t = d.portal;

  const footer = (
    <div className="grid gap-4 text-sm">
      {establishment && account.establishments.length > 1 && (
        <EstablishmentSwitcher
          locale={locale}
          label={t.switchEstablishment}
          current={establishment.id}
          options={account.establishments.map((e) => ({ id: e.id, name: e.name }))}
        />
      )}
      <Link href={href("home", locale)} className="font-semibold text-ink-soft hover:text-charcoal">
        {t.backToSite}
      </Link>
    </div>
  );

  return (
    <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-cream/95 px-4 backdrop-blur-md lg:h-dvh lg:flex-col lg:items-stretch lg:justify-start lg:gap-8 lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
        <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
          <Link href={portalHref("home", locale)} aria-label={t.portalName}>
            <Logo className="text-[1.2rem]" />
          </Link>
          <span className="hidden text-[0.7rem] font-bold tracking-[0.12em] text-coral-ink uppercase sm:inline lg:block">{t.portalName}</span>
        </div>
        <PortalNav locale={locale} labels={t.nav} openLabel={t.openMenu} closeLabel={t.closeMenu} footer={footer} />
      </aside>

      <div className="min-w-0">
        <PortalTopBar locale={locale} account={account} establishment={establishment} />
        <main id="contenu" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
      {establishment && <Assistant mode="portal" locale={locale} establishmentId={establishment.id} />}
    </div>
  );
}
