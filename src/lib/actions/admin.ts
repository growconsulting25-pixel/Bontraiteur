"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/session";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getMeals } from "@/lib/menu-repository";
import { defaultDeadline, generateMenuDays } from "@/lib/admin/menu-generator";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/env";
import { formatMonth } from "@/lib/format";
import type { EstablishmentKind, MemberRole } from "@/lib/supabase/types";

/**
 * Actions du back-office. Chacune commence par requireStaff() ; la base
 * vérifie aussi (politiques RLS « Équipe gère… »). Double protection.
 */

const str = (fd: FormData, key: string, max = 500) => String(fd.get(key) ?? "").trim().slice(0, max);
const back = (fd: FormData, fallback: string) => {
  const b = str(fd, "back");
  return b.startsWith("/admin") ? b : fallback;
};
const done = (path: string, message?: string) => redirect(message ? `${path}${path.includes("?") ? "&" : "?"}msg=${encodeURIComponent(message)}` : path);

/* ---------------------------------------------------------------- Soumissions */

export async function updateQuoteStatus(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  await supabase.from("quote_requests").update({ status: str(fd, "status") }).eq("id", str(fd, "id"));
  revalidatePath("/admin/soumissions");
}

const kindFromType = (type: string): EstablishmentKind => {
  const t = type.toLowerCase();
  if (t.includes("cpe")) return "cpe";
  if (t.includes("subvention")) return "garderie_subventionnee";
  if (t.includes("priv")) return "garderie_privee";
  if (t.includes("service") || t.includes("childcare")) return "service_de_garde";
  return "autre";
};

/** Transforme une soumission en client (organisation + établissement). */
export async function convertQuote(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  const { data: quote } = await supabase.from("quote_requests").select("*").eq("id", str(fd, "id")).single();
  if (!quote) done("/admin/soumissions", "Soumission introuvable.");

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({ name: quote.establishment_name, preferred_locale: quote.locale })
    .select("id")
    .single();
  if (error || !org) done("/admin/soumissions", `Erreur : ${error?.message}`);

  await supabase.from("establishments").insert({
    organization_id: org!.id,
    name: quote.establishment_name,
    kind: kindFromType(quote.establishment_type),
    city: quote.city,
    children_count: quote.children_count,
    delivery_notes: [quote.restrictions && `Restrictions : ${quote.restrictions}`, quote.message].filter(Boolean).join("\n") || null,
  });
  await supabase.from("quote_requests").update({ status: "convertie" }).eq("id", quote.id);
  done(`/admin/clients/${org!.id}`, `Client créé. Invitez maintenant ${quote.contact_name} (${quote.email}).`);
}

/* ---------------------------------------------------------------- Clients */

export async function createOrganization(fd: FormData) {
  await requireStaff();
  const name = str(fd, "name", 160);
  if (!name) done("/admin/clients", "Nom requis.");
  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("organizations")
    .insert({ name, preferred_locale: str(fd, "locale") === "en" ? "en" : "fr" })
    .select("id")
    .single();
  if (error || !data) done("/admin/clients", `Erreur : ${error?.message}`);
  done(`/admin/clients/${data!.id}`, "Organisation créée.");
}

export async function createEstablishment(fd: FormData) {
  await requireStaff();
  const orgId = str(fd, "organizationId");
  const supabase = await createSessionClient();
  const children = Number.parseInt(str(fd, "childrenCount"), 10);
  const { error } = await supabase.from("establishments").insert({
    organization_id: orgId,
    name: str(fd, "name", 160),
    kind: (str(fd, "kind") || "cpe") as EstablishmentKind,
    address: str(fd, "address") || null,
    city: str(fd, "city", 120) || null,
    children_count: Number.isFinite(children) ? children : null,
    delivery_notes: str(fd, "deliveryNotes", 2000) || null,
  });
  done(`/admin/clients/${orgId}`, error ? `Erreur : ${error.message}` : "Établissement ajouté.");
}

