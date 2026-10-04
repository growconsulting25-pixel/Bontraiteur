-- =============================================================================
-- PLATEFORME : profils, messagerie (fils de support) et notifications
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILS : nom, téléphone, photo, préférences
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 40),
  avatar_path text check (char_length(avatar_path) <= 300),
  email_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Chacun voit son profil" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()) or (select private.is_staff()));
create policy "Chacun crée son profil" on public.profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Chacun modifie son profil" on public.profiles
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Photos de profil : avatars/<user_id>/… (privé, chacun gère son dossier)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Chacun lit sa photo" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_staff())));
create policy "Chacun dépose sa photo" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Chacun remplace sa photo" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Chacun supprime sa photo" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------------------
-- 2. MESSAGERIE : chaque demande de support devient un fil de discussion
-- ---------------------------------------------------------------------------
alter table public.support_requests
  add column if not exists last_message_at timestamptz not null default now(),
  add column if not exists client_unread boolean not null default false,
  add column if not exists staff_unread boolean not null default true;

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.support_requests (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  from_staff boolean not null default false,
  author_name text check (char_length(author_name) <= 120),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index support_messages_request_idx on public.support_messages (request_id, created_at);
create index support_messages_author_idx on public.support_messages (author_id);
alter table public.support_messages enable row level security;

create policy "Membres et équipe lisent les messages" on public.support_messages
  for select to authenticated
  using (
    (select private.is_staff())
    or exists (select 1 from public.support_requests r where r.id = request_id and private.has_org_role(r.organization_id))
  );
create policy "Membres répondent dans leurs fils" on public.support_messages
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (
      (from_staff and (select private.is_staff()))
      or (not from_staff and exists (select 1 from public.support_requests r where r.id = request_id and private.has_org_role(r.organization_id)))
    )
  );

-- ---------------------------------------------------------------------------
-- 3. NOTIFICATIONS (une ligne par personne ; texte rendu dans la langue du portail)
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  link text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;
create index notifications_org_idx on public.notifications (organization_id);
alter table public.notifications enable row level security;

create policy "Chacun voit ses notifications" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Chacun marque ses notifications comme lues" on public.notifications
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Chacun supprime ses notifications" on public.notifications
  for delete to authenticated using (user_id = (select auth.uid()));
-- Aucune insertion directe : seulement par les déclencheurs ci-dessous (ou le serveur).

/** Avise les membres d'une organisation (optionnellement certains rôles seulement). */
create or replace function private.notify_org(
  p_org uuid, p_kind text, p_payload jsonb, p_link text, p_roles public.member_role[] default null
) returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (user_id, organization_id, kind, payload, link)
  select m.user_id, p_org, p_kind, p_payload, p_link
  from public.memberships m
  where m.organization_id = p_org
    and (p_roles is null or m.role = any (p_roles))
    and m.user_id is distinct from (select auth.uid()); -- pas pour l'auteur de l'action
$$;
revoke all on function private.notify_org(uuid, text, jsonb, text, public.member_role[]) from public, anon, authenticated;

create or replace function private.org_of_establishment(p_est uuid) returns uuid
language sql stable security definer set search_path = ''
as $$ select organization_id from public.establishments where id = p_est $$;
revoke all on function private.org_of_establishment(uuid) from public, anon, authenticated;

-- Menu publié
create or replace function private.on_menu_change() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status = 'publie' and (tg_op = 'INSERT' or old.status = 'brouillon') then
    perform private.notify_org(
      private.org_of_establishment(new.establishment_id), 'menu_published',
      jsonb_build_object('month', new.month, 'deadline', new.change_deadline,
                         'establishment', (select name from public.establishments where id = new.establishment_id)),
      'menu');
  end if;
  return new;
end $$;
create trigger notify_menu_change after insert or update of status on public.monthly_menus
  for each row execute function private.on_menu_change();

-- Commande confirmée / livrée / annulée par l'équipe
create or replace function private.on_order_change() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status is distinct from old.status and new.status in ('confirmee', 'livree', 'annulee') and private.is_staff() then
    perform private.notify_org(private.org_of_establishment(new.establishment_id), 'order_status',
      jsonb_build_object('status', new.status, 'date', new.delivery_date, 'kind', new.kind), 'orders');
  end if;
  return new;
end $$;
create trigger notify_order_change after update of status on public.orders
  for each row execute function private.on_order_change();

-- Livraison planifiée / en route / livrée / annulée
create or replace function private.on_delivery_change() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    if new.status in ('planifiee', 'en_route', 'livree', 'annulee') and (tg_op = 'INSERT' or new.status <> 'planifiee') then
      perform private.notify_org(private.org_of_establishment(new.establishment_id), 'delivery_status',
        jsonb_build_object('status', new.status, 'date', new.scheduled_for, 'window', new.time_window), 'deliveries');
    end if;
  end if;
  return new;
end $$;
create trigger notify_delivery_change after insert or update of status on public.deliveries
  for each row execute function private.on_delivery_change();

-- Nouvelle facture / facture en retard (direction et comptabilité)
create or replace function private.on_invoice_change() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status in ('a_payer', 'en_retard') and (tg_op = 'INSERT' or new.status is distinct from old.status) then
    perform private.notify_org(new.organization_id, case when new.status = 'en_retard' then 'invoice_overdue' else 'invoice_new' end,
      jsonb_build_object('number', new.number, 'amount_cents', new.amount_cents, 'due', new.due_date), 'invoices',
      array['owner', 'director', 'accounting']::public.member_role[]);
  end if;
  return new;
end $$;
create trigger notify_invoice_change after insert or update of status on public.invoices
  for each row execute function private.on_invoice_change();

-- Nouveau message : met le fil à jour ; une réponse de l'équipe avise le client
create or replace function private.on_support_message() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_req public.support_requests;
begin
  update public.support_requests
     set last_message_at = new.created_at,
         client_unread = new.from_staff or client_unread,
         staff_unread = (not new.from_staff) or staff_unread,
         status = case when not new.from_staff then 'ouverte'::public.support_status else status end,
         resolved_at = case when not new.from_staff then null else resolved_at end
   where id = new.request_id
  returning * into v_req;
  if new.from_staff then
    perform private.notify_org(v_req.organization_id, 'message', jsonb_build_object('subject', v_req.subject, 'id', v_req.id), 'support:' || v_req.id);
  end if;
  return new;
end $$;
create trigger support_message_inserted after insert on public.support_messages
  for each row execute function private.on_support_message();

/** Le client ouvre un fil : marqué comme lu (et ses notifications liées aussi). */
create or replace function public.mark_conversation_read(p_request_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.support_requests where id = p_request_id;
  if v_org is null or not private.has_org_role(v_org) then
    raise exception 'acces_refuse';
  end if;
  update public.support_requests set client_unread = false where id = p_request_id;
  update public.notifications set read_at = now()
   where user_id = (select auth.uid()) and link = 'support:' || p_request_id and read_at is null;
end $$;
revoke execute on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
