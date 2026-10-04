import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PortalNav } from "./PortalNav";
import { EstablishmentSwitcher } from "./EstablishmentSwitcher";
import { PortalLanguageLink } from "./PortalLanguageLink";
import { Assistant } from "@/components/assistant/Assistant";
import { signOut } from "@/lib/actions/auth";
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
      <div className="grid gap-1">
        <p className="truncate font-semibold" title={account.user.email}>
          {account.user.email}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-soft">
          <PortalLanguageLink locale={locale} label={d.nav.switchLanguage} />
          {account.isStaff && (
            <Link href="/admin" className="font-semibold hover:text-charcoal">
              Back-office
            </Link>
          )}
        </div>
      </div>
      <form action={signOut}>
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="inline-flex items-center gap-2 font-semibold text-ink-soft hover:text-charcoal">
          <LogOut aria-hidden="true" className="size-4" /> {d.auth.signOut}
        </button>
      </form>
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
        {establishment && (
          <div className="border-b border-line bg-paper/60 px-4 py-3 text-sm sm:px-8">
            <span className="text-ink-soft">{t.establishment} : </span>
            <span className="font-semibold">{establishment.name}</span>
            <Link href={href("home", locale)} className="float-right text-ink-soft hover:text-charcoal">
              {t.backToSite}
            </Link>
          </div>
        )}
        <main id="contenu" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
      {establishment && <Assistant mode="portal" locale={locale} establishmentId={establishment.id} />}
    </div>
  );
}
