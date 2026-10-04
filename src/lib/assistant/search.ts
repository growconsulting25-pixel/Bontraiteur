/**
 * Recherche locale, sans IA : trouve la meilleure réponse de la FAQ (ou un plat)
 * à partir de quelques mots. Accents, pluriels et synonymes courants sont tolérés.
 */

const STOP = new Set(
  "a au aux avec ce ces dans de des du en et est il je la le les leur ma mes mon ne nous on ou par pas pour qu que qui sa se ses son sur ta te tes ton tu un une vos votre vous y est-ce comment quoi quel quelle quels quelles est-il puis-je peut peux faire fait the a an and are do does for how i in is it my of on or our the to what when where which who why will with you your can".split(" "),
);

/** Synonymes → mot-clé commun (FR + EN). */
const SYN: Record<string, string> = {
  prix: "prix", cout: "prix", couts: "prix", coute: "prix", combien: "prix", tarif: "prix", tarifs: "prix", price: "prix", cost: "prix", costs: "prix", much: "prix",
  soumission: "soumission", devis: "soumission", quote: "soumission", estimate: "soumission",
  allergie: "allergie", allergies: "allergie", allergene: "allergie", allergenes: "allergie", allergique: "allergie", allergy: "allergie", allergen: "allergie", allergens: "allergie", allergic: "allergie", intolerance: "allergie", restriction: "allergie", restrictions: "allergie",
  urgent: "urgent", urgente: "urgent", urgence: "urgent", rapidement: "urgent", vite: "urgent", emergency: "urgent", rush: "urgent", "48h": "urgent",
  livraison: "livraison", livraisons: "livraison", livrer: "livraison", livrez: "livraison", livre: "livraison", delivery: "livraison", deliver: "livraison", deliveries: "livraison",
  region: "region", regions: "region", zone: "region", zones: "region", secteur: "region", ville: "region", desservez: "region", area: "region", areas: "region", serve: "region",
  menu: "menu", menus: "menu", plat: "menu", plats: "menu", repas: "menu", dish: "menu", dishes: "menu", meal: "menu", meals: "menu",
  modifier: "modifier", changer: "modifier", remplacer: "modifier", modification: "modifier", changement: "modifier", change: "modifier", replace: "modifier", modify: "modifier",
  limite: "delai", delai: "delai", quand: "delai", jusqu: "delai", deadline: "delai", until: "delai",
  contrat: "contrat", abonnement: "contrat", engagement: "contrat", signer: "contrat", contract: "contrat", subscription: "contrat", commitment: "contrat",
  quantite: "quantite", quantites: "quantite", portion: "quantite", portions: "quantite", enfants: "quantite", quantity: "quantite", quantities: "quantite",
  pedagogique: "suspendre", fermeture: "suspendre", conge: "suspendre", ferme: "suspendre", suspendre: "suspendre", annuler: "suspendre", pause: "suspendre", closed: "suspendre", closure: "suspendre", holiday: "suspendre",
  congele: "format", congeles: "format", chaud: "format", chauds: "format", frozen: "format", hot: "format", format: "format", formats: "format", forme: "format",
  facture: "facture", factures: "facture", facturation: "facture", payer: "facture", paiement: "facture", invoice: "facture", invoices: "facture", billing: "facture", payment: "facture",
  ponctuelle: "ponctuelle", ponctuel: "ponctuelle", occasional: "ponctuelle",
};

export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .toLowerCase();

export function keywords(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => SYN[w] ?? SYN[w.replace(/s$/, "")] ?? w.replace(/(s|x)$/, ""));
}

export interface SearchDoc<T> {
  text: string;
  /** Mots à fort poids (la question elle-même). */
  title: string;
  value: T;
}

/** Classe les documents par pertinence (score > 0 seulement). */
export function rank<T>(query: string, docs: SearchDoc<T>[]): Array<{ value: T; score: number }> {
  const q = [...new Set(keywords(query))];
  if (!q.length) return [];
  return docs
    .map((d) => {
      const title = new Set(keywords(d.title));
      const body = new Set(keywords(d.text));
      let score = 0;
      for (const w of q) score += title.has(w) ? 3 : body.has(w) ? 1 : 0;
      return { value: d.value, score: score / Math.sqrt(q.length) };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** Mots trop courants dans les noms de plats pour identifier un plat à eux seuls. */
const GENERIC = new Set(
  "poulet boeuf volaille sauce legumes legume riz pates puree pommes pomme terre avec petit pain maison fruits fruit saison chicken beef poultry vegetables vegetable rice pasta mashed potatoes potato with bun homemade seasonal sur aux the and".split(" "),
);

/**
 * Plat qui correspond le mieux à la requête : nom complet contenu dans la requête,
 * ou mot distinctif (« pesto », « spaghetti », « tourtière ») présent dans le nom.
 */
export function findMeal<T extends { name: string }>(query: string, meals: T[]): T | undefined {
  const q = normalize(query);
  const qWords = new Set(q.split(/[^a-z0-9]+/).filter((w) => w.length > 2));
  let best: { meal: T; hits: number; ratio: number } | undefined;
  for (const m of meals) {
    const name = normalize(m.name);
    if (q.includes(name)) return m;
    const words = name.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));
    const distinct = words.filter((w) => !GENERIC.has(w));
    const hits = distinct.filter((w) => qWords.has(w) || qWords.has(w.replace(/s$/, ""))).length;
    if (!hits) continue;
    const ratio = words.filter((w) => qWords.has(w)).length / words.length;
    if (!best || hits > best.hits || (hits === best.hits && ratio > best.ratio)) best = { meal: m, hits, ratio };
  }
  return best?.meal;
}
