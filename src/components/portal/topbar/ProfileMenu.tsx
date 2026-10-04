"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalHref, portalKeyFromPath } from "@/i18n/portal-routes";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, LogOut, Settings, Shield } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";
import { Avatar } from "./Avatar";

/** Menu du profil : photo, nom, paramètres, langue, back-office (équipe), déconnexion. */
export function ProfileMenu({
  name,
  email,
  avatarUrl,
  roleLabel,
  locale,
  settingsHref,
  languageLabel,
  staff,
  t,
  signOutLabel,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  roleLabel: string;
  locale: string;
  settingsHref: string;
  languageLabel: string;
  staff: boolean;
  t: { profileMenu: string; settings: string; staff: string };
  signOutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const other = locale === "fr" ? "en" : "fr";
  const languageHref = portalHref(portalKeyFromPath(pathname) ?? "home", other);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const item = "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium hover:bg-cream";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t.profileMenu}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn("flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-cream-deep", open && "bg-cream-deep")}
      >
        <Avatar url={avatarUrl} name={name} size="sm" />
        <span className="hidden max-w-36 truncate text-sm font-semibold md:block">{name}</span>
        <ChevronDown aria-hidden="true" className="hidden size-4 text-ink-soft md:block" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-[var(--radius-lg)] bg-paper p-2 shadow-[var(--shadow-lift)] ring-1 ring-line">
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar url={avatarUrl} name={name} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{name}</p>
              <p className="truncate text-xs text-ink-soft">{email}</p>
              <p className="text-xs text-ink-soft">{roleLabel}</p>
            </div>
          </div>
          <div className="my-1 border-t border-line" />
          <Link href={settingsHref} onClick={() => setOpen(false)} className={item}>
            <Settings aria-hidden="true" className="size-4 text-ink-soft" /> {t.settings}
          </Link>
          <Link href={languageHref} onClick={() => setOpen(false)} className={item}>
            <Globe aria-hidden="true" className="size-4 text-ink-soft" /> {languageLabel}
          </Link>
          {staff && (
            <Link href="/admin" className={item}>
              <Shield aria-hidden="true" className="size-4 text-ink-soft" /> {t.staff}
            </Link>
          )}
          <div className="my-1 border-t border-line" />
          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={item}>
              <LogOut aria-hidden="true" className="size-4 text-ink-soft" /> {signOutLabel}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
