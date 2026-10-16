import type { Metadata } from "next";
import Link from "next/link";
import BandeauPage from "@/components/BandeauPage";
import Icone from "@/components/Icone";
import MiniPlanning from "@/components/MiniPlanning";
import SommaireSemaines, { type LigneSemaine } from "@/components/SommaireSemaines";
import { creerClientServeur } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes semaines",
};

export default async function ListeSemaines() {
  // Pas de filtre par auteur : la Row Level Security ne renvoie que les semaines de l'utilisateur
  const supabase = await creerClientServeur();
  const { data, error } = await supabase
    .from("semaines")
    .select("id, debut, personnes, creneaux, temps_max_minutes, regime, statut")
    .order("created_at", { ascending: false });
  const semaines = data as LigneSemaine[] | null;

  return (
    <main>
      <BandeauPage
        titre="Mes semaines"
        actions={
          <Link href="/" className="bouton bouton-clair w-full sm:w-auto">
            <Icone nom="plus" className="size-4" />
            Nouvelle semaine
          </Link>
        }
      >
        {semaines && semaines.length > 0 && (
          <p className="mt-4 text-lg">
            {semaines.length} semaine{semaines.length > 1 ? "s" : ""}, de la plus récente à la plus ancienne.
          </p>
        )}
      </BandeauPage>

      <div className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        {error && (
          <div role="alert" className="alerte sm:px-6">
            <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-bold">Impossible de charger les semaines.</p>
              <p className="mt-1 text-fonte-2">Rechargez la page dans quelques instants.</p>
            </div>
          </div>
        )}

        {semaines && semaines.length === 0 && (
          <div className="puits grid max-w-3xl items-center gap-6 p-6 sm:grid-cols-[9rem_1fr] sm:gap-8 sm:p-8">
            <div className="w-36 rounded-2xl bg-email p-3 sm:w-full">
              <MiniPlanning creneaux={[]} />
            </div>
            <div>
              <h2 className="titre-moyen text-2xl">Aucune semaine pour l&apos;instant.</h2>
              <p className="mt-2 text-lg text-fonte-2">
                Indiquez vos contraintes et ce qu&apos;il reste dans le frigo : les repas et la liste
                de courses apparaîtront ici.
              </p>
              <Link href="/" className="bouton bouton-principal mt-6">
                Préparer ma première semaine
                <Icone nom="suite" className="size-4" />
              </Link>
            </div>
          </div>
        )}

        {semaines && semaines.length > 0 && (
          <SommaireSemaines semaines={semaines} />
        )}
      </div>
    </main>
  );
}
