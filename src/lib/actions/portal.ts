"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";
import { ESTABLISHMENT_COOKIE, getAccount, getUser } from "@/lib/auth";
import { notifyTeam } from "@/lib/email";
import { todayISO } from "@/lib/format";
import { portalHref } from "@/i18n/portal-routes";
import type { Locale } from "@/i18n/config";
import type { MealFormat, MenuSlot, OrderKind } from "@/lib/supabase/types";

/**
 * Actions du portail client. Les règles métier (rôle, date limite, statut)
 * sont vérifiées DANS la base (RLS + fonctions RPC) : ces actions ne font
 * que les appeler et rafraîchir l'affichage.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

const localeOf = (formData: FormData): Locale => (formData.get("locale") === "en" ? "en" : "fr");

/** Change l'établissement actif (clients multi-sites). */
export async function setEstablishment(formData: FormData) {
  const id = String(formData.get("establishmentId") ?? "");
  const account = await getAccount();
  if (account?.establishments.some((e) => e.id === id)) {
    (await cookies()).set(ESTABLISHMENT_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  const back = String(formData.get("back") ?? "");
  redirect(back.startsWith("/") && !back.startsWith("//") ? back : portalHref("home", localeOf(formData)));
}

export async function confirmMenu(menuId: string): Promise<ActionResult> {
  const supabase = await createSessionClient();
  const { error } = await supabase.rpc("confirm_monthly_menu", { p_menu_id: menuId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/portail", "layout");
  revalidatePath("/en/portal", "layout");
  return { ok: true };
}

export async function replaceMeal(menuDayId: string, mealId: string): Promise<ActionResult> {
  const supabase = await createSessionClient();
  const { error } = await supabase.rpc("replace_menu_meal", { p_menu_day_id: menuDayId, p_meal_id: mealId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/portail", "layout");
  revalidatePath("/en/portal", "layout");
  return { ok: true };
}

/**
 * Change une case du calendrier (repas, dessert, collations).
 * mealId = null : remettre le plat proposé à l'origine.
 * Utilisé par le portail client ET le back-office (la base distingue les droits).
 */
export async function setMenuSlot(menuDayId: string, slot: MenuSlot, mealId: string | null): Promise<ActionResult> {
  const supabase = await createSessionClient();
  const { error } = await supabase.rpc("set_menu_slot", { p_menu_day_id: menuDayId, p_slot: slot, p_meal_id: mealId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/portail", "layout");
  revalidatePath("/en/portal", "layout");
  revalidatePath("/admin/menus");
  return { ok: true };
}

export async function cancelOrder(formData: FormData) {
  const supabase = await createSessionClient();
  await supabase.rpc("cancel_order", { p_order_id: String(formData.get("id")) });
  revalidatePath(portalHref("orders", localeOf(formData)));
}

export async function pauseDelivery(formData: FormData) {
  const supabase = await createSessionClient();
  await supabase.rpc("pause_delivery", { p_delivery_id: String(formData.get("id")) });
  revalidatePath(portalHref("deliveries", localeOf(formData)));
}

export interface NewOrderInput {
  locale: Locale;
  establishmentId: string;
  kind: Extract<OrderKind, "ponctuelle" | "urgente">;
  deliveryDate: string;
  notes: string;
  lines: Array<{ mealId: string; format: MealFormat; portions: number }>;
}

export async function createOrder(input: NewOrderInput): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "auth" };

  const lines = input.lines.filter((l) => l.mealId && Number.isInteger(l.portions) && l.portions > 0 && l.portions <= 2000);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(input.deliveryDate) && input.deliveryDate > todayISO();
  if (!validDate || lines.length === 0 || lines.length !== input.lines.length) return { ok: false, error: "invalid" };

  const supabase = await createSessionClient();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      establishment_id: input.establishmentId,
      kind: input.kind,
      status: "soumise",
      delivery_date: input.deliveryDate,
      notes: input.notes.trim().slice(0, 2000) || null,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error || !order) return { ok: false, error: error?.message ?? "insert" };

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(lines.map((l) => ({ order_id: order.id, meal_id: l.mealId, format: l.format, portions: l.portions })));
  if (itemsError) {
    // Commande sans lignes : on l'annule pour ne pas laisser de commande vide.
    await supabase.rpc("cancel_order", { p_order_id: order.id });
    return { ok: false, error: itemsError.message };
  }

  const account = await getAccount();
  const establishment = account?.establishments.find((e) => e.id === input.establishmentId);
  await notifyTeam(
    `${input.kind === "urgente" ? "URGENT — " : ""}Nouvelle commande : ${establishment?.name ?? "établissement"} (${input.deliveryDate})`,
    [
      `Établissement : ${establishment?.name ?? input.establishmentId}`,
      `Type : ${input.kind}`,
      `Livraison : ${input.deliveryDate}`,
      `Lignes : ${lines.length}`,
      `Par : ${user.email}`,
      input.notes ? `Notes : ${input.notes}` : "",
    ],
    user.email,
  );

  revalidatePath(portalHref("orders", input.locale));
  return { ok: true };
}

export type SupportState = { status: "idle" | "sent" | "error" };

export async function createSupportRequest(_: SupportState, formData: FormData): Promise<SupportState> {
  const user = await getUser();
  const account = await getAccount();
  const establishmentId = String(formData.get("establishmentId") ?? "");
  const establishment = account?.establishments.find((e) => e.id === establishmentId);
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 160);
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
  if (!user || !establishment || !subject || !message) return { status: "error" };

  const supabase = await createSessionClient();
  const { error } = await supabase.from("support_requests").insert({
    organization_id: establishment.organization_id,
    establishment_id: establishment.id,
    user_id: user.id,
    subject,
    message,
  });
  if (error) return { status: "error" };

  await notifyTeam(`Support — ${establishment.name} : ${subject}`, [`De : ${user.email}`, `Établissement : ${establishment.name}`, "", message], user.email ?? undefined);
  revalidatePath(portalHref("support", localeOf(formData)));
  return { status: "sent" };
}
