"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, CalendarDays, ShoppingBag, Truck, Receipt, FolderOpen, LifeBuoy, UserRound, Menu, X } from "lucide-react";
import { portalHref, portalKeyFromPath, type PortalRouteKey } from "@/i18n/portal-routes";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

const items: Array<{ key: PortalRouteKey; icon: typeof Home }> = [
  { key: "home", icon: Home },
  { key: "menu", icon: CalendarDays },
  { key: "orders", icon: ShoppingBag },
  { key: "deliveries", icon: Truck },
  { key: "invoices", icon: Receipt },
  { key: "documents", icon: FolderOpen },
  { key: "support", icon: LifeBuoy },
  { key: "account", icon: UserRound },
];

export function PortalNav({
  locale,
  labels,
  openLabel,
  closeLabel,
  footer,
}: {
  locale: Locale;
  labels: Record<string, string>;
  openLabel: string;
  closeLabel: string;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeKey = portalKeyFromPath(pathname);
  const active = activeKey === "newOrder" ? "orders" : activeKey;

  useEffect(() => setOpen(false), [pathname]);

  const list = (
    <ul className="grid gap-1">
      {items.map(({ key, icon: Icon }) => (
        <li key={key}>
          <Link
            href={portalHref(key, locale)}
            aria-current={active === key ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.95rem] font-medium transition-colors",
              active === key ? "bg-olive text-cream" : "text-ink-soft hover:bg-cream-deep hover:text-charcoal",
            )}
          >
            <Icon aria-hidden="true" className="size-[1.1rem]" />
            {labels[key]}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Barre latérale (desktop) */}
      <nav aria-label="Portail" className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between">
        {list}
        <div className="pt-6">{footer}</div>
      </nav>

      {/* Mobile */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="portal-mobile-nav"
        aria-label={open ? closeLabel : openLabel}
        className="inline-flex size-11 items-center justify-center rounded-full hover:bg-cream-deep lg:hidden"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>
      <div id="portal-mobile-nav" hidden={!open} className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-cream px-4 py-4 lg:hidden">
        <nav aria-label="Portail">{list}</nav>
        <div className="mt-6 border-t border-line pt-6">{footer}</div>
      </div>
    </>
  );
}
