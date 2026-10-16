import type { Metadata } from "next";
import Link from "next/link";
import Icone from "@/components/Icone";
import { resumeContraintes, titreSemaine, type StatutSemaine } from "@/lib/semaine";
import { creerClientServeur } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes semaines",
};

type LigneSemaine = {
  id: string;
  debut: string;
  personnes: number;
  midi: boolean;
  temps_max_minutes: number;
  regime: string;
  statut: StatutSemaine;
};

// Une semaine qui n'est pas prête le signale à la place de la flèche
function EtatSemaine({ statut }: { statut: StatutSemaine }) {
  if (statut === "prete") return <Icone nom="suite" className="size-4 text-encre-2" />;

  return statut === "en_attente" ? (
    <span className="ligne-attente bg-papier-2 px-2 py-0.5 font-sans text-[0.8125rem] font-bold text-encre-2">
      En préparation
    </span>
  ) : (
    <span className="bg-surligneur px-2 py-0.5 font-sans text-[0.8125rem] font-bold text-encre">Échec</span>
  );
}

export default async function ListeSemaines() {
  // Pas de filtre par auteur : la Row Level Security ne renvoie que les semaines de l'utilisateur
  const supabase = await creerClientServeur();
  const { data, error } = await supabase
    .from("semaines")
    .select("id, debut, personnes, midi, temps_max_minutes, regime, statut")
    .order("created_at", { ascending: false });
  const semaines = data as LigneSemaine[] | null;

  return (
    <main className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5 border-b-2 border-filet pb-6">
        <div>
          <h1 className="archivo-large text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.98] font-extrabold tracking-tight">
            Mes semaines
          </h1>
          {semaines && semaines.length > 0 && (
            <p className="mt-3 text-lg text-encre-2">
              {semaines.length} semaine{semaines.length > 1 ? "s" : ""}, de la plus récente à la plus ancienne.
            </p>
          )}
        </div>
        <Link href="/" className="bouton bouton-principal">
          <Icone nom="plus" className="size-4" />
          Nouvelle semaine
        </Link>
      </div>

      {error && (
        <div role="alert" className="mt-10 flex gap-4 bg-surligneur-pale px-5 py-4 sm:px-6">
          <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
          <div>
            <p className="font-bold">Impossible de charger les semaines.</p>
            <p className="mt-1 text-encre-2">Rechargez la page dans quelques instants.</p>
          </div>
        </div>
      )}

      {semaines && semaines.length === 0 && (
        <div className="mt-14 max-w-xl">
          <h2 className="archivo-large text-2xl font-extrabold">Aucune semaine pour l&apos;instant.</h2>
          <p className="mt-3 text-lg text-encre-2">
            Indiquez vos contraintes et ce qu&apos;il reste dans le frigo : les repas et la liste
            de courses apparaîtront ici.
          </p>
          <Link href="/" className="bouton bouton-principal mt-7">
            Préparer ma première semaine
            <Icone nom="suite" className="size-4" />
          </Link>
        </div>
      )}

      {semaines && semaines.length > 0 && (
        <ol className="mt-10 border-t border-filet">
          {semaines.map((semaine, index) => (
            <li key={semaine.id} className="border-b border-filet-doux">
              <Link
                href={`/semaines/${semaine.id}`}
                className="group grid grid-cols-[2.75rem_1fr_auto] items-center gap-x-4 py-4 no-underline sm:grid-cols-[3rem_1fr_auto] sm:gap-x-5"
              >
                <span
                  className={`archivo-large flex size-11 items-center justify-center text-lg font-extrabold tabular-nums transition-colors duration-200 group-hover:bg-encre group-hover:text-papier sm:size-12 ${
                    semaine.statut === "prete" ? "bg-essentiel" : "bg-papier-2 text-encre-3"
                  }`}
                >
                  <span className="sr-only">Semaine n° </span>
                  {semaines.length - index}
                </span>
                <span className="min-w-0">
                  <span className="block text-[1.0625rem] leading-snug font-semibold sm:text-lg">
                    <span className="surligne">{titreSemaine(semaine.debut)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-encre-2">{resumeContraintes(semaine)}</span>
                </span>
                <EtatSemaine statut={semaine.statut} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
