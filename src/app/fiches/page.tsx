import type { Metadata } from "next";
import Link from "next/link";
import Icone from "@/components/Icone";
import ScoreFiche from "@/components/ScoreFiche";
import type { StatutFiche } from "@/lib/fiche";
import { creerClientServeur } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes fiches",
};

type LigneSommaire = { id: string; titre: string; created_at: string; statut: StatutFiche };

const FUSEAU = "Europe/Paris";

function moisDe(date: string) {
  const mois = new Date(date).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: FUSEAU,
  });
  return mois.charAt(0).toUpperCase() + mois.slice(1);
}

function regrouperParMois(fiches: LigneSommaire[]) {
  const groupes: { mois: string; fiches: (LigneSommaire & { numero: number })[] }[] = [];
  fiches.forEach((fiche, index) => {
    const mois = moisDe(fiche.created_at);
    const numero = fiches.length - index;
    const dernier = groupes.at(-1);
    if (dernier && dernier.mois === mois) {
      dernier.fiches.push({ ...fiche, numero });
    } else {
      groupes.push({ mois, fiches: [{ ...fiche, numero }] });
    }
  });
  return groupes;
}

// Une fiche qui n'est pas prête le signale à la place du score
function EtatFiche({ statut }: { statut: StatutFiche }) {
  if (statut === "prete") return null;

  return statut === "en_attente" ? (
    <span className="ligne-attente bg-papier-2 px-2 py-0.5 font-sans text-[0.8125rem] font-bold text-encre-2">
      En cours de génération
    </span>
  ) : (
    <span className="bg-surligneur px-2 py-0.5 font-sans text-[0.8125rem] font-bold text-encre">
      Échec
    </span>
  );
}

export default async function ListeFiches() {
  // Pas de filtre par auteur : la Row Level Security ne renvoie que les fiches de l'utilisateur
  const supabase = await creerClientServeur();
  const { data: fiches, error } = await supabase
    .from("fiches")
    .select("id, titre, created_at, statut")
    .order("created_at", { ascending: false });

  const groupes = fiches ? regrouperParMois(fiches) : [];

  return (
    <main className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5 border-b-2 border-filet pb-6">
        <div>
          <h1 className="archivo-large text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.98] font-extrabold tracking-tight">
            Mes fiches
          </h1>
          {fiches && fiches.length > 0 && (
            <p className="mt-3 text-lg text-encre-2">
              {fiches.length} fiche{fiches.length > 1 ? "s" : ""}, de la plus récente à la
              plus ancienne.
            </p>
          )}
        </div>
        <Link href="/" className="bouton bouton-principal">
          <Icone nom="plus" className="size-4" />
          Nouvelle fiche
        </Link>
      </div>

      {error && (
        <div role="alert" className="mt-10 flex gap-4 bg-surligneur-pale px-5 py-4 sm:px-6">
          <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
          <div>
            <p className="font-bold">Impossible de charger les fiches.</p>
            <p className="mt-1 text-encre-2">Rechargez la page dans quelques instants.</p>
          </div>
        </div>
      )}

      {fiches && fiches.length === 0 && (
        <div className="mt-14 max-w-xl">
          <h2 className="archivo-large text-2xl font-extrabold">Aucune fiche pour l&apos;instant.</h2>
          <p className="mt-3 text-lg text-encre-2">
            Collez votre premier cours : sa fiche apparaîtra ici, prête à être relue et
            révisée.
          </p>
          <Link href="/" className="bouton bouton-principal mt-7">
            Créer ma première fiche
            <Icone nom="suite" className="size-4" />
          </Link>
        </div>
      )}

      {groupes.map(({ mois, fiches: fichesDuMois }, index) => (
        <section key={mois} aria-labelledby={`mois-${index}`} className="mt-12">
          <h2 id={`mois-${index}`} className="bandeau text-encre-2">
            {mois}
          </h2>
          <ol className="mt-3 border-t border-filet">
            {fichesDuMois.map((fiche) => (
              <li key={fiche.id} className="border-b border-filet-doux">
                <Link
                  href={`/fiches/${fiche.id}`}
                  className="group grid grid-cols-[2.75rem_1fr] items-center gap-x-4 gap-y-1 py-4 no-underline sm:grid-cols-[3rem_1fr_auto] sm:gap-x-5"
                >
                  <span
                    className={`archivo-large row-span-2 flex size-11 items-center justify-center text-lg font-extrabold tabular-nums transition-colors duration-200 group-hover:bg-encre group-hover:text-papier sm:row-span-1 sm:size-12 ${
                      fiche.statut === "prete" ? "bg-essentiel" : "bg-papier-2 text-encre-3"
                    }`}
                  >
                    <span className="sr-only">Fiche n° </span>
                    {fiche.numero}
                  </span>
                  <span className="flex min-w-0 items-baseline gap-4">
                    <span className="min-w-0 text-[1.0625rem] leading-snug font-semibold sm:text-lg">
                      <span className="surligne">{fiche.titre}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="points-conduite hidden h-[1em] min-w-10 flex-1 sm:block"
                    />
                  </span>
                  <span className="chiffres flex items-center gap-3 text-sm text-encre-2">
                    <EtatFiche statut={fiche.statut} />
                    <ScoreFiche idFiche={fiche.id} />
                    <time dateTime={fiche.created_at}>
                      {new Date(fiche.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        timeZone: FUSEAU,
                      })}
                    </time>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
