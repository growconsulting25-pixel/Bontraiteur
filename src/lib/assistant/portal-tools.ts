import "server-only";
import { createSessionClient } from "@/lib/supabase/session";
import { getDeliveries, getInvoices, getMenuDays, getOrders, getPublishedMenus, getSupportRequests } from "@/lib/portal/data";
import { getMeals } from "@/lib/menu-repository";
import { mealName } from "@/lib/meal-name";
import { todayISO } from "@/lib/format";
import type { Locale } from "@/i18n";
import type { Meal } from "@/lib/types";
import type { MenuSlot } from "@/lib/supabase/types";
import type { ToolDefinition } from "./anthropic";
import type { ToolHandler } from "./run";
import type { AssistantAction, ProposedAction } from "./types";
import type { AssistantClient } from "./portal-context";

const SLOTS: MenuSlot[] = ["collation_am", "repas", "dessert", "collation_pm"];
const slotType = (s: MenuSlot) => (s === "repas" ? "repas" : s === "dessert" ? "dessert" : "collation");
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const summaryProp = {
  summary: { type: "string", description: "Résumé court et précis de l'action, dans la langue de la personne, affiché sur le bouton de confirmation (ex. « Remplacer le repas du mardi 3 novembre par Pâté chinois »)." },
};

export const portalTools: ToolDefinition[] = [
  {
    name: "get_overview",
    description: "Vue d'ensemble du compte : établissement, rôle de la personne, menus du mois (statut, date limite), prochaines livraisons, commandes récentes, demandes de support ouvertes. À appeler en premier pour toute question sur le compte.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_menu",
    description: "Menu mensuel jour par jour (identifiants des jours, plats des 4 cases : collation_am, repas, dessert, collation_pm, cases modifiées). Sans mois : le prochain menu à confirmer, sinon le plus récent.",
    input_schema: { type: "object", properties: { month: { type: "string", description: "Mois au format AAAA-MM (optionnel)." } } },
  },
  {
    name: "list_meals",
    description: "Catalogue des plats disponibles (identifiants, type, catégorie, allergènes déclarés). Sert à trouver l'identifiant d'un plat avant de proposer un changement ou une commande.",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["repas", "dessert", "collation"] },
        query: { type: "string", description: "Recherche dans le nom (optionnel)." },
      },
    },
  },
  { name: "get_orders", description: "Commandes de l'établissement (type, statut, date de livraison, lignes).", input_schema: { type: "object", properties: {} } },
  { name: "get_deliveries", description: "Livraisons à venir et passées (date, plage horaire, statut).", input_schema: { type: "object", properties: {} } },
  { name: "get_invoices", description: "Factures (numéro, période, montant, statut, échéance). Réservé aux rôles autorisés.", input_schema: { type: "object", properties: {} } },
  {
    name: "propose_confirm_menu",
    description: "Prépare la confirmation d'un menu mensuel (la personne devra cliquer « Confirmer »).",
    input_schema: { type: "object", properties: { menuId: { type: "string" }, ...summaryProp }, required: ["menuId", "summary"] },
  },
  {
    name: "propose_menu_change",
    description: "Prépare le changement d'une case du menu (repas, dessert, collation_am, collation_pm). mealId = null pour remettre le plat proposé à l'origine. Le plat doit être du bon type (repas / dessert / collation).",
    input_schema: {
      type: "object",
      properties: {
        menuDayId: { type: "string" },
        slot: { type: "string", enum: SLOTS },
        mealId: { type: ["string", "null"] },
        ...summaryProp,
      },
      required: ["menuDayId", "slot", "mealId", "summary"],
    },
  },
  {
    name: "propose_cancel_order",
    description: "Prépare l'annulation d'une commande (seulement si elle est soumise/brouillon et que la livraison n'est pas aujourd'hui ou passée).",
    input_schema: { type: "object", properties: { orderId: { type: "string" }, ...summaryProp }, required: ["orderId", "summary"] },
  },
  {
    name: "propose_pause_delivery",
    description: "Prépare la suspension d'une livraison planifiée (journée pédagogique, fermeture, congé).",
    input_schema: { type: "object", properties: { deliveryId: { type: "string" }, ...summaryProp }, required: ["deliveryId", "summary"] },
  },
  {
    name: "propose_order",
    description: "Prépare une nouvelle commande ponctuelle ou urgente (repas supplémentaires). Demande d'abord la date, les plats, le format et le nombre de portions si la personne ne les a pas donnés.",
    input_schema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["ponctuelle", "urgente"] },
        deliveryDate: { type: "string", description: "AAAA-MM-JJ, dans le futur." },
        notes: { type: "string" },
        lines: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mealId: { type: "string" },
              format: { type: "string", enum: ["chaud", "pret_a_manger", "congele"] },
              portions: { type: "integer", minimum: 1, maximum: 2000 },
            },
            required: ["mealId", "format", "portions"],
          },
        },
        ...summaryProp,
      },
      required: ["kind", "deliveryDate", "lines", "summary"],
    },
  },
  {
    name: "propose_contact_team",
    description: "Prépare l'envoi d'une demande à l'équipe Bon Traiteur (une vraie personne) quand tu ne peux pas régler la situation : modification tardive, problème de livraison, facturation, plainte, allergie à valider, ou si la personne demande à parler à quelqu'un.",
    input_schema: {
      type: "object",
      properties: {
        subject: { type: "string" },
        message: { type: "string", description: "Message complet pour l'équipe : contexte, demande précise, dates et plats concernés." },
        ...summaryProp,
      },
      required: ["subject", "message", "summary"],
    },
  },
];

