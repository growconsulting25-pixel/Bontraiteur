-- Un repas remplacé après confirmation remet le menu « à confirmer » :
-- l'équipe voit toujours la dernière version validée par le client.
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
  select * into v_menu from public.monthly_menus where id = v_day.monthly_menu_id for update;
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
     set original_meal_id = case when original_meal_id = p_meal_id then null else coalesce(original_meal_id, meal_id) end,
         meal_id = p_meal_id
   where id = p_menu_day_id
  returning * into v_day;

  if v_menu.status in ('confirme', 'modifie') then
    update public.monthly_menus set status = 'publie', confirmed_at = null, confirmed_by = null where id = v_menu.id;
  end if;
  return v_day;
end;
$$;
