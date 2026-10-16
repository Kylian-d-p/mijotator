"use client";

import { useState } from "react";
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

// Planning de la semaine : une colonne par jour du programme, une rangée par moment, une case
// par repas. Une case cochée prend l'émail de son repas, comme dans la grille de la semaine :
// flamme le midi, braise le soir.
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
  // Seules les cases cochées par l'utilisateur s'animent, pas celles du chargement de la page
  const [poses, setPoses] = useState<Creneau[]>([]);
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

  function changer(creneaux: Creneau[]) {
    setPoses(creneaux.filter((c) => !valeur.includes(c)));
    onChange(creneaux);
  }

  function basculer(c: Creneau) {
    changer(trierCreneaux(valeur.includes(c) ? valeur.filter((v) => v !== c) : [...valeur, c]));
  }

  const nombre = valeur.length;

  return (
    <div role="group" aria-labelledby="creneaux-titre" aria-describedby="creneaux-compte">
      <div className="flex items-baseline justify-between gap-4">
        <span id="creneaux-titre" className="font-semibold">
          Repas à prévoir
        </span>
        <span id="creneaux-compte" aria-live="polite" className="chiffres text-sm font-semibold">
          {nombre === 0 ? <span className="etiquette-soleil">Aucun repas</span> : `${nombre} repas`}
        </span>
      </div>

      <div role="group" aria-label="Raccourcis" className="mt-2.5 flex flex-wrap gap-2">
        {raccourcis.map(({ libelle, creneaux }) => {
          const actif = memes(valeur, creneaux);
          return (
            <button
              key={libelle}
              type="button"
              onClick={() => changer(creneaux)}
              aria-pressed={actif}
              disabled={disabled}
              className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[0.95rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                actif ? "bg-flamme-pale text-fonte" : "bg-email-2 text-fonte-2 hover:bg-email-3 hover:text-fonte"
              }`}
            >
              {actif && <Icone nom="valide" className="size-4 text-braise" />}
              {libelle}
            </button>
          );
        })}
      </div>

      <div
        className={`mt-3 grid grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] gap-1 rounded-2xl bg-email-2 p-1.5 sm:grid-cols-[3.25rem_repeat(7,minmax(0,1fr))] sm:gap-1.5 sm:p-2.5 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <div />
        {JOURS.map((jour) => {
          const { semaine, date } = libelleJourCourt(debut, jour);
          return (
            <div
              key={jour}
              aria-hidden="true"
              className={`flex flex-col items-center justify-center gap-1 rounded-lg px-0.5 py-1.5 text-center leading-none ${
                weekEnd(jour) ? "bg-email-3" : ""
              }`}
            >
              {dateConnue ? (
                <>
                  <span className="text-[0.8125rem] text-fonte-2">{semaine}</span>
                  <span className="chiffres text-[0.95rem] font-bold sm:text-base">{date}</span>
                </>
              ) : (
                <span className="text-[0.95rem] font-bold sm:text-base">J{jour}</span>
              )}
            </div>
          );
        })}

        {MOMENTS.map((moment) => (
          <div key={moment} className="contents">
            <div
              aria-hidden="true"
              className="flex items-center pl-1 text-[0.8125rem] font-semibold text-fonte-2 sm:pl-1.5 sm:text-sm"
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
                  className={`group relative flex h-11 items-center justify-center rounded-xl transition-colors duration-150 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-flamme sm:h-12 ${
                    disabled ? "cursor-not-allowed" : "cursor-pointer"
                  } ${
                    coche
                      ? `border-b-[3px] border-fonte shadow-[0_6px_10px_-8px_rgb(30_26_23/0.8)] ${
                          moment === "midi" ? "bg-flamme text-fonte" : "bg-braise text-email"
                        }`
                      : `bg-email text-bord ${disabled ? "" : "hover:bg-flamme-pale hover:text-braise"}`
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
                    <Icone nom="valide" className={`size-5 ${poses.includes(c) ? "pose" : ""}`} />
                  ) : (
                    <Icone nom="plus" className="size-4" />
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
