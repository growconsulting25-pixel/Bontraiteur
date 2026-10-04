import "server-only";
import { getMeals } from "@/lib/menu-repository";
import { mealName } from "@/lib/meal-name";
import { menuFilterOrder } from "@/data/menu";
import { site } from "@/data/site";
import { getDictionary, href, type Locale } from "@/i18n";
import type { MealCategory } from "@/lib/types";

/** Retire le balisage *accent* des dictionnaires. */
const plain = (s: string) => s.replace(/\*/g, "");

/**
 * Connaissances de l'assistant, construites à partir du contenu RÉEL du site
 * (dictionnaires + menu). Rien d'autre : l'assistant ne doit rien inventer.
 */
export async function siteKnowledge(locale: Locale) {
  const d = getDictionary(locale);
  const meals = await getMeals();
  const t = d.menu;

  const menu = menuFilterOrder
    .filter((c): c is MealCategory => c !== "tous")
    .map((c) => {
      const items = meals
        .filter((m) => m.category === c)
        .map((m) => {
          const tags = [
            m.rotationType === "ponctuelle" ? t.rotations.ponctuelle : "",
            m.allergens.length ? `${t.allergensDeclared} ${m.allergens.map((a) => t.allergens[a]).join(", ")}` : "",
          ].filter(Boolean);
          return `  - ${mealName(m, locale)}${tags.length ? ` (${tags.join(" ; ")})` : ""}`;
        });
      return items.length ? `${t.categories[c]} :\n${items.join("\n")}` : "";
    })
    .filter(Boolean)
    .join("\n");

  const pages = (
    [
      ["home", d.nav.items.find((i) => i.key === "home")?.label],
      ["menu", "Menu complet / full menu (+ PDF)"],
      ["meals", d.nav.items.find((i) => i.key === "meals")?.label],
      ["daycares", d.meta.daycares.title],
      ["howItWorks", d.howPage.eyebrow],
      ["about", d.aboutPage.eyebrow],
      ["faq", "FAQ"],
      ["contact", d.contactPage.eyebrow],
      ["quote", d.nav.quote],
      ["login", d.nav.loginLong],
    ] as const
  )
    .map(([k, label]) => `- ${label} : ${href(k, locale)}`)
    .join("\n");

  return `# ${site.name}
${d.aboutPage.lead}
${d.aboutPage.story.join("\n")}
Clientèle (exclusivement) : ${d.meta.audienceType}.

## Contact
Téléphones : ${site.contact.phones.map((p) => p.display).join(" ou ")}
Courriel : ${site.contact.email}
Heures : ${d.contact.hours}
Aucune adresse civique publiée.

## Formats de repas
${d.formats.map((f) => `- ${f.title} : ${f.summary} ${f.details.join(". ")}.`).join("\n")}

## Façons de commander
${d.serviceModes.map((m) => `- ${m.title} : ${m.summary}`).join("\n")}

## Comment ça fonctionne
${d.howPage.steps.map((s) => `${s.step}. ${s.title} — ${s.text}`).join("\n")}
${d.howPage.flexibility.map((f) => `- ${f.q} ${f.a}`).join("\n")}

## Menu
${t.monthlyTitle} : ${t.monthlyNote}
${t.occasionalTitle} : ${t.occasionalNote}
Chaque jour : collation AM, repas + dessert, collation PM.
${menu}
${t.allergenDisclaimer}

## FAQ
${d.faqPage.items.map((i) => `Q : ${i.question}\nR : ${i.answer}`).join("\n")}

## Soumission
${plain(d.quotePage.lead)}
${d.quotePage.next.map((n) => `- ${n.title} : ${n.text}`).join("\n")}
${d.quotePage.form.noCommitment}

## Pages du site (liens utilisables)
${pages}`;
}

/** Règles communes aux deux assistants. */
export const commonRules = (locale: Locale) => `
Règles :
- Réponds dans la langue de la personne (par défaut : ${locale === "en" ? "anglais" : "français québécois, vouvoiement"}).
- Réponses courtes et chaleureuses : 1 à 4 phrases, ou une petite liste. Pas de longs paragraphes.
- N'invente JAMAIS d'information (prix, zones de livraison, délais, ingrédients, allergènes, statistiques). Si l'information n'est pas dans tes connaissances ou si elle est marquée « [À confirmer] », dis que l'équipe pourra le confirmer et donne les numéros de téléphone.
- Allergies : rappelle que les allergènes sont indiqués à titre informatif et doivent être confirmés avec l'équipe. Ne dis jamais qu'un plat est « sans » un allergène.
- Pour les liens, utilise le format Markdown [texte](/chemin) avec UNIQUEMENT les chemins listés. Pour appeler : [+1 438-938-3035](tel:+14389383035).
- Gras permis avec **texte**. Pas de titres, pas de tableaux, pas d'emojis.
- Reste dans ton rôle (Bon Traiteur, repas pour milieux de garde). Refuse poliment les sujets sans lien.`;
