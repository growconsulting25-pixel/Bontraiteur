import { NextResponse } from "next/server";
import { isAssistantConfigured } from "@/lib/assistant/anthropic";
import { runConversation, sanitizeHistory } from "@/lib/assistant/run";
import { commonRules, siteKnowledge } from "@/lib/assistant/knowledge";
import { allow, clientIp } from "@/lib/assistant/rate-limit";
import type { AssistantReply } from "@/lib/assistant/types";
import type { Locale } from "@/i18n";

/** Assistant public du site : répond aux questions et guide vers la bonne page. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { locale?: string; messages?: unknown } | null;
  const locale: Locale = body?.locale === "en" ? "en" : "fr";
  const history = sanitizeHistory(body?.messages, 16, 1200);
  if (!history) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (!isAssistantConfigured()) return NextResponse.json({ text: "", actions: [], unavailable: true } satisfies AssistantReply);
  if (!allow(`site:${clientIp(req)}`, 20, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });

  const system = `Tu es l'assistant virtuel du site de Bon Traiteur, un traiteur qui prépare et livre des repas pour les CPE, garderies et services de garde au Québec.
Ton rôle : répondre aux questions des visiteurs (souvent des directions de garderie) et les guider vers la bonne page.
- Quand c'est pertinent, termine par UNE prochaine étape claire avec un lien : voir le menu, demander une soumission, appeler l'équipe.
- Pour un prix, une zone de livraison ou un cas particulier : invite à demander une soumission ([${locale === "en" ? "Request a quote" : "Demander une soumission"}](${locale === "en" ? "/en/quote" : "/soumission"})) ou à appeler.
- Les clients existants peuvent gérer leur menu, leurs commandes et leurs livraisons dans le portail (lien Connexion), où un assistant connecté à leur compte les aide.
${commonRules(locale)}

# Connaissances (seule source d'information)
${await siteKnowledge(locale)}`;

  try {
    const text = await runConversation({ system, history, maxSteps: 1 });
    return NextResponse.json({ text, actions: [] } satisfies AssistantReply);
  } catch (e) {
    console.error("[assistant/site]", (e as Error).message);
    return NextResponse.json({ text: "", actions: [], unavailable: true } satisfies AssistantReply);
  }
}
