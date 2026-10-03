-- =============================================================================
-- Allergènes « à surveiller » par établissement
-- La garderie coche les allergènes présents dans ses groupes ; le calendrier
-- signale les plats qui en contiennent (déclarés, à titre informatif).
-- =============================================================================
alter table public.establishments
  add column if not exists watched_allergens public.allergen[] not null default '{}';

-- La direction met à jour cette liste sans pouvoir modifier le reste de la fiche
create or replace function public.set_watched_allergens(p_establishment_id uuid, p_allergens public.allergen[])
returns public.establishments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_est public.establishments;
begin
  if not (private.is_staff()
          or private.can_access_establishment(p_establishment_id, array['owner', 'director', 'admin']::public.member_role[])) then
    raise exception 'acces_refuse';
  end if;
  update public.establishments
     set watched_allergens = coalesce(p_allergens, '{}')
   where id = p_establishment_id
  returning * into v_est;
  return v_est;
end;
$$;

revoke execute on function public.set_watched_allergens(uuid, public.allergen[]) from public, anon;
grant execute on function public.set_watched_allergens(uuid, public.allergen[]) to authenticated;
