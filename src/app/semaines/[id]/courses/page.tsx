import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BoutonImprimer from "@/components/BoutonImprimer";
import Icone from "@/components/Icone";
import ListeCourses, { type ArticleEnregistre } from "@/components/ListeCourses";
import { afficherQuantite, RAYONS, titreSemaine, type Produit } from "@/lib/semaine";
import { creerClientServeur } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Liste de courses",
};

export default async function Courses({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // La Row Level Security ne renvoie la semaine et ses articles qu'à leur auteur
  const supabase = await creerClientServeur();
  const { data: semaine } = await supabase
    .from("semaines")
    .select("id, debut, statut, frigo_releve")
    .eq("id", id)
    .maybeSingle<{ id: string; debut: string; statut: string; frigo_releve: Produit[] | null }>();

  if (!semaine) {
    notFound();
  }

  if (semaine.statut !== "prete") {
    redirect(`/semaines/${id}`);
  }

  const { data } = await supabase
    .from("articles_courses")
    .select("id, nom, quantite, unite, rayon, coche")
    .eq("semaine_id", id)
    .order("nom");

  const articles = ((data ?? []) as ArticleEnregistre[])
    .map((a) => ({ ...a, quantite: Number(a.quantite) }))
    .sort((a, b) => RAYONS.indexOf(a.rayon) - RAYONS.indexOf(b.rayon));
  const frigo = semaine.frigo_releve ?? [];

  return (
    <main className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
      <Link
        href={`/semaines/${id}`}
        className="sans-impression inline-flex items-center gap-2 font-semibold text-encre-2 no-underline hover:text-encre"
      >
        <Icone nom="retour" className="size-4" />
        {titreSemaine(semaine.debut)}
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b-2 border-filet pb-7 sm:mt-8">
        <div>
          <h1 className="archivo-large text-[clamp(1.875rem,4.6vw,3.25rem)] leading-[1.04] font-extrabold tracking-tight">
            Liste de courses
          </h1>
          <p className="mt-3 text-encre-2">{titreSemaine(semaine.debut)}</p>
        </div>
        {articles.length > 0 && <BoutonImprimer />}
      </header>

      <div className="mt-8 sm:mt-10">
        <ListeCourses semaineId={id} articlesInitiaux={articles} />
      </div>

      {frigo.length > 0 && (
        <section aria-labelledby="frigo" className="mt-12 max-w-3xl border-t border-filet-doux pt-6">
          <h2 id="frigo" className="bandeau text-encre-2">
            Déjà dans votre frigo
          </h2>
          <p className="mt-2 text-encre-2">Utilisé dans les repas et retiré de la liste, dans la limite de ces quantités :</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {frigo.map((produit, i) => (
              <li key={i} className="border border-filet-doux px-3 py-1 text-[0.95rem]">
                {produit.nom}{" "}
                <span className="chiffres text-encre-2">{afficherQuantite(produit.quantite, produit.unite)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
