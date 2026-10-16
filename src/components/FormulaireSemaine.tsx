"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Icone from "@/components/Icone";
import { LIMITES, TEMPS_POSSIBLES, validerContraintes } from "@/lib/semaine";

export type ValeursFormulaire = {
  debut: string;
  personnes: number;
  budget: number;
  regime: string;
  tempsMax: number;
  midi: boolean;
};

function Chargement() {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {["bg-essentiel", "bg-teste", "bg-surligneur", "bg-papier"].map((couleur, i) => (
        <span
          key={couleur}
          className={`ligne-attente size-2 ${couleur}`}
          style={{ animationDelay: `${i * 160}ms`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

function Etiquette({ htmlFor, children, facultatif }: { htmlFor: string; children: ReactNode; facultatif?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="font-bold">
      {children}
      {facultatif && <span className="ml-2 text-sm font-normal text-encre-3">facultatif</span>}
    </label>
  );
}

export default function FormulaireSemaine({
  valeursInitiales,
  children,
}: {
  valeursInitiales: ValeursFormulaire;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [debut, setDebut] = useState(valeursInitiales.debut);
  const [personnes, setPersonnes] = useState(String(valeursInitiales.personnes));
  const [budget, setBudget] = useState(String(valeursInitiales.budget));
  const [tempsMax, setTempsMax] = useState(valeursInitiales.tempsMax);
  const [midi, setMidi] = useState(valeursInitiales.midi);
  const [regime, setRegime] = useState(valeursInitiales.regime);
  const [frigo, setFrigo] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [restantes, setRestantes] = useState<number | null>(null);
  const zoneErreur = useRef<HTMLDivElement>(null);

  function afficherErreur(message: string) {
    setErreur(message);
    requestAnimationFrame(() => zoneErreur.current?.focus());
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    const corps = {
      debut,
      personnes: Number(personnes),
      budget: Number(budget.replace(",", ".")),
      tempsMax,
      midi,
      regime,
      frigo,
    };

    // Même validation que le serveur : l'erreur s'affiche sans aller-retour
    const validation = validerContraintes(corps);
    if ("erreur" in validation) {
      afficherErreur(validation.erreur);
      return;
    }

    setEnvoi(true);
    try {
      const reponse = await fetch("/api/semaines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      const donnees = await reponse.json().catch(() => ({}));

      // Présent sur une réponse 202 comme sur une réponse 429
      const entete = reponse.headers.get("X-RateLimit-Remaining");
      if (entete !== null) setRestantes(Number(entete));

      if (!reponse.ok) {
        afficherErreur(donnees.erreur ?? "Une erreur est survenue.");
        setEnvoi(false);
        return;
      }

      // La demande est acceptée : la page de la semaine attend la fin de la génération
      router.push(`/semaines/${donnees.id}`);
    } catch {
      afficherErreur("Impossible de contacter le serveur.");
      setEnvoi(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
      <form onSubmit={envoyer} className="flex flex-col gap-6 lg:col-span-7" aria-busy={envoi} noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Etiquette htmlFor="debut">Début de la semaine</Etiquette>
            <input
              id="debut"
              type="date"
              value={debut}
              onChange={(e) => setDebut(e.target.value)}
              required
              disabled={envoi}
              className="champ chiffres mt-2 font-semibold disabled:bg-papier-2"
            />
          </div>

          <div>
            <Etiquette htmlFor="personnes">Nombre de personnes</Etiquette>
            <input
              id="personnes"
              type="number"
              inputMode="numeric"
              min={LIMITES.personnesMin}
              max={LIMITES.personnesMax}
              value={personnes}
              onChange={(e) => setPersonnes(e.target.value)}
              required
              disabled={envoi}
              className="champ chiffres mt-2 font-semibold disabled:bg-papier-2"
            />
          </div>

          <div>
            <Etiquette htmlFor="budget">Budget pour la semaine</Etiquette>
            <div className="relative mt-2">
              <input
                id="budget"
                type="number"
                inputMode="decimal"
                min={LIMITES.budgetMin}
                max={LIMITES.budgetMax}
                step="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                disabled={envoi}
                className="champ chiffres pr-10 font-semibold disabled:bg-papier-2"
              />
              <span aria-hidden="true" className="absolute inset-y-0 right-4 flex items-center font-bold text-encre-2">
                €
              </span>
            </div>
          </div>

          <div>
            <Etiquette htmlFor="temps">Temps maximal par repas</Etiquette>
            <select
              id="temps"
              value={tempsMax}
              onChange={(e) => setTempsMax(Number(e.target.value))}
              disabled={envoi}
              className="champ chiffres mt-2 cursor-pointer font-semibold disabled:bg-papier-2"
            >
              {TEMPS_POSSIBLES.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="font-bold">Repas à prévoir</legend>
          <div role="group" className="mt-2 inline-flex border-2 border-encre">
            {(
              [
                { valeur: false, libelle: "Le soir", detail: "7 repas" },
                { valeur: true, libelle: "Midi et soir", detail: "14 repas" },
              ] as const
            ).map(({ valeur, libelle, detail }) => (
              <button
                key={libelle}
                type="button"
                onClick={() => setMidi(valeur)}
                aria-pressed={midi === valeur}
                disabled={envoi}
                className={`min-h-11 cursor-pointer px-4 text-[0.95rem] font-bold transition-colors disabled:cursor-not-allowed ${
                  midi === valeur ? "bg-encre text-papier" : "bg-papier text-encre hover:bg-surligneur"
                }`}
              >
                {libelle}
                <span className={`chiffres ml-2 font-normal ${midi === valeur ? "text-papier/75" : "text-encre-3"}`}>
                  {detail}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <Etiquette htmlFor="regime" facultatif>
              Régime et allergies
            </Etiquette>
            <span className="chiffres text-sm text-encre-3" aria-hidden="true">
              {regime.length} / {LIMITES.regimeMax}
            </span>
          </div>
          <input
            id="regime"
            value={regime}
            onChange={(e) => setRegime(e.target.value)}
            maxLength={LIMITES.regimeMax}
            placeholder="Ex. : végétarien, sans arachides"
            autoComplete="off"
            disabled={envoi}
            className="champ mt-2 disabled:bg-papier-2"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <Etiquette htmlFor="frigo" facultatif>
              Ce qu&apos;il reste dans le frigo
            </Etiquette>
            <span className="chiffres text-sm text-encre-3" aria-hidden="true">
              {frigo.length} / {LIMITES.frigoMax}
            </span>
          </div>
          <textarea
            id="frigo"
            value={frigo}
            onChange={(e) => setFrigo(e.target.value)}
            maxLength={LIMITES.frigoMax}
            placeholder={"Un produit par ligne, avec sa quantité si possible :\n3 courgettes\n200 g de lardons\n1 kg de riz"}
            aria-describedby="frigo-aide"
            disabled={envoi}
            className="champ mt-2 h-40 resize-y disabled:bg-papier-2"
          />
          <p id="frigo-aide" className="mt-2 text-sm text-encre-2">
            Ces produits sont utilisés en priorité, puis retirés de la liste de courses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="submit"
            disabled={envoi}
            className="bouton bouton-principal w-full disabled:cursor-wait disabled:border-encre disabled:bg-encre disabled:text-papier sm:w-auto sm:min-w-64"
          >
            {envoi ? (
              <>
                <Chargement />
                Enregistrement de la demande…
              </>
            ) : (
              "Composer la semaine"
            )}
          </button>
          {restantes !== null && (
            <p className="text-sm text-encre-2">
              {restantes > 0
                ? `Encore ${restantes} semaine${restantes > 1 ? "s" : ""} possible${restantes > 1 ? "s" : ""} cette heure-ci.`
                : "Quota atteint pour l'heure en cours."}
            </p>
          )}
        </div>

        {erreur && (
          <div
            ref={zoneErreur}
            tabIndex={-1}
            role="alert"
            className="flex gap-4 bg-surligneur-pale px-5 py-4 outline-none sm:px-6"
          >
            <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-bold">La semaine n&apos;a pas pu être lancée</p>
              <p className="mt-1 text-encre-2">{erreur}</p>
            </div>
          </div>
        )}
      </form>

      {children && <div className="lg:col-span-5">{children}</div>}
    </div>
  );
}
