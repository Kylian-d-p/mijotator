"use client";

import Icone from "@/components/Icone";
import SelecteurCreneaux from "@/components/SelecteurCreneaux";
import { LIMITES, TEMPS_POSSIBLES, validerContraintes, type Creneau } from "@/lib/semaine";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";

export type ValeursFormulaire = {
  debut: string;
  personnes: number;
  budget: number;
  regime: string;
  tempsMax: number;
  creneaux: Creneau[];
};

// Trois bulles qui frémissent pendant l'envoi
function Chargement() {
  return (
    <span className="flex h-4 items-end gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className="bulle size-1.5 rounded-full bg-flamme" style={{ animationDelay: `${i * 220}ms` }} />
      ))}
    </span>
  );
}

function Etiquette({ htmlFor, children, facultatif }: { htmlFor: string; children: ReactNode; facultatif?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="font-semibold">
      {children}
      {facultatif && <span className="ml-2 text-sm font-normal whitespace-nowrap text-fonte-3">facultatif</span>}
    </label>
  );
}

export default function FormulaireSemaine({ valeursInitiales, children }: { valeursInitiales: ValeursFormulaire; children?: ReactNode }) {
  const router = useRouter();
  const [debut, setDebut] = useState(valeursInitiales.debut);
  const [personnes, setPersonnes] = useState(String(valeursInitiales.personnes));
  const [budget, setBudget] = useState(String(valeursInitiales.budget));
  const [tempsMax, setTempsMax] = useState(valeursInitiales.tempsMax);
  const [creneaux, setCreneaux] = useState(valeursInitiales.creneaux);
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
      creneaux,
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
            <Etiquette htmlFor="debut">Premier repas du programme</Etiquette>
            <input
              id="debut"
              type="date"
              value={debut}
              onChange={(e) => setDebut(e.target.value)}
              required
              disabled={envoi}
              className="champ chiffres mt-2 font-semibold"
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
              className="champ chiffres mt-2 font-semibold"
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
                className="champ chiffres pr-10 font-semibold"
              />
              <span aria-hidden="true" className="absolute inset-y-0 right-4 flex items-center font-bold text-fonte-2">
                €
              </span>
            </div>
          </div>

          <div>
            <Etiquette htmlFor="temps">Temps de préparation maximal</Etiquette>
            <div className="relative mt-2">
              <select
                id="temps"
                value={tempsMax}
                onChange={(e) => setTempsMax(Number(e.target.value))}
                disabled={envoi}
                className="champ chiffres cursor-pointer appearance-none pr-12 font-semibold"
              >
                {TEMPS_POSSIBLES.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes par repas
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-fonte-2">
                <Icone nom="deroulant" />
              </span>
            </div>
          </div>
        </div>

        <SelecteurCreneaux debut={debut} valeur={creneaux} onChange={setCreneaux} disabled={envoi} />

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <Etiquette htmlFor="regime" facultatif>
              Régime et allergies
            </Etiquette>
            <span className="chiffres text-sm whitespace-nowrap text-fonte-3" aria-hidden="true">
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
            className="champ mt-2"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <Etiquette htmlFor="frigo" facultatif>
              <Icone nom="flocon" className="mr-1.5 inline size-4 align-[-2px] text-givre-fonce" />
              Ce qu&apos;il reste dans le frigo
            </Etiquette>
            <span className="chiffres text-sm whitespace-nowrap text-fonte-3" aria-hidden="true">
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
            className="champ mt-2 h-40 resize-y"
          />
          <p id="frigo-aide" className="mt-2 text-sm text-givre-fonce">
            Ces produits sont utilisés en priorité, puis retirés de la liste de courses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="submit"
            disabled={envoi}
            className="bouton bouton-principal w-full disabled:cursor-wait disabled:bg-fonte disabled:text-email disabled:shadow-none sm:w-auto sm:min-w-64"
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
            <p className="chiffres text-sm text-fonte-2">
              {restantes > 0
                ? `Encore ${restantes} semaine${restantes > 1 ? "s" : ""} possible${restantes > 1 ? "s" : ""} cette heure-ci.`
                : "Quota atteint pour l'heure en cours."}
            </p>
          )}
        </div>

        {erreur && (
          <div ref={zoneErreur} tabIndex={-1} role="alert" className="alerte outline-none sm:px-6">
            <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-bold">La semaine n&apos;a pas pu être lancée</p>
              <p className="mt-1 text-fonte-2">{erreur}</p>
            </div>
          </div>
        )}
      </form>

      {children && <div className="lg:col-span-5">{children}</div>}
    </div>
  );
}
