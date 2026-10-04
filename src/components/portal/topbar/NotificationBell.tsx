"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Bell, CalendarDays, MessageSquare, Receipt, ShoppingBag, Truck } from "lucide-react";
import { markNotificationsRead } from "@/lib/actions/inbox";
import { cn } from "@/lib/cn";

export interface BellItem {
  id: string;
  kind: string;
  text: string;
  href: string;
  createdAt: string;
  read: boolean;
}

const icons: Record<string, typeof Bell> = {
  menu_published: CalendarDays,
  menu_reminder: CalendarDays,
  order_status: ShoppingBag,
  delivery_status: Truck,
  invoice_new: Receipt,
  invoice_overdue: Receipt,
  message: MessageSquare,
};

/** Cloche : notifications récentes, pastille non lues, « tout marquer comme lu ». */
export function NotificationBell({
  items,
  unread,
  locale,
  t,
}: {
  items: BellItem[];
  unread: number;
  locale: string;
  t: { notifications: string; markAllRead: string; noNotifications: string; justNow: string };
}) {
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Ferme au clic extérieur / Échap ; rafraîchit les compteurs chaque minute
  useEffect(() => {
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    const timer = setInterval(() => document.visibilityState === "visible" && router.refresh(), 60_000);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      clearInterval(timer);
    };
  }, [router]);

  const ago = (iso: string) => {
    const s = (new Date(iso).getTime() - Date.now()) / 1000;
    if (s > -60) return t.justNow;
    const rtf = new Intl.RelativeTimeFormat(locale === "en" ? "en-CA" : "fr-CA", { numeric: "auto" });
    for (const [unit, sec] of [["day", 86400], ["hour", 3600], ["minute", 60]] as const) if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), unit);
    return t.justNow;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`${t.notifications}${unread ? ` (${unread})` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn("relative grid size-10 place-items-center rounded-full transition-colors hover:bg-cream-deep", open && "bg-cream-deep")}
      >
        <Bell aria-hidden="true" className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-coral px-1 text-[0.65rem] leading-5 font-bold text-charcoal ring-2 ring-cream">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-[var(--radius-lg)] bg-paper shadow-[var(--shadow-lift)] ring-1 ring-line">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="font-display font-bold">{t.notifications}</p>
            {unread > 0 && (
              <button type="button" onClick={() => start(() => markNotificationsRead())} className="text-xs font-semibold text-olive hover:underline">
                {t.markAllRead}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-soft">{t.noNotifications}</p>
          ) : (
            <ul className="max-h-[24rem] divide-y divide-line overflow-y-auto">
              {items.map((n) => {
                const Icon = icons[n.kind] ?? Bell;
                return (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => {
                        setOpen(false);
                        if (!n.read) start(() => markNotificationsRead([n.id]));
                      }}
                      className={cn("flex gap-3 px-4 py-3 transition-colors hover:bg-cream", !n.read && "bg-saffron-soft/40")}
                    >
                      <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", n.read ? "bg-cream-deep text-ink-soft" : "bg-olive text-cream")}>
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm leading-snug", !n.read && "font-semibold")}>{n.text}</span>
                        <span className="mt-0.5 block text-xs text-ink-soft">{ago(n.createdAt)}</span>
                      </span>
                      {!n.read && <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-coral" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