/**
 * Invite un utilisateur (courriel) dans une organisation avec un rôle.
 * Nécessite SUPABASE_SERVICE_ROLE_KEY (création du compte Auth).
 */
export async function inviteMember(fd: FormData) {
  await requireStaff();
  const orgId = str(fd, "organizationId");
  const email = str(fd, "email", 200).toLowerCase();
  const role = (str(fd, "role") || "director") as MemberRole;
  const path = `/admin/clients/${orgId}`;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) done(path, "Courriel invalide.");

  const admin = getAdminSupabase();
  if (!admin) done(path, "Invitation impossible : ajoutez SUPABASE_SERVICE_ROLE_KEY aux variables d'environnement.");

  const supabase = await createSessionClient();
  const { data: org } = await supabase.from("organizations").select("preferred_locale").eq("id", orgId).single();
  const locale = org?.preferred_locale === "en" ? "en" : "fr";

  let userId: string | undefined;
  const invited = await admin!.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?locale=${locale}`,
  });
  if (invited.data.user) {
    userId = invited.data.user.id;
  } else {
    // Déjà inscrit : on le retrouve pour l'ajouter à cette organisation aussi.
    for (let page = 1; page <= 10 && !userId; page++) {
      const { data } = await admin!.auth.admin.listUsers({ page, perPage: 200 });
      userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id;
      if (data.users.length < 200) break;
    }
  }
  if (!userId) done(path, `Invitation impossible : ${invited.error?.message ?? "utilisateur introuvable"}`);

  const { error } = await supabase.from("memberships").upsert({ user_id: userId, organization_id: orgId, role });
  done(path, error ? `Erreur : ${error.message}` : invited.data.user ? `Invitation envoyée à ${email}.` : `${email} a maintenant accès à cette organisation.`);
}

export async function updateMemberRole(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  await supabase.from("memberships").update({ role: str(fd, "role") }).eq("user_id", str(fd, "userId")).eq("organization_id", str(fd, "organizationId"));
  revalidatePath(`/admin/clients/${str(fd, "organizationId")}`);
}

export async function removeMember(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  await supabase.from("memberships").delete().eq("user_id", str(fd, "userId")).eq("organization_id", str(fd, "organizationId"));
  revalidatePath(`/admin/clients/${str(fd, "organizationId")}`);
}

export async function uploadDocument(fd: FormData) {
  await requireStaff();
  const orgId = str(fd, "organizationId");
  const file = fd.get("file");
  const path = `/admin/clients/${orgId}`;
  if (!(file instanceof File) || file.size === 0) done(path, "Choisissez un fichier.");
  if ((file as File).size > 10 * 1024 * 1024) done(path, "Fichier trop lourd (10 Mo max).");
  const safeName = (file as File).name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\- ]+/g, "_");
  const supabase = await createSessionClient();
  const { error } = await supabase.storage.from("documents").upload(`${orgId}/${safeName}`, file as File, { upsert: true, contentType: (file as File).type });
  done(path, error ? `Erreur : ${error.message}` : "Document partagé avec le client.");
}

export async function deleteDocument(fd: FormData) {
  await requireStaff();
  const orgId = str(fd, "organizationId");
  const supabase = await createSessionClient();
  await supabase.storage.from("documents").remove([`${orgId}/${str(fd, "name", 300)}`]);
  revalidatePath(`/admin/clients/${orgId}`);
}

/* ---------------------------------------------------------------- Menus */

async function createMenuFor(establishmentId: string, month: string) {
  const supabase = await createSessionClient();
  const meals = await getMeals();
  const { data: menu, error } = await supabase
    .from("monthly_menus")
    .insert({ establishment_id: establishmentId, month, status: "brouillon", change_deadline: defaultDeadline(month) })
    .select("id")
    .single();
  if (error || !menu) return error?.message ?? "erreur";
  const days = generateMenuDays(month, meals).map((d) => ({ ...d, monthly_menu_id: menu.id }));
  const { error: daysError } = await supabase.from("menu_days").insert(days);
  return daysError?.message ?? null;
}

export async function generateMenu(fd: FormData) {
  await requireStaff();
  const month = `${str(fd, "month")}-01`;
  const establishmentId = str(fd, "establishmentId");
  const error = await createMenuFor(establishmentId, month);
  done(`/admin/menus?etablissement=${establishmentId}&mois=${month.slice(0, 7)}`, error ? `Erreur : ${error}` : "Menu généré (brouillon). Vérifiez-le puis publiez.");
}

/** Génère le brouillon du mois pour TOUS les établissements qui n'en ont pas. */
export async function generateMenusForAll(fd: FormData) {
  await requireStaff();
  const month = `${str(fd, "month")}-01`;
  const supabase = await createSessionClient();
  const [{ data: establishments }, { data: existing }] = await Promise.all([
    supabase.from("establishments").select("id"),
    supabase.from("monthly_menus").select("establishment_id").eq("month", month),
  ]);
  const has = new Set((existing ?? []).map((m) => m.establishment_id));
  let created = 0;
  for (const e of establishments ?? []) {
    if (has.has(e.id)) continue;
    if (!(await createMenuFor(e.id, month))) created++;
  }
  done(`/admin/menus?mois=${month.slice(0, 7)}`, `${created} menu(s) généré(s) en brouillon.`);
}

export async function updateMenuDay(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  await supabase
    .from("menu_days")
    .update({ meal_id: str(fd, "mealId"), dessert_id: str(fd, "dessertId") || null })
    .eq("id", str(fd, "dayId"));
  revalidatePath("/admin/menus");
}

export async function deleteMenuDay(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  await supabase.from("menu_days").delete().eq("id", str(fd, "dayId"));
  revalidatePath("/admin/menus");
}

export async function updateMenuDeadline(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  await supabase.from("monthly_menus").update({ change_deadline: str(fd, "deadline") }).eq("id", str(fd, "menuId"));
  revalidatePath("/admin/menus");
}

/** Publie le menu : le client le voit et reçoit un avis par courriel. */
export async function publishMenu(fd: FormData) {
  await requireStaff();
  const menuId = str(fd, "menuId");
  const supabase = await createSessionClient();
  const { data: menu } = await supabase
    .from("monthly_menus")
    .update({ status: "publie", published_at: new Date().toISOString() })
    .eq("id", menuId)
    .eq("status", "brouillon")
    .select("id, month, change_deadline, establishment_id")
    .single();

  // Avis aux membres de l'organisation (si le courriel est configuré)
  const admin = getAdminSupabase();
  if (menu && admin) {
    const { data: est } = await supabase.from("establishments").select("name, organization_id").eq("id", menu.establishment_id).single();
    const { data: members } = await supabase.from("memberships").select("user_id, role").eq("organization_id", est?.organization_id ?? "");
    for (const m of (members ?? []).filter((x) => x.role !== "viewer" && x.role !== "accounting")) {
      const { data: u } = await admin.auth.admin.getUserById(m.user_id);
      if (!u.user?.email) continue;
      await sendEmail({
        to: u.user.email,
        subject: `Votre menu de ${formatMonth(menu.month, "fr")} est prêt — ${est?.name}`,
        text: [
          `Bonjour,`,
          ``,
          `Le menu de ${formatMonth(menu.month, "fr")} pour ${est?.name} est prêt.`,
          `Vous le gardez? Un clic suffit. Vous voulez changer un repas? Choisissez une alternative.`,
          `À confirmer avant le ${menu.change_deadline}.`,
          ``,
          `${siteUrl()}/portail/mon-menu?mois=${menu.month.slice(0, 7)}`,
          ``,
          `L'équipe Bon Traiteur`,
        ].join("\n"),
      });
    }
  }
  done(back(fd, "/admin/menus"), menu ? "Menu publié." : "Ce menu est déjà publié.");
}

