import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import { portalHref } from "@/i18n/portal-routes";
import { formatDate, formatMoney, formatMonth } from "@/lib/format";
import type { NotificationRow } from "@/lib/supabase/types";

const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");

/** Texte et lien d'une notification, dans la langue du portail. */
export function notificationView(n: NotificationRow, d: Dictionary, locale: Locale): { text: string; href: string } {
  const t = d.portal.notif;
  const p = n.payload as Record<string, string | number | null>;
  const date = (v: unknown) => (typeof v === "string" && v ? formatDate(v.slice(0, 10), locale) : "");
  let text = "";
  switch (n.kind) {
    case "menu_published":
    case "menu_reminder":
      text = fill(t[n.kind], { month: p.month ? formatMonth(String(p.month), locale) : "", deadline: date(p.deadline) });
      break;
    case "order_status":
      text = fill(t.order_status, { date: date(p.date), status: (d.portal.orders.status as Record<string, string>)[String(p.status)] ?? String(p.status) });
      break;
    case "delivery_status": {
      const key = `delivery_${p.status}` as keyof typeof t;
      text = fill((t[key] as string | undefined) ?? t.delivery_planifiee, { date: date(p.date), window: p.window ? ` (${p.window})` : "" });
      break;
    }
    case "invoice_new":
    case "invoice_overdue":
      text = fill(t[n.kind], { number: String(p.number ?? ""), amount: typeof p.amount_cents === "number" ? formatMoney(p.amount_cents, locale) : "" });
      break;
    case "message":
      text = fill(t.message, { subject: String(p.subject ?? "") });
      break;
    default:
      text = String(p.text ?? n.kind);
  }
  const link = n.link ?? "";
  const href = link.startsWith("support:")
    ? `${portalHref("support", locale)}/${link.slice(8)}`
    : (["menu", "orders", "deliveries", "invoices", "documents", "support"] as const).includes(link as "menu")
      ? portalHref(link as "menu", locale)
      : portalHref("home", locale);
  return { text, href };
}
