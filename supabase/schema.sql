-- Mijotator : structure de la base, à exécuter une fois dans le SQL Editor d'un projet Supabase neuf.
--
-- semaines 1──n repas
--          1──n articles_courses
-- Chaque table porte user_id : la Row Level Security compare cette colonne à l'utilisateur connecté.

-- 1. Semaines : les contraintes saisies et l'état de la génération
create table public.semaines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  debut date not null,
  personnes smallint not null check (personnes between 1 and 8),
  budget_euros numeric(6, 2) not null check (budget_euros between 10 and 500),
  regime text not null default '' check (char_length(regime) <= 200),
  temps_max_minutes smallint not null check (temps_max_minutes between 5 and 180),
  -- Repas à prévoir : « jour-moment », du jour 1 au jour 7 du programme
  creneaux text[] not null check (
    cardinality(creneaux) between 1 and 14
    and creneaux <@ array[
      '1-midi', '1-soir', '2-midi', '2-soir', '3-midi', '3-soir', '4-midi', '4-soir',
      '5-midi', '5-soir', '6-midi', '6-soir', '7-midi', '7-soir'
    ]
  ),
  frigo text not null default '' check (char_length(frigo) <= 1000),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'prete', 'erreur')),
  message_erreur text,
  frigo_releve jsonb,
  cout_estime numeric(7, 2),
  modele text,
  created_at timestamptz not null default now()
);

create index semaines_user_id_idx on public.semaines (user_id, created_at desc);

-- 2. Repas : un par jour et par moment de la semaine
create table public.repas (
  id uuid primary key default gen_random_uuid(),
  semaine_id uuid not null references public.semaines (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  jour smallint not null check (jour between 1 and 7),
  moment text not null check (moment in ('midi', 'soir')),
  titre text not null,
  temps_minutes smallint not null check (temps_minutes > 0),
  ingredients jsonb not null,
  etapes text[] not null,
  -- Rend le worker idempotent : un repas par créneau, même si QStash relivre le message
  unique (semaine_id, jour, moment)
);

create index repas_user_id_idx on public.repas (user_id);

-- 3. Liste de courses : besoins de la semaine moins le frigo, calculés par le worker
create table public.articles_courses (
  id uuid primary key default gen_random_uuid(),
  semaine_id uuid not null references public.semaines (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  nom text not null,
  quantite numeric(10, 2) not null check (quantite > 0),
  unite text not null check (unite in ('g', 'ml', 'piece')),
  rayon text not null,
  coche boolean not null default false
);

create index articles_courses_semaine_id_idx on public.articles_courses (semaine_id);
create index articles_courses_user_id_idx on public.articles_courses (user_id);

-- 4. Row Level Security sur toutes les tables
alter table public.semaines enable row level security;
alter table public.repas enable row level security;
alter table public.articles_courses enable row level security;

create policy "Chacun lit ses semaines"
  on public.semaines
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Chacun crée ses semaines"
  on public.semaines
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Chacun lit ses repas"
  on public.repas
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Chacun lit sa liste de courses"
  on public.articles_courses
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Chacun coche sa liste de courses"
  on public.articles_courses
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Repas, articles, statut et résultats sont écrits par le worker avec la clé secrète,
-- qui ignore la RLS : aucune politique ne permet à un utilisateur de les écrire.

-- 5. Droits d'accès, explicites pour ne pas dépendre des droits par défaut du projet.
-- La RLS filtre ensuite les lignes ; le worker (service_role) ignore la RLS.
grant select on public.semaines, public.repas, public.articles_courses to authenticated;
grant all on public.semaines, public.repas, public.articles_courses to service_role;

-- Une semaine se crée avec ses seules contraintes : user_id et statut prennent leur valeur par défaut
revoke insert on public.semaines from anon, authenticated;
grant insert (debut, personnes, budget_euros, regime, temps_max_minutes, creneaux, frigo)
  on public.semaines to authenticated;

-- Dans la liste de courses, seule la case à cocher est modifiable
revoke update on public.articles_courses from anon, authenticated;
grant update (coche) on public.articles_courses to authenticated;

-- 6. Temps réel : fin de génération et cases cochées sur les autres écrans
alter publication supabase_realtime add table public.semaines, public.articles_courses;
