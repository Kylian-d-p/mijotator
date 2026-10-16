"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import Icone from "@/components/Icone";
import type { Question } from "@/lib/fiche";
import {
  abonner,
  enregistrerNotes,
  lireBrut,
  notesDeLaFiche,
  type Note,
} from "@/lib/auto-evaluation";

export default function JeMeTeste({
  idFiche,
  questions,
}: {
  idFiche: string;
  questions: Question[];
}) {
  const brut = useSyncExternalStore(abonner, lireBrut, () => null);
  const notes = useMemo(
    () => notesDeLaFiche(brut, idFiche, questions.length),
    [brut, idFiche, questions.length]
  );
  const [retournes, setRetournes] = useState<boolean[]>(() =>
    questions.map(() => false)
  );
  // Pas de pivot au chargement pour les corrigés déjà notés : seulement au geste de l'étudiant.
  const [anime, setAnime] = useState(false);
  const corriges = useRef<(HTMLParagraphElement | null)[]>([]);

  const nombreNotees = notes.filter((n) => n !== null).length;
  const nombreSues = notes.filter((n) => n === "su").length;
  const toutNote = nombreNotees === questions.length;

  function retourner(index: number) {
    // Le bouton disparaît au profit du corrigé : on y déplace le focus
    // une fois le corrigé rendu lisible (et plus aria-hidden).
    flushSync(() => {
      setAnime(true);
      setRetournes((precedent) =>
        precedent.map((valeur, i) => (i === index ? true : valeur))
      );
    });
    corriges.current[index]?.focus({ preventScroll: true });
  }

  function noter(index: number, note: Note) {
    const suivantes = notes.map((n, i) =>
      i === index ? (n === note ? null : note) : n
    );
    enregistrerNotes(idFiche, suivantes);
  }

  function recommencer() {
    setAnime(true);
    enregistrerNotes(idFiche, null);
    setRetournes(questions.map(() => false));
  }

  return (
    <section aria-labelledby={`teste-${idFiche}`}>
      <div className="flex items-center justify-between gap-4 bg-teste px-5 py-3 text-white sm:px-6">
        <h2 id={`teste-${idFiche}`} className="bandeau">
          Je me teste
        </h2>
        <p className="flex items-baseline gap-2 text-sm font-semibold" aria-live="polite">
          <span>Score</span>
          <span className="archivo-large text-xl font-extrabold tabular-nums">
            {nombreNotees === 0 ? "–" : nombreSues}
            <span className="font-semibold"> / {questions.length}</span>
          </span>
        </p>
      </div>

      <ol className="border-x-2 border-b-2 border-teste">
        {questions.map((q, index) => {
          const note = notes[index];
          const retourne = retournes[index] || note !== null;

          return (
            <li
              key={index}
              className="border-b border-filet-doux px-5 py-6 last:border-b-0 sm:px-6"
            >
              <div className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="archivo-large flex size-9 shrink-0 items-center justify-center bg-teste text-lg font-extrabold text-white tabular-nums"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="pt-1 text-[1.0625rem] leading-snug font-bold">
                    <span className="sr-only">Question {index + 1} : </span>
                    {q.question}
                  </h3>

                  <div className="mt-4 border-t-[1.5px] border-dashed border-bordure-champ pt-4">
                    <p
                      ref={(el) => {
                        corriges.current[index] = el;
                      }}
                      tabIndex={-1}
                      data-retourne={retourne}
                      data-anime={anime}
                      aria-hidden={!retourne}
                      className={`corrige leading-relaxed outline-none ${
                        retourne ? "text-encre" : "text-encre-3 select-none"
                      }`}
                    >
                      <span className="sr-only">Réponse : </span>
                      {q.reponse}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {!retourne ? (
                        <button
                          type="button"
                          onClick={() => retourner(index)}
                          className="bouton bouton-secondaire min-h-10 px-3.5 text-[0.95rem]"
                        >
                          <Icone nom="retourner" className="size-4" />
                          Retourner le corrigé
                          <span className="sr-only"> de la question {index + 1}</span>
                        </button>
                      ) : (
                        <div
                          role="group"
                          aria-label={`Auto-évaluation de la question ${index + 1}`}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <span className="w-full text-sm text-encre-2" aria-hidden="true">
                            Vous saviez ?
                          </span>
                          <button
                            type="button"
                            aria-pressed={note === "su"}
                            onClick={() => noter(index, "su")}
                            className={`bouton min-h-10 px-3.5 text-[0.95rem] ${
                              note === "su"
                                ? "border-teste bg-teste text-white"
                                : "bouton-secondaire"
                            }`}
                          >
                            <Icone nom="valide" className="size-4" />
                            Je savais
                          </button>
                          <button
                            type="button"
                            aria-pressed={note === "revoir"}
                            onClick={() => noter(index, "revoir")}
                            className={`bouton min-h-10 px-3.5 text-[0.95rem] ${
                              note === "revoir"
                                ? "bg-surligneur text-encre"
                                : "bouton-secondaire"
                            }`}
                          >
                            <Icone nom="revoir" className="size-4" />
                            À revoir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="sans-impression mt-4 flex min-h-10 flex-wrap items-center justify-between gap-3 text-[0.95rem]">
        <p className="text-encre-2" aria-live="polite">
          {toutNote
            ? nombreSues === questions.length
              ? "Tout est su. Revenez-y dans quelques jours pour ancrer la fiche."
              : `${questions.length - nombreSues} question${
                  questions.length - nombreSues > 1 ? "s" : ""
                } à revoir : relisez l'essentiel, puis recommencez.`
            : "Répondez de tête, puis retournez le corrigé."}
        </p>
        {(nombreNotees > 0 || retournes.some(Boolean)) && (
          <button
            type="button"
            onClick={recommencer}
            className="inline-flex items-center gap-2 font-semibold text-encre-2 underline decoration-bordure-champ hover:text-encre hover:decoration-encre"
          >
            <Icone nom="recommencer" className="size-4" />
            Recommencer
          </button>
        )}
      </div>
    </section>
  );
}
