import "server-only";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";
import { createOrder } from "@/lib/actions/portal";
import { notifyTeam } from "@/lib/email";
import { todayISO } from "@/lib/format";
import type { Locale } from "@/i18n";
import type { AssistantAction } from "./types";
import type { AssistantClient } from "./portal-context";

type Result = { ok: true } | { ok: false; error: string };

const refresh = () => {
  revalidatePath("/portail", "layout");
  revalidatePath("/en/portal", "layout");
};

/**
 * Exécute une action confirmée par la personne. Tout passe par sa session :
 * les règles (rôle, date limite, statut, appartenance) sont revérifiées par la base.
 */
export async function executeAction(ctx: AssistantClient, action: AssistantAction, locale: Locale): Promise<Result> {
  const supabase = await createSessionClient();
  const est = ctx.establishment;
  if (action.type !== "contact_team" && !ctx.canAct) return { ok: false, error: "acces_refuse" };

  const belongs = async (table: "monthly_menus" | "orders" | "deliveries", id: string) => {
    const { data } = await supabase.from(table).select("id").eq("id", id).eq("establishment_id", est.id).maybeSingle();
    return Boolean(data);
  };

  switch (action.type) {
    case "confirm_menu": {
      if (!(await belongs("monthly_menus", action.menuId))) return { ok: false, error: "menu_introuvable" };
      const { error } = await supabase.rpc("confirm_monthly_menu", { p_menu_id: action.menuId });
      if (error) return { ok: false, error: error.message };
      break;
    }
    case "set_menu_slot": {
      const { data: day } = await supabase.from("menu_days").select("monthly_menu_id").eq("id", action.menuDayId).maybeSingle();
      if (!day || !(await belongs("monthly_menus", day.monthly_menu_id))) return { ok: false, error: "jour_introuvable" };
      const { error } = await supabase.rpc("set_menu_slot", { p_menu_day_id: action.menuDayId, p_slot: action.slot, p_meal_id: action.mealId });
      if (error) return { ok: false, error: error.message };
      break;
    }
    case "cancel_order": {
      if (!(await belongs("orders", action.orderId))) return { ok: false, error: "commande_introuvable" };
      const { error } = await supabase.rpc("cancel_order", { p_order_id: action.orderId });
      if (error) return { ok: false, error: error.message };
      break;
    }
    case "pause_delivery": {
      if (!(await belongs("deliveries", action.deliveryId))) return { ok: false, error: "livraison_introuvable" };
      const { error } = await supabase.rpc("pause_delivery", { p_delivery_id: action.deliveryId });
      if (error) return { ok: false, error: error.message };
      break;
    }
    case "create_order": {
      if (action.deliveryDate <= todayISO()) return { ok: false, error: "date_invalide" };
      const res = await createOrder({ locale, establishmentId: est.id, kind: action.kind, deliveryDate: action.deliveryDate, notes: action.notes, lines: action.lines });
      if (!res.ok) return res;
      break;
    }
    case "contact_team": {
      const user = ctx.account.user;
      const subject = action.subject.slice(0, 160);
      const message = `${action.message.slice(0, 4000)}\n\n— Envoyé via l'assistant du portail`;
      const { error } = await supabase.from("support_requests").insert({
        organization_id: ctx.organization.id,
        establishment_id: est.id,
        user_id: user.id,
        subject,
        message,
      });
      if (error) return { ok: false, error: error.message };
      await notifyTeam(`Support (assistant) — ${est.name} : ${subject}`, [`De : ${user.email}`, `Établissement : ${est.name}`, "", message], user.email ?? undefined);
      break;
    }
    default:
      return { ok: false, error: "action_inconnue" };
  }
  refresh();
  return { ok: true };
}

/** Valide la forme d'une action reçue du navigateur. */
export function parseAction(raw: unknown): AssistantAction | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const s = (v: unknown) => typeof v === "string" && v.length > 0 && v.length < 200;
  switch (a.type) {
    case "confirm_menu":
      return s(a.menuId) ? { type: "confirm_menu", menuId: a.menuId as string } : null;
    case "set_menu_slot":
      return s(a.menuDayId) && ["collation_am", "repas", "dessert", "collation_pm"].includes(a.slot as string) && (a.mealId === null || s(a.mealId))
        ? { type: "set_menu_slot", menuDayId: a.menuDayId as string, slot: a.slot as "repas", mealId: (a.mealId as string | null) ?? null }
        : null;
    case "cancel_order":
      return s(a.orderId) ? { type: "cancel_order", orderId: a.orderId as string } : null;
    case "pause_delivery":
      return s(a.deliveryId) ? { type: "pause_delivery", deliveryId: a.deliveryId as string } : null;
    case "create_order": {
      if (!["ponctuelle", "urgente"].includes(a.kind as string) || typeof a.deliveryDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(a.deliveryDate) || !Array.isArray(a.lines)) return null;
      const lines = (a.lines as Array<Record<string, unknown>>).slice(0, 30).map((l) => ({
        mealId: String(l.mealId),
        format: String(l.format) as "chaud",
        portions: Number(l.portions),
      }));
      if (!lines.length || lines.some((l) => !["chaud", "pret_a_manger", "congele"].includes(l.format) || !Number.isInteger(l.portions) || l.portions < 1 || l.portions > 2000)) return null;
      return { type: "create_order", kind: a.kind as "ponctuelle", deliveryDate: a.deliveryDate, notes: typeof a.notes === "string" ? a.notes.slice(0, 2000) : "", lines };
    }
    case "contact_team":
      return typeof a.subject === "string" && typeof a.message === "string" && a.subject.trim() && a.message.trim()
        ? { type: "contact_team", subject: a.subject.slice(0, 160), message: a.message.slice(0, 4000) }
        : null;
    default:
      return null;
  }
}
