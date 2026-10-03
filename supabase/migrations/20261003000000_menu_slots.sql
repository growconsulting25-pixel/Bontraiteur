-- =============================================================================
-- CALENDRIER DE MENU — 4 cases par jour, toutes modifiables
--   repas · dessert · collation_am · collation_pm
-- Chaque changement fait par un client mémorise le plat proposé à l'origine
-- (original_slots), pour afficher « Modifié » et permettre « Remettre ».
-- =============================================================================

alter table public.menu_days
  add column if not exists snack_am_id uuid references public.meals (id),
  add column if not exists snack_pm_id uuid references public.meals (id),
  add column if not exists original_slots jsonb not null default '{}'::jsonb;

create index if not exists menu_days_snack_am_idx on public.menu_days (snack_am_id);
create index if not exists menu_days_snack_pm_idx on public.menu_days (snack_pm_id);

-- Reprend l'historique existant (repas remplacés)
update public.menu_days
   set original_slots = jsonb_build_object('repas', original_meal_id)
 where original_meal_id is not null and original_slots = '{}'::jsonb;

/**
 * Change une case du menu.
 *   p_slot    : 'repas' | 'dessert' | 'collation_am' | 'collation_pm'
 *   p_meal_id : nouveau plat, ou NULL pour « remettre le plat proposé »
 *
 * Client (owner/director/admin) : avant la date limite, menu publié ;
 *   le plat d'origine est mémorisé et un menu confirmé repasse « à confirmer ».
 * Équipe Bon Traiteur : sans date limite, sans historique (préparation).
 */
create or replace function public.set_menu_slot(p_menu_day_id uuid, p_slot text, p_meal_id uuid default null)
returns public.menu_days
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day public.menu_days;
  v_menu public.monthly_menus;
  v_staff boolean := private.is_staff();
  v_column text;
  v_expected public.meal_type;
  v_current uuid;
  v_original uuid;
  v_has_original boolean;
  v_target uuid;
begin
  v_column := case p_slot
    when 'repas' then 'meal_id'
    when 'dessert' then 'dessert_id'
    when 'collation_am' then 'snack_am_id'
    when 'collation_pm' then 'snack_pm_id'
  end;
  if v_column is null then
    raise exception 'case_invalide';
  end if;
  v_expected := case when p_slot = 'repas' then 'repas' when p_slot = 'dessert' then 'dessert' else 'collation' end::public.meal_type;

  select * into v_day from public.menu_days where id = p_menu_day_id for update;
  if not found then
    raise exception 'jour_introuvable';
  end if;
  select * into v_menu from public.monthly_menus where id = v_day.monthly_menu_id for update;

  if not v_staff then
    if v_menu.status = 'brouillon'
       or not private.can_access_establishment(v_menu.establishment_id, array['owner', 'director', 'admin']::public.member_role[]) then
      raise exception 'acces_refuse';
    end if;
    if current_date > v_menu.change_deadline then
      raise exception 'date_limite_depassee';
    end if;
  end if;

  v_current := case p_slot
    when 'repas' then v_day.meal_id
    when 'dessert' then v_day.dessert_id
    when 'collation_am' then v_day.snack_am_id
    else v_day.snack_pm_id
  end;
  v_has_original := v_day.original_slots ? p_slot;
  v_original := nullif(v_day.original_slots ->> p_slot, '')::uuid;

  -- NULL = remettre le plat proposé à l'origine (qui pouvait être une case vide)
  v_target := case
    when p_meal_id is not null then p_meal_id
    when v_has_original then v_original
    else v_current
  end;
  if p_slot = 'repas' and v_target is null then
    raise exception 'repas_obligatoire';
  end if;

  if v_target is not null and not exists (
    select 1 from public.meals m where m.id = v_target and m.meal_type = v_expected and m.status <> 'indisponible'
  ) then
    raise exception 'plat_invalide';
  end if;

  update public.menu_days
     set meal_id      = case when p_slot = 'repas' then v_target else meal_id end,
         dessert_id   = case when p_slot = 'dessert' then v_target else dessert_id end,
         snack_am_id  = case when p_slot = 'collation_am' then v_target else snack_am_id end,
         snack_pm_id  = case when p_slot = 'collation_pm' then v_target else snack_pm_id end,
         original_slots = case
           when v_staff then original_slots
           -- retour au plat d'origine : on efface la trace
           when v_has_original and v_target is not distinct from v_original then original_slots - p_slot
           -- premier changement : on mémorise le plat proposé
           when not v_has_original and v_target is distinct from v_current then original_slots || jsonb_build_object(p_slot, v_current)
           else original_slots
         end,
         original_meal_id = case
           when v_staff or p_slot <> 'repas' then original_meal_id
           when v_has_original and v_target is not distinct from v_original then null
           when not v_has_original and v_target is distinct from v_current then v_current
           else original_meal_id
         end
   where id = p_menu_day_id
  returning * into v_day;

  if not v_staff and v_menu.status in ('confirme', 'modifie') then
    update public.monthly_menus set status = 'publie', confirmed_at = null, confirmed_by = null where id = v_menu.id;
  end if;
  return v_day;
end;
$$;

revoke execute on function public.set_menu_slot(uuid, text, uuid) from public, anon;
grant execute on function public.set_menu_slot(uuid, text, uuid) to authenticated;

-- « Confirmé avec changements » si au moins une case a été modifiée
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
                    select 1 from public.menu_days d
                    where d.monthly_menu_id = p_menu_id and (d.original_slots <> '{}'::jsonb or d.original_meal_id is not null)
                  ) then 'modifie'::public.monthly_menu_status else 'confirme'::public.monthly_menu_status end,
         confirmed_at = now(),
         confirmed_by = (select auth.uid())
   where id = p_menu_id
  returning * into v_menu;
  return v_menu;
end;
$$;
