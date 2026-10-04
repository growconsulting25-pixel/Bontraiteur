# Bon Traiteur — Structure SEO, AEO et GEO

> Objectif n° 1 : sortir **premier** sur « Bon Traiteur » (et ses fautes : Bon traiteur, Bontraiteur,
> Bon Traitteur, Bon Traiter…). Objectif n° 2 : la première page sur « traiteur garderie Montréal »,
> « repas pour garderie », « traiteur CPE ».

## 0. Indexation : l'interrupteur

Le site est **fermé aux moteurs** tant que la variable Netlify `SITE_INDEXABLE` n'est pas `true`
(robots.txt `Disallow: /` + balise `noindex` sur chaque page). Les aperçus Netlify ne sont jamais indexés.

Le jour J : Netlify → Site configuration → Environment variables → `SITE_INDEXABLE = true` → redéployer.
Le robots.txt s'ouvre (sauf portail, back-office, connexion, API) et le sitemap (18 pages FR/EN) est annoncé.

## 1. Structure par page (FR — l'anglais suit la même logique)

| Page | Slug | Titre SEO (≤ 60) | Mot-clé principal | H1 (surtitre + titre) | Données structurées |
|---|---|---|---|---|---|
| Accueil | `/` | Bon Traiteur \| Traiteur pour CPE et garderies à Montréal | **Bon Traiteur** + traiteur garderie Montréal | Bon Traiteur · Traiteur pour CPE et garderies — Des repas qui plaisent aux enfants… | Organization + LocalBusiness, WebSite |
| Menu | `/menu` | Menu pour garderies et CPE \| Bon Traiteur | menu garderie | Menu pour garderies et CPE — Le menu. Et toutes vos alternatives. | Menu (40 plats par section), BreadcrumbList |
| Nos repas | `/nos-repas` | Repas chauds et congelés pour garderies \| Bon Traiteur | repas pour garderie | Repas pour garderies — Des repas simples, bons… | Service + OfferCatalog (3 formats), BreadcrumbList |
| Garderies | `/garderies` | Service de repas pour CPE et garderies \| Bon Traiteur | service de repas CPE | Service de repas pour CPE et garderies — Le service de repas qui s'adapte… | Service, BreadcrumbList |
| Comment ça fonctionne | `/comment-ca-fonctionne` | Comment fonctionne notre service de repas \| Bon Traiteur | commande repas garderie | Comment fonctionne notre service — Quatre étapes… | HowTo (4 étapes), BreadcrumbList |
| À propos | `/a-propos` | À propos de Bon Traiteur, traiteur pour garderies | **Bon Traiteur** | À propos de Bon Traiteur — Plus de 15 ans à nourrir des enfants… | BreadcrumbList |
| FAQ | `/faq` | FAQ : repas pour garderies et CPE \| Bon Traiteur | questions traiteur garderie | FAQ · Repas pour garderies — Vos questions… | FAQPage (dont « Qu'est-ce que Bon Traiteur? »), BreadcrumbList |
| Contact | `/contact` | Joindre Bon Traiteur, traiteur pour garderies | Bon Traiteur téléphone | Joindre Bon Traiteur — Une question? Parlons-en. | BreadcrumbList |
| Soumission | `/soumission` | Soumission repas pour garderie et CPE \| Bon Traiteur | soumission traiteur garderie | Soumission repas pour garderie — Parlez-nous de votre garderie. | BreadcrumbList |

Anglais : `/en`, `/en/menu`, `/en/our-meals`, `/en/daycares`, `/en/how-it-works`, `/en/about`, `/en/faq`, `/en/contact`, `/en/quote`
(titres et mots-clés : `daycare caterer Montreal`, `daycare menu`, `daycare meals`, `CPE meal service`…).

Où modifier :
- titres et méta-descriptions : `src/i18n/dictionaries/{fr,en}.ts` → `meta` ;
- mots-clés par page : `src/lib/seo.ts` → `pageKeywords` ;
- surtitres (partie du H1) : `eyebrow` de chaque page dans les dictionnaires ;
- variantes du nom, heures, région, réseaux sociaux : `src/data/site.ts` (`alternateNames`, `hours`, `areaServed`, `sameAs`).

Chaque page a : 1 seul H1 avec le mot-clé, des H2 par section, une méta-description de 120 à 160 caractères,
un canonical, les liens hreflang FR/EN, une image de partage (`/og-bon-traiteur.jpg`, 1200 × 630).

## 2. La marque « Bon Traiteur » (et les fautes)

- `WebSite` + `Organization` déclarent `name: "Bon Traiteur"` et `alternateName` : Bon traiteur, Bontraiteur,
  Bon-Traiteur, Bon Traitteur, Bon Traiter, Bon Traiteur Montréal, Bon Traiteur garderie, Bon Traiteur CPE.
- Le nom est au début du titre de l'accueil, dans le H1 de l'accueil, de « À propos » et de « Contact »,
  dans chaque méta-description et dans la FAQ (« Qu'est-ce que Bon Traiteur? »).
- Google corrige déjà seul les fautes de frappe courantes (« Bon traiter » → « Bon Traiteur ») : ce qui
  compte est que Google relie fortement le nom au domaine (voir plan ci-dessous : fiche Google, citations).

## 3. AEO / GEO (moteurs de réponse et IA)

- FAQ structurée (`FAQPage`) avec réponses courtes et directes, dont l'identité de l'entreprise, la région et les heures.
- `HowTo`, `Menu`, `Service` : des faits structurés que les IA reprennent.
- `/llms.txt` : résumé factuel du site pour ChatGPT, Perplexity, Gemini, Copilot (généré à partir du contenu réel).
- Aucune information inventée (ni prix, ni note, ni adresse) : les IA citent ce qui est vérifiable.

## 4. Plan pour la première page (semaines 0 à 8)

**Semaine 0 — le jour de la mise en ligne**
1. Brancher le domaine `bontraiteur.com` sur Netlify (le site déclare déjà ce domaine comme officiel).
2. `SITE_INDEXABLE=true`, redéployer.
3. Google Search Console : ajouter le domaine, soumettre `sitemap.xml`, demander l'indexation de l'accueil.
4. Bing Webmaster Tools : importer depuis Search Console (Bing alimente ChatGPT et Copilot).

**Semaine 1 — le levier n° 1 : la fiche Google (Google Business Profile)**
5. Créer la fiche « Bon Traiteur » : catégorie « Traiteur », zone desservie = grande région de Montréal
   (sans afficher d'adresse), téléphones, heures 5 h – 17 h, site web, photos (les mêmes que le site).
6. Demander aux 3 directions (et aux autres clients) un avis Google. 5 à 10 avis = énorme pour une recherche de marque.

**Semaines 1 à 3 — les citations (même nom, même téléphone partout)**
7. Facebook, Instagram, LinkedIn (page entreprise), Pages Jaunes, Yelp, 411.ca, Apple Plans (Business Connect).
8. Ajouter chaque lien de profil dans `site.sameAs` (src/data/site.ts) : Google relie alors tous ces profils au site.

**Semaines 2 à 8 — la recherche « non marque »**
9. Pages locales : « Traiteur pour garderies à Laval », « … Longueuil », « … Rive-Nord » (une page par secteur réellement desservi).
10. 1 à 2 articles par mois répondant aux questions des directions (ex. : « Comment gérer les allergies au dîner en CPE »,
    « Repas congelés en garderie : ce qu'il faut savoir »).
11. Liens de qualité : associations de garderies, regroupements de CPE, partenaires, fournisseurs.

**Attentes réalistes**
- « Bon Traiteur » (marque) : 1re position visée en 2 à 6 semaines après l'indexation, à condition d'avoir la fiche Google
  et les citations. Attention : d'autres entreprises portent un nom proche ; la fiche Google et les avis font la différence.
- « traiteur garderie Montréal » et autres requêtes générales : 1re page possible en 2 à 4 mois selon la concurrence.
  Personne ne peut garantir une position ; ce plan maximise les chances.