/** Crée une livraison planifiée pour chaque jour du menu (si absente). */
export async function scheduleMenuDeliveries(fd: FormData) {
  await requireStaff();
  const menuId = str(fd, "menuId");
  const supabase = await createSessionClient();
  const { data: menu } = await supabase.from("monthly_menus").select("establishment_id").eq("id", menuId).single();
  const { data: days } = await supabase.from("menu_days").select("date").eq("monthly_menu_id", menuId);
  if (!menu || !days?.length) done(back(fd, "/admin/menus"), "Aucun jour à planifier.");
  const dates = days!.map((d) => d.date);
  const { data: existing } = await supabase.from("deliveries").select("scheduled_for").eq("establishment_id", menu!.establishment_id).in("scheduled_for", dates);
  const taken = new Set((existing ?? []).map((d) => d.scheduled_for));
  const rows = dates.filter((d) => !taken.has(d)).map((d) => ({ establishment_id: menu!.establishment_id, scheduled_for: d, time_window: str(fd, "window", 60) || null }));
  const { error } = rows.length ? await supabase.from("deliveries").insert(rows) : { error: null };
  done(back(fd, "/admin/menus"), error ? `Erreur : ${error.message}` : `${rows.length} livraison(s) planifiée(s).`);
}

/* ---------------------------------------------------------------- Commandes & livraisons */

