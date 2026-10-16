"use client";

import { useState } from "react";
import Icone from "@/components/Icone";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function FormulaireConnexion({ erreurLien }: { erreurLien: boolean }) {
  const [email, setEmail] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState(
    erreurLien ? "Ce lien de connexion est invalide ou a expiré. Demandez-en un nouveau." : ""
  );

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");

    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setEnvoi(false);

    if (error) {
      console.error(error);
      setErreur("L'envoi du lien a échoué. Patientez quelques minutes avant de réessayer.");
      return;
    }

    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div role="status" className="puits flex gap-5 p-6 sm:p-8">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-basilic text-email">
          <Icone nom="courrier" className="size-6" />
        </span>
        <div className="min-w-0">
          <h2 className="titre-moyen text-2xl">Lien envoyé</h2>
          <p className="mt-2 text-lg">
            Un lien de connexion vient d&apos;être envoyé à <strong className="break-all">{email}</strong>.
          </p>
          <p className="mt-2 text-fonte-2">
            Ouvrez-le dans ce même navigateur : il n&apos;est valable qu&apos;une fois.
          </p>
          <button
            type="button"
            onClick={() => setEnvoye(false)}
            className="mt-5 cursor-pointer rounded-md font-semibold text-fonte-2 underline decoration-bord hover:text-fonte hover:decoration-flamme"
          >
            Utiliser une autre adresse
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-6" aria-busy={envoi}>
      <div>
        <label htmlFor="email" className="font-semibold">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          disabled={envoi}
          className="champ mt-2"
        />
      </div>

      <button
        type="submit"
        disabled={envoi || email === ""}
        className="bouton bouton-principal w-full sm:w-auto sm:self-start"
      >
        {envoi ? "Envoi en cours…" : "Recevoir un lien de connexion"}
        {!envoi && <Icone nom="suite" className="size-4" />}
      </button>

      {erreur && (
        <div role="alert" className="alerte sm:px-6">
          <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
          <p>{erreur}</p>
        </div>
      )}
    </form>
  );
}
