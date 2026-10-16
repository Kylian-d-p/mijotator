import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import AffichageFiche from "@/components/AffichageFiche";
import BoutonImprimer from "@/components/BoutonImprimer";
import Icone from "@/components/Icone";
import type { FicheEnregistree } from "@/lib/fiche";
import { creerClientServeur } from "@/lib/supabase/server";

type FicheDetaillee = FicheEnregistree & { fichier_chemin: string | null };

// Partagé entre generateMetadata et la page : une seule requête par rendu.
// La Row Level Security ne renvoie la fiche qu'à son auteur : sinon, page 404.
const chargerFiche = cache(async (id: string) => {
  const supabase = await creerClientServeur();
  const { data: fiche } = await supabase
    .from("fiches")
    .select("id, titre, synthese, questions, created_at, fichier_chemin, statut, message_erreur")
    .eq("id", id)
    .maybeSingle<FicheDetaillee>();

  return fiche;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const fiche = await chargerFiche(id);
  return { title: fiche?.titre ?? "Fiche introuvable" };
}

export default async function DetailFiche({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fiche = await chargerFiche(id);

  if (!fiche) {
    notFound();
  }

  const supabase = await creerClientServeur();

  // Numéro de la fiche dans le sommaire de l'utilisateur (la plus ancienne porte le n° 1)
  const { count: numero } = await supabase
    .from("fiches")
    .select("id", { count: "exact", head: true })
    .lte("created_at", fiche.created_at);

  // URL signée : le cours d'origine reste téléchargeable 5 minutes, sans rendre le bucket public
  let lienPdf: string | null = null;
  if (fiche.fichier_chemin) {
    const { data } = await supabase.storage
      .from("cours")
      .createSignedUrl(fiche.fichier_chemin, 300);
    lienPdf = data?.signedUrl ?? null;
  }

  const dateCreation = new Date(fiche.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });

  const prete = fiche.statut === "prete";

  return (
    <main className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
      <Link
        href="/fiches"
        className="sans-impression inline-flex items-center gap-2 font-semibold text-encre-2 no-underline hover:text-encre"
      >
        <Icone nom="retour" className="size-4" />
        Mes fiches
      </Link>

      <header className="mt-6 flex items-start gap-5 border-b-2 border-filet pb-7 sm:mt-8 sm:gap-7">
        {numero ? (
          <span
            aria-hidden="true"
            className={`archivo-large flex size-14 shrink-0 items-center justify-center text-2xl font-extrabold tabular-nums sm:size-24 sm:text-5xl ${
              prete ? "bg-essentiel" : "bg-papier-2 text-encre-3"
            }`}
          >
            {numero}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="archivo-large text-[clamp(1.875rem,4.6vw,3.25rem)] leading-[1.04] font-extrabold tracking-tight break-words">
            {fiche.titre}
          </h1>
          <p className="chiffres mt-3 text-encre-2">
            {numero ? `Fiche n° ${numero} · ` : ""}créée le {dateCreation}
          </p>
          {lienPdf && (
            <a
              href={lienPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="sans-impression mt-3 inline-flex items-center gap-2 font-semibold"
            >
              <Icone nom="document" className="size-4" />
              Cours d&apos;origine (PDF)
            </a>
          )}
        </div>
        {prete && <BoutonImprimer className="hidden md:inline-flex" />}
      </header>

      <div className="mt-8 sm:mt-10">
        {prete && <AffichageFiche fiche={fiche} />}

        {fiche.statut === "en_attente" && (
          <div role="status" className="flex max-w-3xl gap-4 border-2 border-filet px-5 py-4 sm:px-6">
            <Icone nom="revoir" className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-bold">Fiche en cours de génération</p>
              <p className="mt-1 text-encre-2">
                Rechargez la page dans quelques instants : la synthèse et les questions
                apparaîtront ici.
              </p>
            </div>
          </div>
        )}

        {fiche.statut === "erreur" && (
          <div role="alert" className="flex max-w-3xl gap-4 bg-surligneur-pale px-5 py-4 sm:px-6">
            <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-bold">La génération de cette fiche a échoué</p>
              <p className="mt-1 text-encre-2">{fiche.message_erreur ?? "Erreur inconnue."}</p>
              <Link href="/" className="mt-3 inline-flex items-center gap-2 font-semibold">
                Réessayer avec une nouvelle fiche
                <Icone nom="suite" className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
