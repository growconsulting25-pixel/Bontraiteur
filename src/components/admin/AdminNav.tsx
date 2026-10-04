"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, Building2, CalendarDays, ShoppingBag, Truck, Receipt, UtensilsCrossed, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/cn";

export const adminItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/soumissions", label: "Soumissions", icon: Inbox },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/menus", label: "Menus", icon: CalendarDays },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/livraisons", label: "Livraisons", icon: Truck },
  { href: "/admin/factures", label: "Factures", icon: Receipt },
  { href: "/admin/repas", label: "Repas", icon: UtensilsCrossed },
  { href: "/admin/support", label: "Messages", icon: LifeBuoy },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Back-office" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-1 lg:grid">
        {adminItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-charcoal text-cream" : "text-ink-soft hover:bg-cream-deep hover:text-charcoal",
                )}
              >
                <Icon aria-hidden="true" className="size-4" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
