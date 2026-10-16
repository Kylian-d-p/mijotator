"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icone from "@/components/Icone";
import SqueletteSemaine from "@/components/SqueletteSemaine";
import { creerClientNavigateur } from "@/lib/supabase/client";

const DELAI_MAX_MS = 90000;

// Attend en temps réel la fin de la génération, puis recharge la page côté serveur
export default function AttenteSemaine({ id }: { id: string }) {
  const router = useRouter();
  const [interrompue, setInterrompue] = useState("");

  useEffect(() => {
    const supabase = creerClientNavigateur();
    const canal = supabase.channel(`semaine-${id}`);
    let termine = false;

    function terminer() {
      if (termine) return;
      termine = true;
      clearTimeout(minuteur);
      supabase.removeChannel(canal);
      router.refresh();
    }

    const minuteur = setTimeout(() => {
      termine = true;
      supabase.removeChannel(canal);
      setInterrompue("La préparation prend plus de temps que prévu. Rechargez la page dans quelques instants.");
    }, DELAI_MAX_MS);

    async function ecouter() {
      // L'abonnement doit être fait au nom de l'utilisateur, pour que la Row Level Security
      // autorise la réception des événements
      await supabase.auth.getSession();

      canal
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "semaines", filter: `id=eq.${id}` },
          (evenement) => {
            if ((evenement.new as { statut: string }).statut !== "en_attente") terminer();
          }
        )
        .subscribe(async (statut) => {
          if (statut === "SUBSCRIBED") {
            // La génération a pu se terminer avant l'abonnement : on vérifie une fois l'état actuel
            const { data } = await supabase.from("semaines").select("statut").eq("id", id).maybeSingle();
            if (data && data.statut !== "en_attente") terminer();
          }

          if (statut === "CHANNEL_ERROR" || statut === "TIMED_OUT") {
            termine = true;
            clearTimeout(minuteur);
            setInterrompue(
              "La connexion en temps réel a échoué. Rechargez la page dans quelques instants pour voir votre semaine."
            );
          }
        });
    }

    ecouter();

    return () => {
      termine = true;
      clearTimeout(minuteur);
      supabase.removeChannel(canal);
    };
  }, [id, router]);

  return (
    <div>
      {interrompue ? (
        <div role="status" className="mb-8 flex max-w-3xl gap-4 border-2 border-filet px-5 py-4 sm:px-6">
          <Icone nom="revoir" className="mt-0.5 size-6 shrink-0" />
          <div>
            <p className="font-bold">La semaine est toujours en préparation</p>
            <p className="mt-1 text-encre-2">{interrompue}</p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 font-semibold underline"
            >
              <Icone nom="recommencer" className="size-4" />
              Recharger
            </button>
          </div>
        </div>
      ) : (
        <p role="status" className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-encre-2">
          <span className="archivo-large text-2xl font-extrabold text-encre">Composition des repas</span>
          <span className="sr-only">en cours. </span>
          Quelques secondes en général. Vous pouvez quitter cette page : un e-mail vous préviendra.
        </p>
      )}
      <SqueletteSemaine />
    </div>
  );
}