/** Outils du portail, exécutés avec la session de la personne (la RLS limite à ses données). */
export function portalHandlers(ctx: AssistantClient, locale: Locale, proposals: ProposedAction[]): Record<string, ToolHandler> {
  const est = ctx.establishment;
  let catalog: Map<string, Meal> | null = null;
  const meals = async () => (catalog ??= new Map((await getMeals()).map((m) => [m.id, m])));
  const name = async (id: string | null | undefined) => (id ? ((await meals()).get(id) ? mealName((await meals()).get(id)!, locale) : id) : null);

  const propose = (summary: unknown, action: AssistantAction) => {
    const text = str(summary, 240);
    if (!text) throw new Error("summary manquant");
    proposals.push({ id: `a${Date.now().toString(36)}${proposals.length}`, summary: text, action });
    return { status: "affiché à la personne, en attente de son clic « Confirmer »", important: "Ne dis pas que c'est fait : la personne doit confirmer." };
  };
  const requireAct = () => {
    if (!ctx.canAct) throw new Error("Rôle sans droit de modification : propose plutôt de contacter l'équipe ou une personne responsable.");
  };

  return {
    async get_overview() {
      const [menus, deliveries, orders, support] = await Promise.all([
        getPublishedMenus(est.id),
        getDeliveries(est.id),
        getOrders(est.id),
        getSupportRequests(ctx.organization.id),
      ]);
      const today = todayISO();
      return {
        today,
        establishment: { name: est.name, kind: est.kind, city: est.city, childrenCount: est.children_count, watchedAllergens: est.watched_allergens },
        role: ctx.role,
        canAct: ctx.canAct,
        canSeeInvoices: ctx.canSeeInvoices,
        menus: menus.map((m) => ({ id: m.id, month: m.month.slice(0, 7), status: m.status, changeDeadline: m.change_deadline, canStillChange: m.change_deadline >= today })),
        nextDeliveries: deliveries.upcoming.slice(0, 5).map((d) => ({ id: d.id, date: d.scheduled_for, window: d.time_window, status: d.status })),
        recentOrders: orders.slice(0, 5).map((o) => ({ id: o.id, kind: o.kind, status: o.status, deliveryDate: o.delivery_date, lines: o.items.length })),
        openSupportRequests: support.filter((s) => s.status === "ouverte").map((s) => ({ subject: s.subject, createdAt: s.created_at.slice(0, 10) })),
      };
    },

    async get_menu(input) {
      const menus = await getPublishedMenus(est.id);
      if (!menus.length) return { menu: null, note: "Aucun menu publié pour le moment." };
      const month = str(input.month, 7);
      const today = todayISO();
      const menu =
        (month && menus.find((m) => m.month.startsWith(month))) ||
        [...menus].reverse().find((m) => m.status === "publie" && m.change_deadline >= today) ||
        menus[0];
      const days = await getMenuDays(menu.id);
      const out = [];
      for (const d of days) {
        const slots: Record<string, { id: string | null; name: string | null }> = {};
        const ids = { collation_am: d.snack_am_id, repas: d.meal_id, dessert: d.dessert_id, collation_pm: d.snack_pm_id };
        for (const s of SLOTS) slots[s] = { id: ids[s], name: await name(ids[s]) };
        out.push({ menuDayId: d.id, date: d.date, ...slots, changedSlots: Object.keys(d.original_slots ?? {}) });
      }
      return {
        menu: { id: menu.id, month: menu.month.slice(0, 7), status: menu.status, changeDeadline: menu.change_deadline, canStillChange: menu.change_deadline >= today },
        otherMonths: menus.filter((m) => m.id !== menu.id).map((m) => m.month.slice(0, 7)),
        days: out,
      };
    },

    async list_meals(input) {
      const type = str(input.type, 20);
      const q = str(input.query, 80)
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
      const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
      return [...(await meals()).values()]
        .filter((m) => (!type || m.mealType === type) && (!q || norm(m.name).includes(q) || norm(m.nameEn).includes(q)))
        .map((m) => ({ id: m.id, name: mealName(m, locale), type: m.mealType, category: m.category, allergensDeclared: m.allergens, rotation: m.rotationType }));
    },

    async get_orders() {
      const orders = await getOrders(est.id);
      const out = [];
      for (const o of orders.slice(0, 20))
        out.push({
          id: o.id,
          kind: o.kind,
          status: o.status,
          deliveryDate: o.delivery_date,
          notes: o.notes,
          lines: await Promise.all(o.items.map(async (i) => ({ meal: await name(i.meal_id), format: i.format, portions: i.portions }))),
        });
      return out;
    },

    async get_deliveries() {
      const { upcoming, past } = await getDeliveries(est.id);
      const map = (d: (typeof upcoming)[number]) => ({ id: d.id, date: d.scheduled_for, window: d.time_window, status: d.status, orderId: d.order_id });
      return { upcoming: upcoming.map(map), past: past.slice(0, 8).map(map) };
    },

    async get_invoices() {
      if (!ctx.canSeeInvoices) return { error: "Ce rôle n'a pas accès aux factures." };
      const invoices = await getInvoices(ctx.organization.id);
      return invoices.slice(0, 15).map((i) => ({
        number: i.number,
        period: [i.period_start, i.period_end].filter(Boolean).join(" → "),
        amount: (i.amount_cents / 100).toFixed(2) + " " + i.currency,
        status: i.status,
        dueDate: i.due_date,
        paidAt: i.paid_at,
      }));
    },

    async propose_confirm_menu(input) {
      requireAct();
      const menus = await getPublishedMenus(est.id);
      const menu = menus.find((m) => m.id === input.menuId);
      if (!menu) throw new Error("menu introuvable pour cet établissement");
      return propose(input.summary, { type: "confirm_menu", menuId: menu.id });
    },

    async propose_menu_change(input) {
      requireAct();
      const slot = input.slot as MenuSlot;
      if (!SLOTS.includes(slot)) throw new Error("case invalide");
      const supabase = await createSessionClient();
      const { data: day } = await supabase.from("menu_days").select("id, monthly_menu_id").eq("id", String(input.menuDayId)).maybeSingle();
      const menus = await getPublishedMenus(est.id);
      const menu = day && menus.find((m) => m.id === day.monthly_menu_id);
      if (!menu) throw new Error("jour de menu introuvable pour cet établissement");
      if (menu.change_deadline < todayISO()) throw new Error(`date limite dépassée (${menu.change_deadline}) : propose de contacter l'équipe`);
      const mealId = input.mealId == null ? null : String(input.mealId);
      if (mealId) {
        const meal = (await meals()).get(mealId);
        if (!meal) throw new Error("plat introuvable : utilise list_meals");
        if (meal.mealType !== slotType(slot)) throw new Error(`ce plat est de type ${meal.mealType}, la case attend ${slotType(slot)}`);
      }
      return propose(input.summary, { type: "set_menu_slot", menuDayId: String(input.menuDayId), slot, mealId });
    },

    async propose_cancel_order(input) {
      requireAct();
      const order = (await getOrders(est.id)).find((o) => o.id === input.orderId);
      if (!order) throw new Error("commande introuvable");
      if (!["brouillon", "soumise"].includes(order.status)) throw new Error(`commande ${order.status} : non annulable en ligne, propose de contacter l'équipe`);
      if (order.delivery_date <= todayISO()) throw new Error("trop tard pour annuler en ligne : propose de contacter l'équipe");
      return propose(input.summary, { type: "cancel_order", orderId: order.id });
    },

    async propose_pause_delivery(input) {
      requireAct();
      const { upcoming } = await getDeliveries(est.id);
      const delivery = upcoming.find((d) => d.id === input.deliveryId);
      if (!delivery) throw new Error("livraison à venir introuvable");
      if (delivery.status !== "planifiee") throw new Error(`livraison ${delivery.status} : non suspendable en ligne`);
      if (delivery.scheduled_for <= todayISO()) throw new Error("trop tard pour suspendre en ligne : propose de contacter l'équipe");
      return propose(input.summary, { type: "pause_delivery", deliveryId: delivery.id });
    },

    async propose_order(input) {
      requireAct();
      const kind = input.kind === "urgente" ? "urgente" : "ponctuelle";
      if (!isDate(input.deliveryDate) || input.deliveryDate <= todayISO()) throw new Error("date de livraison invalide (doit être dans le futur, AAAA-MM-JJ)");
      const raw = Array.isArray(input.lines) ? input.lines : [];
      const catalogMap = await meals();
      const lines = raw.slice(0, 30).map((l) => {
        const line = l as Record<string, unknown>;
        const meal = catalogMap.get(String(line.mealId));
        const format = String(line.format);
        const portions = Number(line.portions);
        if (!meal) throw new Error(`plat introuvable : ${String(line.mealId)}`);
        if (!["chaud", "pret_a_manger", "congele"].includes(format)) throw new Error("format invalide");
        if (!Number.isInteger(portions) || portions < 1 || portions > 2000) throw new Error("portions invalides");
        return { mealId: meal.id, format: format as "chaud" | "pret_a_manger" | "congele", portions };
      });
      if (!lines.length) throw new Error("aucune ligne");
      return propose(input.summary, { type: "create_order", kind, deliveryDate: input.deliveryDate, notes: str(input.notes, 2000), lines });
    },

    async propose_contact_team(input) {
      const subject = str(input.subject, 160);
      const message = str(input.message, 4000);
      if (!subject || !message) throw new Error("sujet et message requis");
      return propose(input.summary, { type: "contact_team", subject, message });
    },
  };
}
