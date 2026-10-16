"use client";

import { useState } from "react";
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

// Planning de la semaine en plaque de cuisson : une colonne par jour du programme, une rangée
// par moment, un feu par repas. Cocher un repas pose un couvercle sur son feu.
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
  // Seuls les couvercles posés par l'utilisateur s'animent, pas ceux du chargement de la page
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
              className={`min-h-10 cursor-pointer rounded-full px-4 text-[0.95rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                actif
                  ? "bg-fonte text-email"
                  : "bg-email text-fonte shadow-[inset_0_0_0_2px_var(--fonte)] hover:bg-email-2"
              }`}
            >
              {libelle}
            </button>
          );
        })}
      </div>

      <div
        className={`mt-3 grid grid-cols-[2.75rem_repeat(7,minmax(0,1fr))] gap-x-0.5 gap-y-1 rounded-2xl bg-fonte p-1.5 text-email shadow-[0_14px_24px_-18px_rgb(30_26_23/0.9)] sm:grid-cols-[3.75rem_repeat(7,minmax(0,1fr))] sm:gap-x-1 sm:p-2.5 ${
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
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-2 text-center leading-none ${
                weekEnd(jour) ? "bg-white/[0.07]" : ""
              }`}
            >
              <span className="text-[0.95rem] font-extrabold sm:text-base">J{jour}</span>
              {dateConnue && (
                <>
                  <span className="text-[0.8125rem] text-white/65">{semaine}</span>
                  <span className="chiffres text-[0.8125rem] font-semibold">{date}</span>
                </>
              )}
            </div>
          );
        })}

        {MOMENTS.map((moment) => (
          <div key={moment} className="contents">
            <div aria-hidden="true" className="flex items-center pl-1.5 text-[0.8125rem] font-semibold text-white/70 sm:pl-2.5 sm:text-sm">
              {moment === "midi" ? "Midi" : "Soir"}
            </div>
            {JOURS.map((jour) => {
              const c = creneau(jour, moment);
              const coche = valeur.includes(c);
              const nomJour = dateConnue ? libelleJour(debut, jour) : `Jour ${jour}`;
              return (
                <label
                  key={c}
                  className={`group relative flex min-h-12 items-center justify-center rounded-xl transition-colors duration-150 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-0 has-[:focus-visible]:outline-flamme sm:min-h-14 ${
                    disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-white/[0.06]"
                  } ${weekEnd(jour) ? "bg-white/[0.04]" : ""}`}
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
                    <span
                      aria-hidden="true"
                      className={`flex size-7 items-center justify-center rounded-full bg-flamme shadow-[0_3px_6px_-2px_rgb(0_0_0/0.6)] sm:size-9 ${
                        poses.includes(c) ? "pose" : ""
                      }`}
                    >
                      <span className="size-2 rounded-full bg-fonte sm:size-2.5" />
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`size-7 rounded-full border-2 border-[#7a716a] shadow-[inset_0_0_0_4px_var(--fonte),inset_0_0_0_5.5px_#4a433d] transition-colors duration-200 sm:size-9 ${
                        disabled ? "" : "group-hover:border-flamme"
                      }`}
                    />
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
