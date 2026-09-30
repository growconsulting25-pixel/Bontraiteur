-- =============================================================================
-- Les fonctions d'autorisation internes (utilisées par les politiques RLS)
-- ne doivent pas être exposées comme endpoints API (/rest/v1/rpc/…).
-- On les déplace dans un schéma « private » non exposé par PostgREST.
-- Les politiques RLS suivent automatiquement (références par OID).
-- Seules les actions du portail restent en RPC public :
--   confirm_monthly_menu, replace_menu_meal (volontairement appelables).
-- =============================================================================
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.is_staff() set schema private;
alter function public.has_org_role(uuid, public.member_role[]) set schema private;
alter function public.can_access_establishment(uuid, public.member_role[]) set schema private;

-- Les corps plpgsql référencent les fonctions par leur nom : on les met à jour.
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
  if not private.can_access_establishment(v_menu.establishment_id, array['owner', 'director', 'admin']::public.member_role[]) then
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
     or not private.can_access_establishment(v_menu.establishment_id, array['owner', 'director', 'admin']::public.member_role[]) then
    raise exception 'acces_refuse';
  end if;
  if current_date > v_menu.change_deadline then
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
