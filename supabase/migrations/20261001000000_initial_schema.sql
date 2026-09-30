-- =============================================================================
-- BON TRAITEUR — Schéma initial
--
-- Une seule source de vérité pour chaque plat, chaque menu, chaque commande.
-- Multi-organisations : une organisation regroupe plusieurs établissements
-- (garderies) et plusieurs utilisateurs avec des rôles.
--
-- Sécurité : Row Level Security activée sur TOUTES les tables.
--   - Public (anon)   : lecture du menu + dépôt d'une demande de soumission.
--   - Clients         : accès aux données de LEURS organisations seulement.
--   - Équipe interne  : accès complet (table staff_members), pour le back-office.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Types énumérés
-- -----------------------------------------------------------------------------
create type public.meal_category as enum (
  'volaille', 'boeuf', 'pates', 'poisson', 'vegetarien', 'autres', 'desserts', 'collations'
);
create type public.meal_type as enum ('repas', 'dessert', 'collation');
create type public.rotation_type as enum ('mensuelle', 'ponctuelle');
create type public.meal_status as enum ('disponible', 'indisponible', 'saisonnier');
create type public.allergen as enum ('lait', 'oeufs', 'poisson');
create type public.meal_format as enum ('chaud', 'pret_a_manger', 'congele');

create type public.member_role as enum ('owner', 'director', 'admin', 'accounting', 'viewer');
create type public.establishment_kind as enum (
  'cpe', 'garderie_subventionnee', 'garderie_privee', 'service_de_garde', 'autre'
);

create type public.monthly_menu_status as enum ('brouillon', 'publie', 'confirme', 'modifie');
create type public.order_kind as enum ('reguliere', 'ponctuelle', 'urgente');
create type public.order_status as enum ('brouillon', 'soumise', 'confirmee', 'annulee', 'livree');
create type public.delivery_status as enum ('planifiee', 'en_route', 'livree', 'suspendue', 'annulee');
create type public.invoice_status as enum ('brouillon', 'a_payer', 'payee', 'en_retard', 'annulee');
create type public.quote_status as enum ('nouvelle', 'en_cours', 'convertie', 'fermee', 'spam');
create type public.locale as enum ('fr', 'en');

-- -----------------------------------------------------------------------------
-- Utilitaire : updated_at automatique
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- CATALOGUE
-- =============================================================================
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  -- Libellé exact de la feuille Google Sheets d'origine (traçabilité)
  source_name text,
  category public.meal_category not null,
  meal_type public.meal_type not null,
  rotation_type public.rotation_type,
  description_fr text not null default '',
  description_en text not null default '',
  -- Allergènes DÉCLARÉS. Jamais une garantie : voir allergens_verified.
  allergens public.allergen[] not null default '{}',
  allergens_verified boolean not null default false,
  status public.meal_status not null default 'disponible',
  image_url text,
  -- null = pas encore confirmé par l'équipe
  available_hot boolean,
  available_frozen boolean,
  available_ready_to_eat boolean,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index meals_category_idx on public.meals (category, sort_order);
create trigger meals_updated_at before update on public.meals
  for each row execute function public.set_updated_at();

-- =============================================================================
-- CLIENTS : organisations, établissements, membres
-- =============================================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  preferred_locale public.locale not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

create table public.establishments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  kind public.establishment_kind not null default 'cpe',
  address text,
  city text,
  children_count integer check (children_count is null or children_count >= 0),
  delivery_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index establishments_org_idx on public.establishments (organization_id);
create trigger establishments_updated_at before update on public.establishments
  for each row execute function public.set_updated_at();

create table public.memberships (
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role public.member_role not null default 'viewer',
  -- Vide = accès à tous les établissements de l'organisation
  establishment_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);
create index memberships_org_idx on public.memberships (organization_id);

-- Équipe interne Bon Traiteur (back-office)
create table public.staff_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  created_at timestamptz not null default now()
);

