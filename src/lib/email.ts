import "server-only";

/**
 * Courriels transactionnels via Resend (https://resend.com), sans dépendance.
 * Sans RESEND_API_KEY, l'envoi est simplement ignoré (le site fonctionne quand même).
 */
export async function sendEmail({ to, subject, text, replyTo }: { to: string | string[]; subject: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Bon Traiteur <notifications@bontraiteur.com>";
  if (!key) return { skipped: true as const };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text, reply_to: replyTo }),
    });
    if (!res.ok) console.error("[email] Échec Resend :", res.status, await res.text());
    return { ok: res.ok };
  } catch (error) {
    console.error("[email] Erreur réseau :", error);
    return { ok: false };
  }
}

/** Adresse(s) de l'équipe qui reçoit les alertes (soumissions, urgences, support). */
export const teamInbox = () => (process.env.TEAM_NOTIFICATION_EMAIL ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export async function notifyTeam(subject: string, lines: string[], replyTo?: string) {
  const to = teamInbox();
  if (to.length === 0) return;
  await sendEmail({ to, subject, text: lines.join("\n"), replyTo });
}
