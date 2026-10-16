-- TD2 : configuration de Supabase, à exécuter une fois dans le SQL Editor.
-- Regroupe, dans l'ordre, les scripts des sections 2.6, 2.7, 3.2, 3.3, 5.2 et 6.2.

-- 2.6 Lier les fiches à leur auteur
-- Attention : supprime les fiches du TD1, qui n'ont pas d'auteur.
delete from public.fiches;

alter table public.fiches
  add column user_id uuid not null
  default auth.uid()
  references auth.users (id) on delete cascade;

create index fiches_user_id_idx on public.fiches (user_id);

-- 2.7 Règles de Row Level Security
create policy "Chacun lit ses propres fiches"
  on public.fiches
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Chacun crée ses propres fiches"
  on public.fiches
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 3.2 Bucket privé pour les cours en PDF
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cours', 'cours', false, 5242880, array['application/pdf']);

alter table public.fiches add column fichier_chemin text;

-- 3.3 Politiques d'accès au stockage, par utilisateur
create policy "Chacun dépose ses cours dans son dossier"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cours'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Chacun lit ses propres cours"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'cours'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 5.2 Statut de génération
alter table public.fiches
  add column statut text not null default 'prete'
    check (statut in ('en_attente', 'prete', 'erreur')),
  add column message_erreur text;

alter table public.fiches alter column statut set default 'en_attente';

alter table public.fiches
  alter column synthese drop not null,
  alter column questions drop not null,
  alter column modele drop not null;

-- 6.2 Temps réel sur la table des fiches
alter publication supabase_realtime add table public.fiches;
