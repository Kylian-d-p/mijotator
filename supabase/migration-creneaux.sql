-- Migration : choix libre des repas à prévoir (créneaux) au lieu de « soir » / « midi et soir ».
-- À exécuter une fois dans le SQL Editor d'une base créée avec l'ancienne version de schema.sql.
-- Une base neuve n'en a pas besoin : schema.sql contient déjà la colonne creneaux.

begin;

alter table public.semaines add column creneaux text[];

-- Les semaines existantes gardent leurs repas : tous les soirs, ou midi et soir
update public.semaines
set creneaux = case
  when midi then array[
    '1-midi', '1-soir', '2-midi', '2-soir', '3-midi', '3-soir', '4-midi', '4-soir',
    '5-midi', '5-soir', '6-midi', '6-soir', '7-midi', '7-soir'
  ]
  else array['1-soir', '2-soir', '3-soir', '4-soir', '5-soir', '6-soir', '7-soir']
end;

alter table public.semaines
  alter column creneaux set not null,
  add constraint semaines_creneaux_check check (
    cardinality(creneaux) between 1 and 14
    and creneaux <@ array[
      '1-midi', '1-soir', '2-midi', '2-soir', '3-midi', '3-soir', '4-midi', '4-soir',
      '5-midi', '5-soir', '6-midi', '6-soir', '7-midi', '7-soir'
    ]
  );

-- Supprimer la colonne retire aussi le droit d'insertion qui la concernait
alter table public.semaines drop column midi;

grant insert (creneaux) on public.semaines to authenticated;

commit;
