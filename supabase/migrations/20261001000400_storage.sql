-- =============================================================================
-- STOCKAGE PRIVÉ
--   documents/<organization_id>/...  → documents partagés avec le client
--   invoices/<organization_id>/...   → PDF des factures
-- Le 1er dossier du chemin est TOUJOURS l'identifiant de l'organisation.
-- Les clients lisent seulement leurs dossiers ; l'équipe gère tout.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false), ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "Clients lisent les documents de leur organisation"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] in (
      select m.organization_id::text from public.memberships m where m.user_id = (select auth.uid())
    )
  );

create policy "Comptabilité et direction lisent les factures PDF"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'invoices'
    and (storage.foldername(name))[1] in (
      select m.organization_id::text from public.memberships m
      where m.user_id = (select auth.uid()) and m.role in ('owner', 'director', 'accounting')
    )
  );

create policy "Équipe gère les fichiers clients"
  on storage.objects for all to authenticated
  using (bucket_id in ('documents', 'invoices') and (select private.is_staff()))
  with check (bucket_id in ('documents', 'invoices') and (select private.is_staff()));
