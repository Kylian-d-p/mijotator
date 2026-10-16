import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BandeauPage from "@/components/BandeauPage";
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
    <main>
      <BandeauPage
        titre="Liste de courses"
        retour={{ href: `/semaines/${id}`, libelle: titreSemaine(semaine.debut) }}
        actions={articles.length > 0 && <BoutonImprimer className="bouton-clair" />}
      >
        <p className="mt-3 text-lg">{titreSemaine(semaine.debut)}</p>
      </BandeauPage>

      <div className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        <ListeCourses semaineId={id} articlesInitiaux={articles} />

        {frigo.length > 0 && (
          <section aria-labelledby="frigo" className="mt-4 max-w-3xl rounded-3xl bg-givre px-6 py-6 sm:px-8">
            <h2 id="frigo" className="titre-moyen flex items-center gap-2.5 text-xl text-givre-fonce">
              <Icone nom="flocon" className="size-5" />
              Déjà dans votre frigo
            </h2>
            <p className="mt-2 text-fonte-2">
              Utilisé dans les repas et retiré de la liste, dans la limite de ces quantités :
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {frigo.map((produit, i) => (
                <li
                  key={i}
                  className="rounded-full bg-email px-3.5 py-1.5 text-[0.95rem] shadow-[inset_0_0_0_1.5px_var(--givre-bord)]"
                >
                  {produit.nom}{" "}
                  <span className="chiffres font-medium text-givre-fonce">
                    {afficherQuantite(produit.quantite, produit.unite)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
