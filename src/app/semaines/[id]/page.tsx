import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import AttenteSemaine from "@/components/AttenteSemaine";
import BandeauPage from "@/components/BandeauPage";
import GrilleRepas, { type RepasEnregistre } from "@/components/GrilleRepas";
import Icone from "@/components/Icone";
import LienCourses from "@/components/LienCourses";
import { resumeContraintes, titreSemaine, type Creneau, type StatutSemaine } from "@/lib/semaine";
import { creerClientServeur } from "@/lib/supabase/server";

type SemaineDetaillee = {
  id: string;
  debut: string;
  personnes: number;
  budget_euros: number;
  regime: string;
  temps_max_minutes: number;
  creneaux: Creneau[];
  statut: StatutSemaine;
  message_erreur: string | null;
  cout_estime: number | null;
};

// Partagé entre generateMetadata et la page : une seule requête par rendu.
// La Row Level Security ne renvoie la semaine qu'à son auteur : sinon, page 404.
const chargerSemaine = cache(async (id: string) => {
  const supabase = await creerClientServeur();
  const { data: semaine } = await supabase
    .from("semaines")
    .select("id, debut, personnes, budget_euros, regime, temps_max_minutes, creneaux, statut, message_erreur, cout_estime")
    .eq("id", id)
    .maybeSingle<SemaineDetaillee>();

  return semaine;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const semaine = await chargerSemaine(id);
  return { title: semaine ? titreSemaine(semaine.debut) : "Semaine introuvable" };
}

const formatEuros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default async function DetailSemaine({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const semaine = await chargerSemaine(id);

  if (!semaine) {
    notFound();
  }

  const prete = semaine.statut === "prete";
  let repas: RepasEnregistre[] = [];
  let articles = 0;
  let coches = 0;

  if (prete) {
    const supabase = await creerClientServeur();
    const [resultatRepas, resultatArticles] = await Promise.all([
      supabase
        .from("repas")
        .select("id, jour, moment, titre, temps_minutes, ingredients, etapes")
        .eq("semaine_id", id)
        .order("jour")
        .order("moment"),
      supabase.from("articles_courses").select("coche").eq("semaine_id", id),
    ]);

    repas = (resultatRepas.data ?? []) as RepasEnregistre[];
    articles = resultatArticles.data?.length ?? 0;
    coches = resultatArticles.data?.filter((a) => a.coche).length ?? 0;
  }

  return (
    <main>
      <BandeauPage
        titre={titreSemaine(semaine.debut)}
        retour={{ href: "/semaines", libelle: "Mes semaines" }}
        actions={
          prete && (
            <LienCourses semaineId={id} articles={articles} coches={coches} />
          )
        }
      >
        <p className="mt-4 text-lg">{resumeContraintes(semaine)}</p>
        <p className="chiffres mt-1">
          Budget {formatEuros.format(Number(semaine.budget_euros))}
          {semaine.cout_estime !== null && (
            <> · environ {formatEuros.format(Number(semaine.cout_estime))} d&apos;ingrédients (estimation)</>
          )}
        </p>
      </BandeauPage>

      <div className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        {prete && <GrilleRepas repas={repas} debut={semaine.debut} />}

        {semaine.statut === "en_attente" && <AttenteSemaine id={semaine.id} creneaux={semaine.creneaux} debut={semaine.debut} />}

        {semaine.statut === "erreur" && (
          <div role="alert" className="alerte max-w-3xl sm:px-6 sm:py-5">
            <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-bold">La préparation de cette semaine a échoué</p>
              <p className="mt-1 text-fonte-2">{semaine.message_erreur ?? "Erreur inconnue."}</p>
              <Link href="/" className="mt-3 inline-flex items-center gap-2 rounded-md font-semibold text-fonte decoration-flamme">
                Préparer une nouvelle semaine
                <Icone nom="suite" className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
