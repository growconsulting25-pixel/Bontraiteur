import Link from "next/link";
import { Card, PageTitle } from "@/components/portal/ui/PortalUI";
import { createSessionClient } from "@/lib/supabase/session";
import { monthStart, todayISO, formatMonth } from "@/lib/format";

export const metadata = { title: "Tableau de bord" };

export default async function AdminDashboard() {
  const supabase = await createSessionClient();
  const today = todayISO();
  const nextMonth = monthStart(1);
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);

  const [quotes, urgent, deliveriesToday, deliveriesTomorrow, overdue, support, establishments, menusNext] = await Promise.all([
    count(supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "nouvelle")),
    count(supabase.from("orders").select("id", { count: "exact", head: true }).eq("kind", "urgente").eq("status", "soumise")),
    count(supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("scheduled_for", today).in("status", ["planifiee", "en_route"])),
    count(supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("scheduled_for", todayISO(1)).eq("status", "planifiee")),
    count(supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "en_retard")),
    count(supabase.from("support_requests").select("id", { count: "exact", head: true }).eq("status", "ouverte")),
    count(supabase.from("establishments").select("id", { count: "exact", head: true })),
    supabase.from("monthly_menus").select("status").eq("month", nextMonth),
  ]);

  const menus = menusNext.data ?? [];
  const tiles = [
    { label: "Nouvelles soumissions", value: quotes, href: "/admin/soumissions", alert: quotes > 0 },
    { label: "Commandes urgentes à confirmer", value: urgent, href: "/admin/commandes", alert: urgent > 0 },
    { label: "Livraisons aujourd'hui", value: deliveriesToday, href: "/admin/livraisons" },
    { label: "Livraisons demain", value: deliveriesTomorrow, href: "/admin/livraisons" },
    { label: "Factures en retard", value: overdue, href: "/admin/factures", alert: overdue > 0 },
    { label: "Demandes de support ouvertes", value: support, href: "/admin/support", alert: support > 0 },
  ];

  return (
    <>
      <PageTitle title="Tableau de bord" lead="Ce qui demande votre attention aujourd'hui." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`rounded-[var(--radius-lg)] p-5 ring-1 transition-shadow hover:shadow-[var(--shadow-soft)] ${t.alert ? "bg-saffron ring-saffron" : "bg-paper ring-line"}`}>
            <p className="font-display text-4xl font-extrabold">{t.value}</p>
            <p className="mt-1 text-sm font-semibold">{t.label}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-8">
        <p className="font-display text-lg font-bold capitalize">Menus de {formatMonth(nextMonth, "fr")}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {establishments} établissement(s) · {menus.length} menu(s) créé(s) · {menus.filter((m) => m.status === "brouillon").length} brouillon(s) ·{" "}
          {menus.filter((m) => m.status === "publie").length} à confirmer par le client · {menus.filter((m) => m.status === "confirme" || m.status === "modifie").length} confirmé(s)
        </p>
        <Link href={`/admin/menus?mois=${nextMonth.slice(0, 7)}`} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
          Gérer les menus
        </Link>
      </Card>
    </>
  );
}
