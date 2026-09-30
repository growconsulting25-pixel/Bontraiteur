# Bon Traiteur — Architecture

## Stack

- **Next.js 16 (App Router)**, React 19, TypeScript strict
- **Tailwind CSS v4** : tous les tokens de marque sont dans `src/app/globals.css` (`@theme`)
- Polices via `next/font` (auto-hébergées, aucune requête à Google au runtime) :
  Bricolage Grotesque (titres), Hanken Grotesk (texte), Instrument Serif (accents italiques)
- Dépendance UI unique : `lucide-react` (icônes, tree-shaken). Pas de librairie d'animation.

## Arborescence

```
src/
  app/
    (site)/            Site public — layout avec Navbar, Footer, SupportWidget
      page.tsx         Accueil
      menu/  nos-repas/  garderies/  comment-ca-fonctionne/
      a-propos/  faq/  contact/  soumission/
    (auth)/login/      Connexion (sans navigation du site)
    (portal)/          ← FUTUR portail client (Mon menu, Commandes, Livraisons, Factures…)
    (admin)/           ← FUTUR back-office interne
    sitemap.ts  robots.ts  icon.svg  not-found.tsx
  components/
    ui/                Primitives : Button, Container, Section, SectionHeading, Badge, Photo, Logo, Reveal, Stamp
    layout/            Navbar, Footer
    cards/             MealCard, FormatCard, FeatureCard, TestimonialCard
    sections/          Sections réutilisables (CTASection, PageHero) + home/*
    menu/              MenuExplorer, MenuFilters
    portal/            Aperçus du portail : MenuPlanner (interactif), DashboardPreview
    forms/             Champs de formulaire, QuoteForm
    support/           SupportWidget (futur assistant IA)
  data/                Contenu et données locales (remplaçables)
    menu.ts            ← Menu complet (source : Google Sheets)
    media.ts           ← Registre de TOUTES les photos du site
    site.ts            Coordonnées, navigation
    content.ts  offers.ts  faq.ts
  lib/
    types.ts           Modèle de domaine (Meal, Organization, Establishment, MonthlyMenu, rôles…)
    menu-repository.ts ← SEUL point d'accès aux repas (à brancher sur Supabase)
    seo.ts             Métadonnées + JSON-LD (Organization/LocalBusiness, Service, FAQPage)
    quote.ts           Demande de soumission (V1 : mailto ; V2 : server action)
```

## Règles

1. **Aucune donnée en dur dans les composants.** Les textes réutilisés sont dans `src/data/*`,
   les repas passent par `src/lib/menu-repository.ts`.
2. **Photos** : tout emplacement est déclaré dans `src/data/media.ts`. Mettre une vraie photo =
   déposer le fichier dans `public/images/` et renseigner `src`. Le composant `<Photo>` bascule
   automatiquement du placeholder vers `next/image` optimisée.
3. **Allergènes** : jamais présentés comme une garantie. `allergensVerified: false` partout
   tant que l'équipe n'a pas validé. Le disclaimer accompagne chaque affichage du menu.
4. **Placeholders** : identifiés visuellement (« Photo à venir », « Témoignage à venir — exemple »,
   « [À confirmer] ») et dans le code (`// PLACEHOLDER`).

## Passage à Supabase (phase suivante)

Tables proposées (1:1 avec `src/lib/types.ts`) :

| Table | Rôle |
|---|---|
| `meals` | Source de vérité unique de chaque plat |
| `organizations` | Ex. « Organisation ABC » |
| `establishments` | Garderie Laval, Garderie Terrebonne… (`organization_id`) |
| `memberships` | `user_id`, `organization_id`, `role` (owner, director, admin, accounting, viewer), `establishment_ids` |
| `monthly_menus` + `menu_days` | Menu du mois par établissement, statut, date limite (≈ 2 semaines avant) |
| `orders`, `order_items` | Commandes régulières, ponctuelles, urgentes, portions ajoutées |
| `deliveries` | Planifiée / en route / livrée / suspendue |
| `invoices` | Paiement Stripe ou Moneris |
| `quote_requests` | Demandes de soumission du site |

Sécurité : Row Level Security par `organization_id` via `memberships`.

Étapes :
1. `menu-repository.ts` : remplacer la lecture locale par `supabase.from("meals")` (les composants ne changent pas).
2. `lib/quote.ts` : server action → `quote_requests` + courriel transactionnel.
3. `(auth)/login` : Supabase Auth (mot de passe ou lien magique).
4. `(portal)` : reprendre `MenuPlanner` et `DashboardPreview` comme base des écrans « Mon menu » et « Accueil ».
5. Assistant : `SupportWidget` → conversation IA avec function calling sur des server actions
   (`replaceMeal`, `addPortions`, `suspendDelivery`, `getInvoiceStatus`), confirmation obligatoire avant toute action importante.

## Anglais (phase 2)

Le site est en français (fr-CA). Pour l'anglais : `next-intl` ou dictionnaires maison, routes
`/en/...`, et migration des textes de `src/data/*` vers des fichiers `fr.ts` / `en.ts`.
Les contenus sont déjà centralisés pour faciliter cette étape.
