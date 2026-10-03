import "server-only";
import { createSessionClient } from "@/lib/supabase/session";
import type {
  DeliveryRow,
  InvoiceRow,
  MenuDayRow,
  MonthlyMenuRow,
  OrderItemRow,
  OrderRow,
  SupportRequestRow,
} from "@/lib/supabase/types";
import { todayISO } from "@/lib/format";

/**
 * Lectures du portail client. Toutes passent par la session de l'utilisateur :
 * la RLS garantit qu'il ne voit que ses établissements.
 */

export async function getPublishedMenus(establishmentId: string) {
  const supabase = await createSessionClient();
  const { data } = await supabase
    .from("monthly_menus")
    .select("id, establishment_id, month, status, change_deadline, published_at, confirmed_at")
    .eq("establishment_id", establishmentId)
    .neq("status", "brouillon")
    .order("month", { ascending: false })
    .limit(6);
  return (data ?? []) as MonthlyMenuRow[];
}

export async function getMenuDays(menuId: string) {
  const supabase = await createSessionClient();
  const { data } = await supabase
    .from("menu_days")
    .select("id, monthly_menu_id, date, meal_id, dessert_id, snack_am_id, snack_pm_id, original_meal_id, original_slots")
    .eq("monthly_menu_id", menuId)
    .order("date");
  return (data ?? []) as MenuDayRow[];
}

export async function getOrders(establishmentId: string) {
  const supabase = await createSessionClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, establishment_id, kind, status, delivery_date, notes, created_at")
    .eq("establishment_id", establishmentId)
    .order("delivery_date", { ascending: false })
    .limit(50);
  const list = (orders ?? []) as OrderRow[];
  if (list.length === 0) return [];
  const { data: items } = await supabase
    .from("order_items")
    .select("id, order_id, meal_id, format, portions")
    .in(
      "order_id",
      list.map((o) => o.id),
    );
  const byOrder = new Map<string, OrderItemRow[]>();
  for (const item of (items ?? []) as OrderItemRow[]) byOrder.set(item.order_id, [...(byOrder.get(item.order_id) ?? []), item]);
  return list.map((order) => ({ ...order, items: byOrder.get(order.id) ?? [] }));
}

export async function getDeliveries(establishmentId: string) {
  const supabase = await createSessionClient();
  const today = todayISO();
  const [upcoming, past] = await Promise.all([
    supabase
      .from("deliveries")
      .select("id, establishment_id, order_id, scheduled_for, time_window, status")
      .eq("establishment_id", establishmentId)
      .gte("scheduled_for", today)
      .order("scheduled_for")
      .limit(30),
    supabase
      .from("deliveries")
      .select("id, establishment_id, order_id, scheduled_for, time_window, status")
      .eq("establishment_id", establishmentId)
      .lt("scheduled_for", today)
      .order("scheduled_for", { ascending: false })
      .limit(15),
  ]);
  return { upcoming: (upcoming.data ?? []) as DeliveryRow[], past: (past.data ?? []) as DeliveryRow[] };
}

export async function getInvoices(organizationId: string) {
  const supabase = await createSessionClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, organization_id, establishment_id, number, period_start, period_end, amount_cents, currency, status, due_date, paid_at, pdf_path, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(50);
  const invoices = (data ?? []) as InvoiceRow[];
  // Liens temporaires vers les PDF (bucket privé)
  const withPdf = invoices.filter((i) => i.pdf_path);
  const urls = new Map<string, string>();
  if (withPdf.length) {
    const { data: signed } = await supabase.storage.from("invoices").createSignedUrls(
      withPdf.map((i) => i.pdf_path!),
      600,
    );
    signed?.forEach((s) => s.signedUrl && s.path && urls.set(s.path, s.signedUrl));
  }
  return invoices.map((i) => ({ ...i, pdfUrl: i.pdf_path ? (urls.get(i.pdf_path) ?? null) : null }));
}

export async function getDocuments(organizationId: string) {
  const supabase = await createSessionClient();
  const { data } = await supabase.storage.from("documents").list(organizationId, { sortBy: { column: "created_at", order: "desc" } });
  const files = (data ?? []).filter((f) => f.id); // exclut les sous-dossiers
  if (files.length === 0) return [];
  const { data: signed } = await supabase.storage.from("documents").createSignedUrls(
    files.map((f) => `${organizationId}/${f.name}`),
    600,
  );
  return files.map((f, i) => ({ name: f.name, createdAt: f.created_at, url: signed?.[i]?.signedUrl ?? null }));
}

export async function getSupportRequests(organizationId: string) {
  const supabase = await createSessionClient();
  const { data } = await supabase
    .from("support_requests")
    .select("id, organization_id, establishment_id, user_id, subject, message, status, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as SupportRequestRow[];
}
