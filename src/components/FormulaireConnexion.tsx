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
      <div role="status" className="mt-10 border-2 border-filet">
        <h2 className="bandeau flex items-center gap-3 bg-encre px-5 py-3 text-papier sm:px-7">
          <Icone nom="courrier" className="size-5" />
          Lien envoyé
        </h2>
        <div className="p-5 sm:p-7">
          <p className="text-lg">
            Un lien de connexion vient d&apos;être envoyé à{" "}
            <strong className="surligne surligne-toujours break-all">{email}</strong>.
          </p>
          <p className="mt-2 text-encre-2">
            Ouvrez-le dans ce même navigateur : il n&apos;est valable qu&apos;une fois.
          </p>
          <button
            type="button"
            onClick={() => setEnvoye(false)}
            className="mt-5 cursor-pointer font-semibold text-encre-2 underline decoration-filet-doux hover:text-encre hover:decoration-encre"
          >
            Utiliser une autre adresse
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className="mt-10 flex flex-col gap-6" aria-busy={envoi}>
      <div>
        <label htmlFor="email" className="font-bold">
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
          className="champ mt-2 disabled:bg-papier-2"
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
        <div role="alert" className="flex gap-4 bg-surligneur-pale px-5 py-4 sm:px-6">
          <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
          <p className="text-encre">{erreur}</p>
        </div>
      )}
    </form>
  );
}
