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

## Portail client (`/portail`, `/en/portal`)

Accès : comptes créés par l'équipe (pas d'inscription libre). Connexion par mot de passe
ou lien magique (`/login`). Session gérée par `@supabase/ssr` ; `src/proxy.ts` protège
`/portail`, `/en/portal` et `/admin`.

| Page | Contenu |
|---|---|
| Accueil | Prochaine livraison, état du menu du mois, prochaine action, dernière facture |
| Mon menu | Garder le menu (1 clic) ou remplacer un repas — jusqu'à la date limite |
| Commandes | Commandes ponctuelles / urgentes (lignes repas × format × portions), annulation |
| Livraisons | À venir / passées, suspension (journée pédagogique, fermeture) |
| Factures | Liste, PDF, **paiement en ligne Stripe** (direction et comptabilité seulement) |
| Documents | Fichiers partagés par l'équipe (Storage privé) |
| Support | Message à l'équipe + historique |
| Mon compte | Rôle, organisation, changement de mot de passe |

Multi-sites : un utilisateur rattaché à plusieurs établissements choisit l'établissement
actif (cookie `bt_establishment`). Rôles : `owner`, `director`, `admin` agissent ;
`accounting` voit les factures ; `viewer` consulte.

Toutes les règles métier sont dans la base (RLS + fonctions) : `confirm_monthly_menu`,
`replace_menu_meal` (un changement après confirmation remet le menu « à confirmer »),
`cancel_order`, `pause_delivery`.

## Back-office (`/admin`, équipe seulement)

Tableau de bord · Soumissions (→ « Créer le client ») · Clients (établissements, invitations,
rôles, documents) · Menus (générer la proposition du mois pour un ou tous les établissements,
ajuster, publier avec avis courriel, planifier les livraisons) · Commandes · Livraisons ·
Factures (numéro auto BT-1001…, PDF, statut) · Repas (source de vérité du site public :
photo, formats, allergènes validés) · Support.

## Paiement (Stripe)

`src/lib/actions/payments.ts` crée une session Stripe Checkout (montant lu en base, jamais
depuis le navigateur). `src/app/api/stripe/webhook/route.ts` vérifie la signature et marque
la facture « payée » (idempotent). Moneris reste possible plus tard au même endroit.

## Configuration à faire (une seule fois)

1. **Variables** : voir `.env.example` — à ajouter dans Netlify → Project configuration →
   Environment variables. Les deux variables Supabase publiques y sont déjà.
2. **Supabase → Authentication → URL Configuration**
   - Site URL : `https://bon-traiteur.netlify.app` (puis le domaine final)
   - Redirect URLs : `https://bon-traiteur.netlify.app/auth/callback` (+ `http://localhost:3000/auth/callback`)
3. **Supabase → Authentication → Sign In / Providers → Email** : laisser activé ;
   désactiver « Allow new users to sign up » (les comptes sont créés par invitation).
4. **Premier administrateur** : Supabase → Authentication → Users → *Invite user* (votre courriel),
   puis dans le SQL Editor :
   ```sql
   insert into public.staff_members (user_id, role)
   select id, 'admin' from auth.users where email = 'VOTRE@COURRIEL';
   ```
5. **Stripe** : clé secrète (mode test d'abord) + webhook vers `/api/stripe/webhook`
   (événements `checkout.session.completed`, `checkout.session.async_payment_succeeded`).
6. **Courriels** : compte Resend + domaine vérifié, puis `RESEND_API_KEY`, `EMAIL_FROM`,
   `TEAM_NOTIFICATION_EMAIL`. Les courriels d'authentification (invitation, lien magique)
   se personnalisent dans Supabase → Authentication → Email Templates (et SMTP personnalisé).

### Prochaines étapes

1. Assistant IA branché sur les mêmes fonctions (remplacer un repas, suspendre une livraison…).
2. Génération automatique des factures à partir des livraisons.
3. SMS (rappels de confirmation de menu).

## Assistant virtuel

Deux assistants partagent le même widget (`src/components/assistant/ChatWidget.tsx`) :

- **Site public** (`POST /api/assistant/site`) : répond aux questions à partir du contenu réel du site
  (dictionnaires + menu, `src/lib/assistant/knowledge.ts`) et guide vers les bonnes pages. Aucun outil, aucune donnée client.
- **Portail** (`POST /api/assistant/portal`) : connecté au compte via la session (RLS). Outils de lecture
  (menu, commandes, livraisons, factures selon le rôle) et outils `propose_*` qui **préparent** une action.
  Le widget affiche une carte « Confirmer / Annuler » ; l'action n'est exécutée qu'au clic, par
  `POST /api/assistant/portal/execute`, qui revérifie tout (rôle, appartenance, date limite via les RPC).
  `propose_contact_team` crée une demande de support et avise l'équipe par courriel.

Variables : `ANTHROPIC_API_KEY` (sans clé : le widget propose les numéros de téléphone), `ASSISTANT_MODEL` (optionnelle).
Garde-fous : historique borné, limite de débit par IP / utilisateur, liens limités aux pages du site, `tel:` et `mailto:`.
