import { siteKnowledge } from "@/lib/assistant/knowledge";
import { site } from "@/data/site";
import { href } from "@/i18n";

/**
 * /llms.txt — résumé factuel du site pour les moteurs de réponse et les IA
 * (ChatGPT, Perplexity, Gemini, Copilot…). Généré à partir du contenu réel du site.
 */
export const dynamic = "force-static";

export async function GET() {
  const fr = await siteKnowledge("fr");
  const pagesEn = (["home", "menu", "meals", "daycares", "howItWorks", "faq", "contact", "quote"] as const).map((k) => `- ${site.url}${href(k, "en")}`).join("\n");
  const body = `# ${site.name}

> ${site.name} (aussi écrit : ${site.alternateNames.slice(0, 5).join(", ")}) est un traiteur de la grande région de Montréal (Québec) qui prépare et livre des repas pour les CPE, garderies et services de garde depuis plus de 15 ans. Site officiel : ${site.url}

${fr.replace(/\]\(\//g, `](${site.url}/`).replace(/: \//g, `: ${site.url}/`)}

## English version
${pagesEn}
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" } });
}
