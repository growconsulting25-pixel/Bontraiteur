import { NextResponse } from "next/server";
import { isAssistantConfigured } from "@/lib/assistant/anthropic";
import { runConversation, sanitizeHistory } from "@/lib/assistant/run";
import { commonRules, siteKnowledge } from "@/lib/assistant/knowledge";
import { assistantClient } from "@/lib/assistant/portal-context";
import { portalHandlers, portalTools } from "@/lib/assistant/portal-tools";
import { allow } from "@/lib/assistant/rate-limit";
import { todayISO } from "@/lib/format";
import { portalHref, portalRoutes, type PortalRouteKey } from "@/i18n/portal-routes";
import type { AssistantReply, ProposedAction } from "@/lib/assistant/types";
import type { Locale } from "@/i18n";

/** Assistant support du portail : connecté au compte, prépare des actions à confirmer. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { locale?: string; messages?: unknown; establishmentId?: string } | null;
  const locale: Locale = body?.locale === "en" ? "en" : "fr";
  const ctx = await assistantClient(body?.establishmentId);
  if (!ctx) return NextResponse.json({ error: "auth" }, { status: 401 });
  const history = sanitizeHistory(body?.messages, 24, 2000);
  if (!history) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (!isAssistantConfigured()) return NextResponse.json({ text: "", actions: [], unavailable: true } satisfies AssistantReply);
  if (!allow(`portal:${ctx.account.user.id}`, 40, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });

  const pages = (Object.keys(portalRoutes) as PortalRouteKey[])
    .filter((k) => k !== "noAccess")
    .map((k) => `- ${k} : ${portalHref(k, locale)}`)
    .join("\n");

  const system = `Tu es l'assistant support du portail client de Bon Traiteur (repas pour CPE et garderies). Tu parles à une personne connectée.
Personne : ${ctx.account.user.email} — rôle « ${ctx.role} » (${ctx.canAct ? "peut confirmer, modifier, commander, suspendre" : "consultation seulement : ne peut pas faire de modifications"}${ctx.canSeeInvoices ? ", voit les factures" : ""}).
Établissement actif : ${ctx.establishment.name}. Aujourd'hui : ${todayISO()}.

Ton rôle : répondre aux besoins de la garderie, rapidement et concrètement.
- Consulte les données avec les outils avant de répondre sur le compte (menu, commandes, livraisons, factures). Ne devine jamais un identifiant, une date ou un statut.
- Pour une modification, PRÉPARE l'action avec un outil propose_* : une carte « Confirmer / Annuler » s'affiche. Rien n'est fait tant que la personne ne clique pas. Ne dis jamais qu'une action est faite avant d'avoir reçu le message « [J'ai confirmé l'action … réussi] ».
- Si une information manque (quel jour? quel plat? combien de portions?), pose UNE question courte. Si plusieurs plats correspondent, propose 2 ou 3 choix.
- Allergies : signale les allergènes déclarés quand tu proposes un plat, surtout s'ils figurent dans les allergies surveillées de l'établissement, et rappelle qu'ils doivent être confirmés avec l'équipe.
- Quand c'est impossible en ligne (date limite dépassée, livraison du jour, facture contestée, problème de qualité, plainte) ou si la personne veut parler à quelqu'un : propose propose_contact_team avec un message complet, et donne aussi les numéros pour une urgence.
- Après un résultat « échec », explique simplement pourquoi et propose une solution (souvent : contacter l'équipe).
- Liens vers les pages du portail (format [texte](/chemin)) :
${pages}
${commonRules(locale)}

# Connaissances sur le service
${await siteKnowledge(locale)}`;

  const proposals: ProposedAction[] = [];
  try {
    const text = await runConversation({
      system,
      history,
      tools: portalTools,
      handlers: portalHandlers(ctx, locale, proposals),
      maxSteps: 8,
    });
    return NextResponse.json({ text, actions: proposals } satisfies AssistantReply);
  } catch (e) {
    console.error("[assistant/portal]", (e as Error).message);
    return NextResponse.json({ text: "", actions: [], unavailable: true } satisfies AssistantReply);
  }
}
