import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import AttenteSemaine from "@/components/AttenteSemaine";
import GrilleRepas, { type RepasEnregistre } from "@/components/GrilleRepas";
import Icone from "@/components/Icone";
import { resumeContraintes, titreSemaine, type StatutSemaine } from "@/lib/semaine";
import { creerClientServeur } from "@/lib/supabase/server";

type SemaineDetaillee = {
  id: string;
  debut: string;
  personnes: number;
  budget_euros: number;
  regime: string;
  temps_max_minutes: number;
  midi: boolean;
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
    .select("id, debut, personnes, budget_euros, regime, temps_max_minutes, midi, statut, message_erreur, cout_estime")
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
    <main className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
      <Link
        href="/semaines"
        className="sans-impression inline-flex items-center gap-2 font-semibold text-encre-2 no-underline hover:text-encre"
      >
        <Icone nom="retour" className="size-4" />
        Mes semaines
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-6 border-b-2 border-filet pb-7 sm:mt-8">
        <div className="min-w-0">
          <h1 className="archivo-large text-[clamp(1.875rem,4.6vw,3.25rem)] leading-[1.04] font-extrabold tracking-tight">
            {titreSemaine(semaine.debut)}
          </h1>
          <p className="mt-3 text-encre-2">{resumeContraintes(semaine)}</p>
          <p className="chiffres mt-1 text-encre-2">
            Budget {formatEuros.format(Number(semaine.budget_euros))}
            {semaine.cout_estime !== null && (
              <> · environ {formatEuros.format(Number(semaine.cout_estime))} d&apos;ingrédients (estimation)</>
            )}
          </p>
        </div>

        {prete && (
          <Link
            href={`/semaines/${id}/courses`}
            className="group flex w-full items-center gap-4 border-2 border-encre bg-teste-pale px-5 py-3 no-underline transition-colors hover:bg-surligneur sm:w-auto"
          >
            <Icone nom="panier" className="size-6 shrink-0" />
            <span className="flex-1">
              <span className="block font-bold">Liste de courses</span>
              <span className="chiffres text-sm text-encre-2 group-hover:text-encre">
                {articles === 0
                  ? "Rien à acheter"
                  : `${articles} article${articles > 1 ? "s" : ""} · ${coches} coché${coches > 1 ? "s" : ""}`}
              </span>
            </span>
            <Icone nom="suite" className="size-4 shrink-0" />
          </Link>
        )}
      </header>

      <div className="mt-8 sm:mt-10">
        {prete && <GrilleRepas repas={repas} debut={semaine.debut} />}

        {semaine.statut === "en_attente" && <AttenteSemaine id={semaine.id} />}

        {semaine.statut === "erreur" && (
          <div role="alert" className="flex max-w-3xl gap-4 bg-surligneur-pale px-5 py-4 sm:px-6">
            <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-bold">La préparation de cette semaine a échoué</p>
              <p className="mt-1 text-encre-2">{semaine.message_erreur ?? "Erreur inconnue."}</p>
              <Link href="/" className="mt-3 inline-flex items-center gap-2 font-semibold">
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
