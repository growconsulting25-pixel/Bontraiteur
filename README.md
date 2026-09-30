# Bon Traiteur

Site public bilingue (FR / EN) de Bon Traiteur — service de repas pour CPE, garderies et services de garde —
préparé pour évoluer vers un portail client (Supabase).

```bash
npm install
cp .env.example .env.local   # facultatif : branchement Supabase
npm run dev                  # http://localhost:3000  (anglais : /en)
npm run build
npm run typecheck
npm run db:seed:generate     # régénère supabase/seed.sql depuis src/data/menu.ts
```

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) : langues, photos, schéma Supabase, sécurité, mise en route.

**Avant la mise en ligne**, remplacer :
- les photos d'illustration Unsplash par de vraies photos (`src/data/media.ts`) ;
- les éléments « [À confirmer] », « Témoignage à venir » et le courriel (`src/i18n/dictionaries/*`, `src/data/site.ts`).