export async function updateOrderStatus(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  await supabase.from("orders").update({ status: str(fd, "status") }).eq("id", str(fd, "id"));
  revalidatePath("/admin/commandes");
}

export async function createDelivery(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  const { error } = await supabase.from("deliveries").insert({
    establishment_id: str(fd, "establishmentId"),
    scheduled_for: str(fd, "date"),
    time_window: str(fd, "window", 60) || null,
    order_id: str(fd, "orderId") || null,
  });
  done("/admin/livraisons", error ? `Erreur : ${error.message}` : "Livraison planifiée.");
}

export async function updateDeliveryStatus(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  await supabase.from("deliveries").update({ status: str(fd, "status") }).eq("id", str(fd, "id"));
  revalidatePath("/admin/livraisons");
}

/* ---------------------------------------------------------------- Factures */

export async function createInvoice(fd: FormData) {
  await requireStaff();
  const amount = Math.round(Number.parseFloat(str(fd, "amount").replace(",", ".")) * 100);
  if (!Number.isFinite(amount) || amount < 0) done("/admin/factures", "Montant invalide.");
  const supabase = await createSessionClient();
  const { error } = await supabase.from("invoices").insert({
    organization_id: str(fd, "organizationId"),
    establishment_id: str(fd, "establishmentId") || null,
    amount_cents: amount,
    period_start: str(fd, "periodStart") || null,
    period_end: str(fd, "periodEnd") || null,
    due_date: str(fd, "dueDate") || null,
    status: str(fd, "status") === "a_payer" ? "a_payer" : "brouillon",
  });
  done("/admin/factures", error ? `Erreur : ${error.message}` : "Facture créée.");
}

export async function updateInvoiceStatus(fd: FormData) {
  await requireStaff();
  const status = str(fd, "status");
  const supabase = await createSessionClient();
  await supabase
    .from("invoices")
    .update({ status, paid_at: status === "payee" ? new Date().toISOString() : null })
    .eq("id", str(fd, "id"));
  revalidatePath("/admin/factures");
}

export async function uploadInvoicePdf(fd: FormData) {
  await requireStaff();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0 || file.type !== "application/pdf") done("/admin/factures", "Choisissez un PDF.");
  const supabase = await createSessionClient();
  const { data: invoice } = await supabase.from("invoices").select("id, organization_id, number").eq("id", str(fd, "id")).single();
  if (!invoice) done("/admin/factures", "Facture introuvable.");
  const path = `${invoice!.organization_id}/${invoice!.number}.pdf`;
  const { error } = await supabase.storage.from("invoices").upload(path, file as File, { upsert: true, contentType: "application/pdf" });
  if (!error) await supabase.from("invoices").update({ pdf_path: path }).eq("id", invoice!.id);
  done("/admin/factures", error ? `Erreur : ${error.message}` : "PDF ajouté.");
}

