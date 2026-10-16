"use client";

import Icone from "@/components/Icone";
import {
  creneau,
  dateValide,
  estWeekEnd,
  JOURS,
  libelleJour,
  libelleJourCourt,
  MOMENTS,
  TOUS_LES_CRENEAUX,
  TOUS_LES_SOIRS,
  trierCreneaux,
  type Creneau,
} from "@/lib/semaine";

const memes = (a: Creneau[], b: Creneau[]) => a.length === b.length && a.every((c) => b.includes(c));

// Planning de la semaine, comme dans un cahier de textes : une colonne par jour du programme,
// une rangée par moment, une case à cocher par repas à prévoir
export default function SelecteurCreneaux({
  debut,
  valeur,
  onChange,
  disabled = false,
}: {
  debut: string;
  valeur: Creneau[];
  onChange: (creneaux: Creneau[]) => void;
  disabled?: boolean;
}) {
  const dateConnue = dateValide(debut);

  // Week-end : samedi et dimanche réels si la date est connue, sinon les deux derniers jours
  const weekEnd = (jour: number) => (dateConnue ? estWeekEnd(debut, jour) : jour >= 6);

  const raccourcis = [
    { libelle: "Tous les soirs", creneaux: TOUS_LES_SOIRS },
    { libelle: "Midi et soir", creneaux: TOUS_LES_CRENEAUX },
    {
      libelle: "Soirs + midis du week-end",
      creneaux: trierCreneaux([
        ...TOUS_LES_SOIRS,
        ...JOURS.filter(weekEnd).map((jour) => creneau(jour, "midi")),
      ]),
    },
  ];

  function basculer(c: Creneau) {
    onChange(trierCreneaux(valeur.includes(c) ? valeur.filter((v) => v !== c) : [...valeur, c]));
  }

  const nombre = valeur.length;

  return (
    <div role="group" aria-labelledby="creneaux-titre" aria-describedby="creneaux-compte">
      <div className="flex items-baseline justify-between gap-4">
        <span id="creneaux-titre" className="font-bold">
          Repas à prévoir
        </span>
        <span id="creneaux-compte" aria-live="polite" className="chiffres text-sm font-semibold">
          {nombre === 0 ? (
            <span className="bg-surligneur-pale px-1.5 py-0.5">Aucun repas</span>
          ) : (
            `${nombre} repas`
          )}
        </span>
      </div>

      <div role="group" aria-label="Raccourcis" className="mt-2 flex flex-wrap gap-2">
        {raccourcis.map(({ libelle, creneaux }) => {
          const actif = memes(valeur, creneaux);
          return (
            <button
              key={libelle}
              type="button"
              onClick={() => onChange(creneaux)}
              aria-pressed={actif}
              disabled={disabled}
              className={`min-h-10 cursor-pointer border-2 border-encre px-3.5 text-[0.95rem] font-bold transition-colors disabled:cursor-not-allowed ${
                actif ? "bg-encre text-papier" : "bg-papier text-encre hover:bg-surligneur"
              }`}
            >
              {libelle}
            </button>
          );
        })}
      </div>

      {/* Les filets du planning sont les espaces d'1 px de la grille, qui laissent voir le fond */}
      <div className="mt-3 grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] gap-px border-2 border-encre bg-filet-doux sm:grid-cols-[3.75rem_repeat(7,minmax(0,1fr))]">
        <div className="border-b-2 border-encre bg-papier" />
        {JOURS.map((jour) => {
          const { semaine, date } = libelleJourCourt(debut, jour);
          return (
            <div
              key={jour}
              aria-hidden="true"
              className={`flex flex-col items-center justify-center gap-0.5 border-b-2 border-encre px-0.5 py-2 text-center leading-none ${
                weekEnd(jour) ? "bg-papier-2" : "bg-papier"
              }`}
            >
              <span className="archivo-large text-[0.95rem] font-extrabold sm:text-base">J{jour}</span>
              {dateConnue && (
                <>
                  <span className="text-[0.8125rem] text-encre-2">{semaine}</span>
                  <span className="chiffres text-[0.8125rem] font-semibold">{date}</span>
                </>
              )}
            </div>
          );
        })}

        {MOMENTS.map((moment) => (
          <div key={moment} className="contents">
            <div
              aria-hidden="true"
              className="bandeau flex items-center bg-papier pl-2 text-[0.8125rem] text-encre-2 sm:pl-3"
            >
              {moment === "midi" ? "Midi" : "Soir"}
            </div>
            {JOURS.map((jour) => {
              const c = creneau(jour, moment);
              const coche = valeur.includes(c);
              const nomJour = dateConnue ? libelleJour(debut, jour) : `Jour ${jour}`;
              return (
                <label
                  key={c}
                  className={`relative flex min-h-11 items-center justify-center transition-colors duration-150 has-[:focus-visible]:shadow-[inset_0_0_0_2px_var(--encre),inset_0_0_0_6px_var(--surligneur)] sm:min-h-12 ${
                    disabled
                      ? "cursor-not-allowed bg-papier-2"
                      : coche
                        ? "cursor-pointer bg-essentiel"
                        : "cursor-pointer bg-papier hover:bg-surligneur-pale"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={coche}
                    onChange={() => basculer(c)}
                    disabled={disabled}
                    className="sr-only"
                  />
                  <span className="sr-only">
                    {nomJour}, {moment}
                  </span>
                  {coche ? (
                    <Icone nom="valide" className="size-5 text-encre" />
                  ) : (
                    <span aria-hidden="true" className="size-4 border-[1.5px] border-bordure-champ" />
                  )}
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
