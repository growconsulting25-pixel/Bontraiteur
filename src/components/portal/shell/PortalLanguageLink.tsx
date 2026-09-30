"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalHref, portalKeyFromPath } from "@/i18n/portal-routes";
import type { Locale } from "@/i18n/config";

export function PortalLanguageLink({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const other: Locale = locale === "fr" ? "en" : "fr";
  const key = portalKeyFromPath(pathname) ?? "home";
  return (
    <Link href={portalHref(key, other)} hrefLang={other} lang={other} className="font-semibold hover:text-charcoal">
      {label}
    </Link>
  );
}
