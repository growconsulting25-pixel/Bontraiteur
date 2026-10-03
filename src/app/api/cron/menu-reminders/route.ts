import { NextResponse, type NextRequest } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/env";
import { formatDate, formatMonth, todayISO } from "@/lib/format";

/**
 * Rappel automatique : « Votre menu n'est pas encore confirmé ».
 * Appelé chaque matin par la fonction planifiée Netlify (netlify/functions/menu-reminders.mts).
 * Envoie un courriel aux directions 3 jours puis 1 jour avant la date limite,
 * seulement pour les menus publiés et pas encore confirmés.
 * Protégé par CRON_SECRET.
 */
const REMIND_DAYS_BEFORE = [3, 1];

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const deadlines = REMIND_DAYS_BEFORE.map((n) => todayISO(n));
  const { data: menus, error } = await admin
    .from("monthly_menus")
    .select("id, month, change_deadline, establishment_id, establishments(name, organization_id, organizations(preferred_locale))")
    .eq("status", "publie")
    .in("change_deadline", deadlines);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const menu of menus ?? []) {
    const est = menu.establishments as unknown as { name: string; organization_id: string; organizations: { preferred_locale: "fr" | "en" } } | null;
    if (!est) continue;
    const locale = est.organizations?.preferred_locale === "en" ? "en" : "fr";
    const { data: members } = await admin
      .from("memberships")
      .select("user_id")
      .eq("organization_id", est.organization_id)
      .in("role", ["owner", "director", "admin"]);

    const month = formatMonth(menu.month, locale);
    const deadline = formatDate(menu.change_deadline, locale);
    const link = `${siteUrl()}${locale === "en" ? "/en/portal/my-menu" : "/portail/mon-menu"}?mois=${menu.month.slice(0, 7)}`;
    const subject =
      locale === "en" ? `Reminder: confirm your ${month} menu by ${deadline}` : `Rappel : votre menu de ${month} est à confirmer avant le ${deadline}`;
    const text = (
      locale === "en"
        ? [
            "Hello,",
            "",
            `The ${month} menu for ${est.name} hasn't been confirmed yet.`,
            "Keeping it? One click is all it takes. Want to change a meal? Pick an alternative in the calendar.",
            `Changes are possible until ${deadline}.`,
            "",
            link,
            "",
            "The Bon Traiteur team",
          ]
        : [
            "Bonjour,",
            "",
            `Le menu de ${month} pour ${est.name} n'est pas encore confirmé.`,
            "Vous le gardez? Un clic suffit. Vous voulez changer un repas? Choisissez une alternative dans le calendrier.",
            `Modifications possibles jusqu'au ${deadline}.`,
            "",
            link,
            "",
            "L'équipe Bon Traiteur",
          ]
    ).join("\n");

    for (const m of members ?? []) {
      const { data: u } = await admin.auth.admin.getUserById(m.user_id);
      if (!u.user?.email) continue;
      const res = await sendEmail({ to: u.user.email, subject, text });
      if (!("skipped" in res)) sent++;
    }
  }
  return NextResponse.json({ menus: menus?.length ?? 0, sent });
}
