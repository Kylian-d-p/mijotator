"use client";

import { useEffect, useState } from "react";
import Icone, { type NomIcone } from "@/components/Icone";
import type { ResultatControle, Statut } from "@/lib/statut";

type ReponseStatut = {
  verifieLe: string;
  statutGlobal: Statut;
  services: ResultatControle[];
};

// Le jaune est le signal d'état : pâle pour un service lent, plein pour une panne.
const AFFICHAGE: Record<Statut, { libelle: string; icone: NomIcone; classes: string }> = {
  operationnel: { libelle: "Opérationnel", icone: "valide", classes: "text-encre" },
  degrade: { libelle: "Dégradé", icone: "revoir", classes: "bg-surligneur-pale text-encre" },
  en_panne: { libelle: "En panne", icone: "attention", classes: "bg-surligneur text-encre" },
};

const MESSAGE_GLOBAL: Record<Statut, string> = {
  operationnel: "Tous les services sont opérationnels.",
  degrade: "Au moins un service répond lentement.",
  en_panne: "Au moins un service est en panne.",
};

async function recupererStatut(): Promise<ReponseStatut> {
  const reponse = await fetch("/api/admin/statut", { cache: "no-store" });
  if (!reponse.ok) {
    throw new Error(`Statut ${reponse.status}`);
  }
  return reponse.json();
}

export default function TableauStatut() {
  const [donnees, setDonnees] = useState<ReponseStatut | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [messageTest, setMessageTest] = useState("");

  function actualiser() {
    setChargement(true);
    recupererStatut()
      .then((resultat) => {
        setDonnees(resultat);
        setErreur("");
      })
      .catch(() => setErreur("Impossible de joindre la route de statut."))
      .finally(() => setChargement(false));
  }

  async function envoyerErreurTest() {
    setMessageTest("Envoi…");
    try {
      const reponse = await fetch("/api/admin/erreur-test", { method: "POST" });
      setMessageTest(
        reponse.status === 500
          ? "Erreur de test envoyée : elle doit apparaître dans Sentry d'ici quelques secondes."
          : `Réponse inattendue (statut ${reponse.status}).`
      );
    } catch {
      setMessageTest("Impossible de joindre la route d'erreur de test.");
    }
  }

  useEffect(() => {
    recupererStatut()
      .then(setDonnees)
      .catch(() => setErreur("Impossible de joindre la route de statut."))
      .finally(() => setChargement(false));
  }, []);

  const global = donnees ? AFFICHAGE[donnees.statutGlobal] : null;

  return (
    <main className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5 border-b-2 border-filet pb-6">
        <div>
          <h1 className="archivo-large text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.98] font-extrabold tracking-tight">
            Administration
          </h1>
          <p className="mt-3 text-lg text-encre-2">
            État des services cloud dont dépend Revizator.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button type="button" onClick={envoyerErreurTest} className="bouton bouton-secondaire">
            <Icone nom="attention" className="size-4" />
            Envoyer une erreur de test
          </button>
          <button
            type="button"
            onClick={actualiser}
            disabled={chargement}
            className="bouton bouton-secondaire"
          >
            <Icone nom="recommencer" className="size-4" />
            {chargement ? "Vérification…" : "Relancer les tests"}
          </button>
        </div>
      </div>

      {messageTest && (
        <p role="status" className="mt-4 text-sm text-encre-2">
          {messageTest}
        </p>
      )}

      {erreur && (
        <div role="alert" className="mt-10 flex gap-4 bg-surligneur-pale px-5 py-4 sm:px-6">
          <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
          <p className="font-bold">{erreur}</p>
        </div>
      )}

      {!donnees && chargement && (
        <div className="mt-10" aria-hidden="true">
          <div className="ligne-attente h-14 bg-papier-2" />
          <div className="mt-8 border-t border-filet">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-5 border-b border-filet-doux py-5">
                <div
                  className="ligne-attente h-4 bg-papier-2"
                  style={{ width: `${[34, 26, 40, 30, 36, 28][i]}%`, animationDelay: `${i * 110}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {donnees && global && (
        <>
          <p
            role="status"
            className={`mt-10 flex items-center gap-3 px-5 py-4 text-lg font-bold sm:px-6 ${
              donnees.statutGlobal === "operationnel" ? "border-2 border-filet" : global.classes
            }`}
          >
            <Icone nom={global.icone} className="size-6 shrink-0" />
            {MESSAGE_GLOBAL[donnees.statutGlobal]}
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-filet">
                  <th scope="col" className="bandeau py-3 pr-4 text-base text-encre-2">
                    Service
                  </th>
                  <th scope="col" className="bandeau py-3 pr-4 text-base text-encre-2">
                    Statut
                  </th>
                  <th scope="col" className="bandeau py-3 pr-4 text-right text-base text-encre-2">
                    Réponse
                  </th>
                  <th scope="col" className="bandeau py-3 text-base text-encre-2">
                    Détail
                  </th>
                </tr>
              </thead>
              <tbody>
                {donnees.services.map((s) => {
                  const affichage = AFFICHAGE[s.statut];
                  return (
                    <tr key={s.service} className="border-b border-filet-doux align-top">
                      <td className="py-4 pr-4">
                        <p className="font-bold">{s.service}</p>
                        <p className="text-sm text-encre-2">{s.description}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.8125rem] font-bold whitespace-nowrap ${affichage.classes}`}
                        >
                          <Icone nom={affichage.icone} className="size-4" />
                          {affichage.libelle}
                        </span>
                      </td>
                      <td className="chiffres py-4 pr-4 text-right text-sm whitespace-nowrap text-encre-2">
                        {s.latenceMs} ms
                      </td>
                      <td className="py-4 text-[0.95rem] break-words text-encre-2">{s.message}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-sm text-encre-2">
            Dernière vérification :{" "}
            <time dateTime={donnees.verifieLe} className="chiffres">
              {new Date(donnees.verifieLe).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}
            </time>
          </p>
        </>
      )}
    </main>
  );
}
