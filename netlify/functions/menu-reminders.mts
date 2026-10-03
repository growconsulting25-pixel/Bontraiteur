/**
 * Fonction planifiée Netlify : chaque matin (8 h, heure de Montréal ≈ 12 h UTC),
 * déclenche les rappels de confirmation de menu.
 * Variables requises sur Netlify : CRON_SECRET (+ SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY).
 */
export default async () => {
  const base = process.env.URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) return new Response("not configured", { status: 503 });
  const res = await fetch(`${base}/api/cron/menu-reminders`, { headers: { Authorization: `Bearer ${secret}` } });
  return new Response(await res.text(), { status: res.status });
};

export const config = { schedule: "0 12 * * *" };
