# Bon Traiteur — Architecture

## Stack

- **Next.js 16 (App Router)**, React 19, TypeScript strict
- **Tailwind CSS v4** : tokens de marque dans `src/app/globals.css` (`@theme`)
- **Supabase** (Postgres + RLS) : `@supabase/supabase-js`
- Polices auto-hébergées via `next/font` : Bricolage Grotesque, Hanken Grotesk, Instrument Serif
- Icônes : `lucide-react`. Aucune librairie d'animation.

## Langues (FR / EN)

| | Français | English |
|---|---|---|
| Racine | `/` | `/en` |
| Mise en page racine | `src/app/(fr)/layout.tsx` (`lang="fr-CA"`) | `src/app/(en)/layout.tsx` (`lang="en-CA"`) |
| Slugs | `/nos-repas`, `/garderies`, `/soumission`… | `/en/our-meals`, `/en/daycares`, `/en/quote`… |

- **Tous les textes** : `src/i18n/dictionaries/fr.ts` (référence) et `en.ts`.
  Le type `Dictionary` oblige l'anglais à avoir exactement les mêmes clés.
  Dans les titres, `*texte*` = accent serif italique.
- **Toutes les URL** : `src/i18n/routes.ts` → `href("quote", locale)`.
- Les pages sont écrites une seule fois dans `src/views/*View.tsx` ; les fichiers
  `src/app/(fr)/…/page.tsx` et `src/app/(en)/en/…/page.tsx` ne font que les appeler.
- Le sélecteur de langue renvoie vers la page équivalente ; hreflang et sitemap bilingues.
- 404 globale : `src/app/global-not-found.tsx` (nécessaire avec deux racines).

## Arborescence

```
src/
  app/
    (fr)/(site)/…          Pages publiques FR          (fr)/(auth)/login
    (en)/en/(site)/…       Pages publiques EN          (en)/en/(auth)/login
    global-not-found.tsx  sitemap.ts  robots.ts  icon.svg  globals.css
  views/                   Une vue par page, paramétrée par la langue
  components/
    ui/                    Button, Container, Section, SectionHeading, Badge, Photo, SmartImage, Logo, Reveal, Stamp
    layout/                RootDocument, SiteShell, Navbar, Footer
    cards/                 MealCard, FormatCard, TestimonialCard
    sections/              CTASection, PageHero, home/*
    menu/                  MenuExplorer, MenuFilters
    portal/                MenuPlanner (démo interactive), DashboardPreview
    forms/                 fields, QuoteForm, LoginForm
    support/               SupportWidget (futur assistant IA)
  data/
    menu.ts                Menu local (repli) + source du seed SQL
    media.ts               Registre de TOUTES les photos
    site.ts                Téléphones, courriel
  i18n/                    config, routes, dictionnaires
  lib/
    types.ts               Modèle de domaine
    menu-repository.ts     SEUL point d'accès aux repas (Supabase → repli local)
    actions/quote.ts       Server action : demande de soumission → Supabase
    supabase/              Client serveur + mapping des lignes
    seo.ts                 Métadonnées, hreflang, JSON-LD
supabase/
  migrations/…_initial_schema.sql   Schéma complet + RLS + fonctions RPC
  seed.sql                          Menu (généré : npm run db:seed:generate)
scripts/generate-meals-seed.mts
```

## Photos

`src/data/media.ts` déclare chaque emplacement photo (alt FR/EN, consigne de prise de vue, `src`).
- `src: "/images/xxx.jpg"` → vraie photo (déposer dans `public/images/`).
- URL Unsplash → illustration **temporaire** (nourriture / ingrédients).
- `null` ou image qui ne charge pas → placeholder de marque « Photo à venir ».

Les cartes du menu utilisent `meal.image` (colonne `image_url`) en priorité, sinon une
illustration par catégorie (`categoryIllustrations`).

## Supabase

### Modèle de données