-- =============================================================================
-- MENUS MENSUELS
-- =============================================================================
create table public.monthly_menus (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments (id) on delete cascade,
  month date not null check (extract(day from month) = 1), -- premier jour du mois
  status public.monthly_menu_status not null default 'brouillon',
  -- Normalement 2 semaines avant la période concernée
  change_deadline date not null,
  published_at timestamptz,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (establishment_id, month)
);
create trigger monthly_menus_updated_at before update on public.monthly_menus
  for each row execute function public.set_updated_at();

create table public.menu_days (
  id uuid primary key default gen_random_uuid(),
  monthly_menu_id uuid not null references public.monthly_menus (id) on delete cascade,
  date date not null,
  meal_id uuid not null references public.meals (id),
  dessert_id uuid references public.meals (id),
  snack_ids uuid[] not null default '{}',
  -- Repas proposé à l'origine, si le client l'a remplacé
  original_meal_id uuid references public.meals (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (monthly_menu_id, date)
);
create index menu_days_menu_idx on public.menu_days (monthly_menu_id);
create trigger menu_days_updated_at before update on public.menu_days
  for each row execute function public.set_updated_at();

-- =============================================================================
-- COMMANDES, LIVRAISONS, FACTURES
-- =============================================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments (id) on delete cascade,
  kind public.order_kind not null default 'ponctuelle',
  status public.order_status not null default 'soumise',
  delivery_date date not null,
  notes text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_establishment_idx on public.orders (establishment_id, delivery_date);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  meal_id uuid not null references public.meals (id),
  format public.meal_format not null,
  portions integer not null check (portions > 0)
);
create index order_items_order_idx on public.order_items (order_id);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  scheduled_for date not null,
  time_window text,
  status public.delivery_status not null default 'planifiee',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index deliveries_establishment_idx on public.deliveries (establishment_id, scheduled_for);
create trigger deliveries_updated_at before update on public.deliveries
  for each row execute function public.set_updated_at();

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  establishment_id uuid references public.establishments (id) on delete set null,
  number text not null unique, -- ex. BT-1094
  period_start date,
  period_end date,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'CAD',
  status public.invoice_status not null default 'brouillon',
  due_date date,
  paid_at timestamptz,
  -- Chemin dans Supabase Storage (bucket privé « invoices »)
  pdf_path text,
  -- Référence du fournisseur de paiement (Stripe ou Moneris)
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invoices_org_idx on public.invoices (organization_id);
create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

-- =============================================================================
-- SITE PUBLIC : demandes de soumission
-- =============================================================================
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  locale public.locale not null default 'fr',
  establishment_name text not null check (char_length(establishment_name) between 1 and 160),
  establishment_type text not null check (char_length(establishment_type) <= 80),
  contact_name text not null check (char_length(contact_name) between 1 and 120),
  role text check (char_length(role) <= 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  phone text not null check (char_length(phone) between 7 and 40),
  city text not null check (char_length(city) <= 120),
  children_count integer check (children_count is null or children_count between 0 and 10000),
  frequency text not null check (char_length(frequency) <= 80),
  formats text[] not null default '{}' check (cardinality(formats) <= 10),
  start_month text check (char_length(start_month) <= 20),
  restrictions text check (char_length(restrictions) <= 500),
  message text check (char_length(message) <= 3000),
  status public.quote_status not null default 'nouvelle',
  created_at timestamptz not null default now()
);
create index quote_requests_created_idx on public.quote_requests (created_at desc);

-- =============================================================================
-- FONCTIONS D'AUTORISATION (utilisées par les politiques RLS)
-- security definer : évitent la récursion RLS sur memberships.
-- =============================================================================
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff_members where user_id = (select auth.uid()));
$$;

create or replace function public.has_org_role(org_id uuid, roles public.member_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = org_id
      and m.user_id = (select auth.uid())
      and (roles is null or m.role = any (roles))
  );
$$;

create or replace function public.can_access_establishment(est_id uuid, roles public.member_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.establishments e
    join public.memberships m on m.organization_id = e.organization_id
    where e.id = est_id
      and m.user_id = (select auth.uid())
      and (cardinality(m.establishment_ids) = 0 or e.id = any (m.establishment_ids))
      and (roles is null or m.role = any (roles))
  );