/* ---------------------------------------------------------------- Repas */

const triState = (v: string) => (v === "oui" ? true : v === "non" ? false : null);

export async function updateMeal(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("meals")
    .update({
      name_fr: str(fd, "nameFr", 200),
      name_en: str(fd, "nameEn", 200),
      description_fr: str(fd, "descriptionFr", 500),
      description_en: str(fd, "descriptionEn", 500),
      image_url: str(fd, "imageUrl", 500) || null,
      status: str(fd, "status"),
      available_hot: triState(str(fd, "hot")),
      available_frozen: triState(str(fd, "frozen")),
      available_ready_to_eat: triState(str(fd, "ready")),
      allergens: fd.getAll("allergens").map(String),
      allergens_verified: fd.get("allergensVerified") === "on",
    })
    .eq("id", str(fd, "id"));
  // Le site public se met à jour immédiatement
  for (const p of ["/", "/menu", "/nos-repas", "/comment-ca-fonctionne", "/en", "/en/menu", "/en/our-meals", "/en/how-it-works"]) revalidatePath(p);
  done("/admin/repas", error ? `Erreur : ${error.message}` : "Plat mis à jour. Le site public est à jour.");
}

/* ---------------------------------------------------------------- Support */

export async function resolveSupport(fd: FormData) {
  await requireStaff();
  const supabase = await createSessionClient();
  const resolved = str(fd, "status") === "resolue";
  await supabase
    .from("support_requests")
    .update({ status: resolved ? "resolue" : "ouverte", resolved_at: resolved ? new Date().toISOString() : null })
    .eq("id", str(fd, "id"));
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${str(fd, "id")}`);
}

/** Réponse de l'équipe dans une conversation : le client est avisé (cloche + courriel). */
export async function staffReply(fd: FormData) {
  const account = await requireStaff();
  const supabase = await createSessionClient();
  const requestId = str(fd, "requestId");
  const body = str(fd, "body", 4000);
  if (!requestId || !body) return;
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", account.user.id).maybeSingle();
  const { error } = await supabase.from("support_messages").insert({
    request_id: requestId,
    author_id: account.user.id,
    from_staff: true,
    author_name: profile?.full_name || "Équipe Bon Traiteur",
    body,
  });
  if (error) throw new Error(error.message);
  await supabase.from("support_requests").update({ staff_unread: false }).eq("id", requestId);

  // Courriel à la personne qui a ouvert la conversation
  const admin = getAdminSupabase();
  const { data: req } = await supabase.from("support_requests").select("user_id, subject, organizations(preferred_locale)").eq("id", requestId).maybeSingle();
  if (admin && req) {
    const { data: u } = await admin.auth.admin.getUserById(req.user_id);
    const en = (req.organizations as unknown as { preferred_locale?: string } | null)?.preferred_locale === "en";
    if (u.user?.email)
      await sendEmail({
        to: u.user.email,
        subject: en ? `Bon Traiteur replied: ${req.subject}` : `Bon Traiteur vous a répondu : ${req.subject}`,
        text: [body, "", `${siteUrl()}${en ? "/en/portal/support" : "/portail/support"}/${requestId}`, "", en ? "The Bon Traiteur team" : "L'équipe Bon Traiteur"].join("\n"),
      });
  }
  revalidatePath(`/admin/support/${requestId}`);
  revalidatePath("/admin/support");
}

export async function markStaffRead(requestId: string) {
  await requireStaff();
  const supabase = await createSessionClient();
  await supabase.from("support_requests").update({ staff_unread: false }).eq("id", requestId);
}