| Table | Rôle |
|---|---|
| `meals` | Source de vérité de chaque plat (FR/EN, catégorie, rotation, allergènes déclarés, formats) |
| `organizations` | Ex. « Organisation ABC » |
| `establishments` | Garderie Laval, Garderie Terrebonne… |
| `memberships` | Utilisateur × organisation × rôle (`owner`, `director`, `admin`, `accounting`, `viewer`), limité à certains établissements si besoin |
| `staff_members` | Équipe interne Bon Traiteur (back-office) |
| `monthly_menus`, `menu_days` | Menu du mois par établissement, date limite de modification, repas d'origine conservé si remplacé |
| `orders`, `order_items` | Commandes régulières, ponctuelles, urgentes ; portions par format |
| `deliveries` | Planifiée / en route / livrée / suspendue |
| `invoices` | Numéro (BT-1094), montant, statut, PDF (Storage), référence Stripe/Moneris |
| `quote_requests` | Demandes de soumission du site |

### Sécurité (RLS sur toutes les tables)

- **Public** : lit les plats offerts ; peut *déposer* une soumission (jamais la relire).
- **Clients** : ne voient que les données de leurs organisations / établissements ;
  factures visibles pour `owner`, `director`, `accounting` seulement.
- **Équipe** (`staff_members`) : accès complet pour le futur back-office.
- Les clients ne modifient pas les menus directement : ils passent par des fonctions
  qui vérifient rôle, date limite et validité du repas :
  - `confirm_monthly_menu(menu_id)` — « Garder mon menu »
  - `replace_menu_meal(menu_day_id, meal_id)` — « Remplacer » (refusé après la date limite)
  Ces fonctions serviront aussi d'outils à l'assistant IA (function calling).

Le schéma, le seed et ces règles ont été validés sur Postgres (PGlite) : isolation entre
organisations, refus anonymes, contraintes de la table des soumissions.

### Projet en production

| | |
|---|---|
| Projet Supabase | **Bon Traiteur** — `daboizmggbbyzgjpwioy` (organisation « growmedia ») |
| Région | `ca-central-1` (Montréal) |
| URL | `https://daboizmggbbyzgjpwioy.supabase.co` |
| Migrations appliquées | `initial_schema`, `private_auth_helpers`, `foreign_key_indexes` |
| Données | 40 plats (`supabase/seed.sql`) |

Variables à définir sur l'hébergeur (et dans `.env.local` en local) :

```
NEXT_PUBLIC_SUPABASE_URL=https://daboizmggbbyzgjpwioy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé « publishable » : Supabase → Settings → API Keys>
```

La clé publishable est faite pour être publique : la sécurité repose sur les politiques RLS.
Ne jamais mettre la clé `service_role` / secrète dans le site.

Les fonctions d'autorisation internes (`is_staff`, `has_org_role`, `can_access_establishment`)
sont dans le schéma `private`, non exposé par l'API.

### Mettre à jour le menu

Tant que le back-office n'existe pas : modifier `src/data/menu.ts`, lancer
`npm run db:seed:generate`, puis exécuter `supabase/seed.sql` dans le SQL Editor
(idempotent : met à jour les plats existants par slug).
Ou directement dans Supabase → Table Editor → `meals` (ex. ajouter `image_url`).

Sans ces variables, le site fonctionne avec les données locales et le formulaire bascule
sur le courriel.

### Prochaines étapes

1. Notification courriel à l'équipe à chaque soumission (Resend / Postmark).
2. Supabase Auth (`@supabase/ssr`) : connexion par courriel / lien magique sur `/login`.
3. Portail `(portal)` : Accueil, Mon menu (reprend `MenuPlanner` branché sur les RPC), Commandes, Livraisons, Factures.
4. Back-office `(admin)` pour l'équipe : menus du mois, production, livraisons, factures.
5. Paiement (Stripe ou Moneris), SMS, assistant IA.