$$;

revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.has_org_role(uuid, public.member_role[]) from public, anon;
revoke execute on function public.can_access_establishment(uuid, public.member_role[]) from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.has_org_role(uuid, public.member_role[]) to authenticated;
grant execute on function public.can_access_establishment(uuid, public.member_role[]) to authenticated;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.meals enable row level security;
alter table public.organizations enable row level security;
alter table public.establishments enable row level security;
alter table public.memberships enable row level security;
alter table public.staff_members enable row level security;
alter table public.monthly_menus enable row level security;
alter table public.menu_days enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.deliveries enable row level security;
alter table public.invoices enable row level security;
alter table public.quote_requests enable row level security;

-- ---------- Menu : lecture publique des plats offerts ----------
create policy "Menu visible publiquement" on public.meals
  for select to anon, authenticated
  using (status <> 'indisponible');
create policy "Équipe gère le menu" on public.meals
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- Soumissions : dépôt public, lecture équipe seulement ----------
create policy "Tout le monde peut demander une soumission" on public.quote_requests
  for insert to anon, authenticated
  with check (status = 'nouvelle');
create policy "Équipe gère les soumissions" on public.quote_requests
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- Organisations ----------
create policy "Membres voient leur organisation" on public.organizations
  for select to authenticated
  using ((select public.has_org_role(id)) or (select public.is_staff()));
create policy "Owner modifie son organisation" on public.organizations
  for update to authenticated
  using ((select public.has_org_role(id, array['owner']::public.member_role[])))
  with check ((select public.has_org_role(id, array['owner']::public.member_role[])));
create policy "Équipe gère les organisations" on public.organizations
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- Établissements ----------
create policy "Membres voient leurs établissements" on public.establishments
  for select to authenticated
  using ((select public.can_access_establishment(id)) or (select public.is_staff()));
create policy "Owner/direction modifient leurs établissements" on public.establishments
  for update to authenticated
  using ((select public.can_access_establishment(id, array['owner', 'director']::public.member_role[])))
  with check ((select public.can_access_establishment(id, array['owner', 'director']::public.member_role[])));
create policy "Équipe gère les établissements" on public.establishments
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- Membres ----------
create policy "Chacun voit ses adhésions" on public.memberships
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.has_org_role(organization_id, array['owner']::public.member_role[])) or (select public.is_staff()));
create policy "Owner gère les membres" on public.memberships
  for all to authenticated
  using ((select public.has_org_role(organization_id, array['owner']::public.member_role[])) or (select public.is_staff()))
  with check ((select public.has_org_role(organization_id, array['owner']::public.member_role[])) or (select public.is_staff()));

-- ---------- Équipe interne ----------
create policy "Équipe voit l'équipe" on public.staff_members
  for select to authenticated
  using ((select public.is_staff()));

-- ---------- Menus mensuels ----------
create policy "Membres voient leurs menus publiés" on public.monthly_menus
  for select to authenticated
  using (((select public.can_access_establishment(establishment_id)) and status <> 'brouillon') or (select public.is_staff()));
create policy "Équipe gère les menus" on public.monthly_menus
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "Membres voient les jours de leurs menus" on public.menu_days
  for select to authenticated
  using (exists (
    select 1 from public.monthly_menus mm
    where mm.id = monthly_menu_id and mm.status <> 'brouillon'
      and (select public.can_access_establishment(mm.establishment_id))
  ) or (select public.is_staff()));
create policy "Équipe gère les jours de menu" on public.menu_days
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- Commandes ----------
create policy "Membres voient leurs commandes" on public.orders
  for select to authenticated
  using ((select public.can_access_establishment(establishment_id)) or (select public.is_staff()));
create policy "Direction passe des commandes" on public.orders
  for insert to authenticated
  with check (
    (select public.can_access_establishment(establishment_id, array['owner', 'director', 'admin']::public.member_role[]))
    and status in ('brouillon', 'soumise')
    and created_by = (select auth.uid())
  );
