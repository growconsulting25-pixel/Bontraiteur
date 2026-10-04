import Link from "next/link";
import { Mail } from "lucide-react";
import { getDictionary, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";
import { getConversations, getNotifications, getProfile } from "@/lib/portal/inbox";
import { notificationView } from "@/lib/portal/notification-text";
import type { Account } from "@/lib/auth";
import type { EstablishmentRow } from "@/lib/supabase/types";
import { NotificationBell } from "./NotificationBell";
import { ProfileMenu } from "./ProfileMenu";

/** Barre du haut du portail : établissement, cloche, messages, profil. */
export async function PortalTopBar({ locale, account, establishment }: { locale: Locale; account: Account; establishment: EstablishmentRow | null }) {
  const d = getDictionary(locale);
  const t = d.portal.topbar;
  const organizationId = establishment?.organization_id;
  const [{ profile, avatarUrl }, notifications, conversations] = await Promise.all([
    getProfile(account.user.id),
    getNotifications(account.user.id),
    organizationId ? getConversations(organizationId) : Promise.resolve([]),
  ]);
  const unreadMessages = conversations.filter((c) => c.client_unread).length;
  const name = profile?.full_name || account.user.email || "";
  const role = account.memberships.find((m) => m.organization_id === organizationId)?.role;

  return (
    <div className="sticky top-16 z-20 flex items-center justify-between gap-3 border-b border-line bg-cream/95 px-4 py-2 backdrop-blur-md sm:px-8 lg:top-0">
      <p className="min-w-0 truncate text-sm">
        {establishment && (
          <>
            <span className="hidden text-ink-soft sm:inline">{d.portal.establishment} : </span>
            <span className="font-semibold">{establishment.name}</span>
          </>
        )}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={portalHref("support", locale)}
          aria-label={`${t.inbox}${unreadMessages ? ` (${unreadMessages})` : ""}`}
          title={t.inbox}
          className="relative grid size-10 place-items-center rounded-full transition-colors hover:bg-cream-deep"
        >
          <Mail aria-hidden="true" className="size-5" />
          {unreadMessages > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-coral px-1 text-[0.65rem] leading-5 font-bold text-charcoal ring-2 ring-cream">
              {unreadMessages}
            </span>
          )}
        </Link>
        <NotificationBell
          locale={locale}
          unread={notifications.unread}
          t={t}
          items={notifications.items.map((n) => ({ id: n.id, kind: n.kind, createdAt: n.created_at, read: Boolean(n.read_at), ...notificationView(n, d, locale) }))}
        />
        <ProfileMenu
          name={name}
          email={account.user.email ?? ""}
          avatarUrl={avatarUrl}
          roleLabel={role ? d.portal.roles[role] : account.isStaff ? t.staff : ""}
          locale={locale}
          settingsHref={portalHref("account", locale)}
          languageLabel={d.nav.switchLanguage}
          staff={account.isStaff}
          t={t}
          signOutLabel={d.auth.signOut}
        />
      </div>
    </div>
  );
}
