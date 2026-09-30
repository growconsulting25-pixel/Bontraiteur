-- =============================================================================
-- PORTAIL CLIENT — fonctionnalités
--   · demandes de support
--   · annuler une commande / suspendre une livraison (RPC avec règles)
--   · numérotation automatique des factures (BT-1001, BT-1002…)
--   · langue préférée des utilisateurs
-- =============================================================================

-- ---------- Numéro de facture automatique ----------
create sequence if not exists public.invoice_number_seq start 1001;
alter table public.invoices alter column number set default 'BT-' || nextval('public.invoice_number_seq');

-- ---------- Demandes de support ----------
create type public.support_status as enum ('ouverte', 'resolue');

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  establishment_id uuid references public.establishments (id) on delete set null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject text not null check (char_length(subject) between 1 and 160),
  message text not null check (char_length(message) between 1 and 4000),
  status public.support_status not null default 'ouverte',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index support_requests_org_idx on public.support_requests (organization_id, created_at desc);
create index support_requests_user_idx on public.support_requests (user_id);
create index support_requests_establishment_idx on public.support_requests (establishment_id);

alter table public.support_requests enable row level security;

create policy "Membres voient le support de leur organisation" on public.support_requests
  for select to authenticated
  using ((select private.has_org_role(organization_id)) or (select private.is_staff()));
create policy "Membres écrivent au support" on public.support_requests
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'ouverte'
    and (select private.has_org_role(organization_id))
  );
create policy "Équipe gère le support" on public.support_requests
  for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- ---------- Annuler une commande ----------
-- Permis à la direction tant que la commande n'est pas confirmée/livrée
-- et que la date de livraison n'est pas aujourd'hui ou passée.
create or replace function public.cancel_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'commande_introuvable';
  end if;
  if not private.can_access_establishment(v_order.establishment_id, array['owner', 'director', 'admin']::public.member_role[]) then
    raise exception 'acces_refuse';
  end if;
  if v_order.status not in ('brouillon', 'soumise') then
    raise exception 'commande_non_annulable';
  end if;
  if v_order.delivery_date <= current_date then
    raise exception 'trop_tard';
  end if;

  update public.orders set status = 'annulee' where id = p_order_id returning * into v_order;
  return v_order;
end;
$$;

-- ---------- Suspendre une livraison (journée pédagogique, fermeture…) ----------
create or replace function public.pause_delivery(p_delivery_id uuid)
returns public.deliveries
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_delivery public.deliveries;
begin
  select * into v_delivery from public.deliveries where id = p_delivery_id for update;
  if not found then
    raise exception 'livraison_introuvable';
  end if;
  if not private.can_access_establishment(v_delivery.establishment_id, array['owner', 'director', 'admin']::public.member_role[]) then
    raise exception 'acces_refuse';
  end if;
  if v_delivery.status <> 'planifiee' then
    raise exception 'livraison_non_suspendable';
  end if;
  if v_delivery.scheduled_for <= current_date then
    raise exception 'trop_tard';
  end if;

  update public.deliveries set status = 'suspendue' where id = p_delivery_id returning * into v_delivery;
  return v_delivery;
end;
$$;

revoke execute on function public.cancel_order(uuid) from public, anon;
revoke execute on function public.pause_delivery(uuid) from public, anon;
grant execute on function public.cancel_order(uuid) to authenticated;
grant execute on function public.pause_delivery(uuid) to authenticated;