create policy "Équipe gère les commandes" on public.orders
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "Membres voient les lignes de commande" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o where o.id = order_id and (select public.can_access_establishment(o.establishment_id))
  ) or (select public.is_staff()));
create policy "Direction ajoute des lignes à ses commandes" on public.order_items
  for insert to authenticated
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and o.status in ('brouillon', 'soumise')
      and (select public.can_access_establishment(o.establishment_id, array['owner', 'director', 'admin']::public.member_role[]))
  ));
create policy "Équipe gère les lignes de commande" on public.order_items
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- Livraisons ----------
create policy "Membres voient leurs livraisons" on public.deliveries
  for select to authenticated
  using ((select public.can_access_establishment(establishment_id)) or (select public.is_staff()));
create policy "Équipe gère les livraisons" on public.deliveries
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- Factures : comptabilité et direction seulement ----------
create policy "Comptabilité et direction voient les factures" on public.invoices
  for select to authenticated
  using (
    (status <> 'brouillon' and (select public.has_org_role(organization_id, array['owner', 'director', 'accounting']::public.member_role[])))
    or (select public.is_staff())
  );
create policy "Équipe gère les factures" on public.invoices
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- =============================================================================
-- ACTIONS DU PORTAIL (RPC)
-- Les clients ne modifient jamais les menus directement : ils passent par ces
-- fonctions, qui vérifient le rôle, la date limite et la validité du repas.
-- Elles seront aussi les « outils » de l'assistant IA (function calling).
-- =============================================================================

-- « Garder mon menu » : un clic
create or replace function public.confirm_monthly_menu(p_menu_id uuid)
returns public.monthly_menus
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_menu public.monthly_menus;
begin
  select * into v_menu from public.monthly_menus where id = p_menu_id for update;
  if not found or v_menu.status = 'brouillon' then
    raise exception 'menu_introuvable';
  end if;
  if not public.can_access_establishment(v_menu.establishment_id, array['owner', 'director', 'admin']::public.member_role[]) then
    raise exception 'acces_refuse';
  end if;

  update public.monthly_menus
     set status = case when exists (
                    select 1 from public.menu_days d where d.monthly_menu_id = p_menu_id and d.original_meal_id is not null
                  ) then 'modifie'::public.monthly_menu_status else 'confirme'::public.monthly_menu_status end,
         confirmed_at = now(),
         confirmed_by = (select auth.uid())
   where id = p_menu_id
  returning * into v_menu;
  return v_menu;
end;
$$;

-- « Remplacer » un repas du menu par une alternative
create or replace function public.replace_menu_meal(p_menu_day_id uuid, p_meal_id uuid)
returns public.menu_days
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day public.menu_days;
  v_menu public.monthly_menus;
begin
  select * into v_day from public.menu_days where id = p_menu_day_id for update;
  if not found then
    raise exception 'jour_introuvable';
  end if;
  select * into v_menu from public.monthly_menus where id = v_day.monthly_menu_id;
  if v_menu.status = 'brouillon'
     or not public.can_access_establishment(v_menu.establishment_id, array['owner', 'director', 'admin']::public.member_role[]) then
    raise exception 'acces_refuse';
  end if;
  if current_date > v_menu.change_deadline then
    -- Après la date limite : doit devenir une demande urgente (traitée par l'équipe)
    raise exception 'date_limite_depassee';
  end if;
  if not exists (
    select 1 from public.meals m where m.id = p_meal_id and m.meal_type = 'repas' and m.status = 'disponible'
  ) then
    raise exception 'repas_invalide';
  end if;

  update public.menu_days
     set original_meal_id = coalesce(original_meal_id, meal_id),
         meal_id = p_meal_id
   where id = p_menu_day_id
  returning * into v_day;
  return v_day;
end;
$$;

revoke execute on function public.confirm_monthly_menu(uuid) from public, anon;
revoke execute on function public.replace_menu_meal(uuid, uuid) from public, anon;
grant execute on function public.confirm_monthly_menu(uuid) to authenticated;
grant execute on function public.replace_menu_meal(uuid, uuid) to authenticated;
