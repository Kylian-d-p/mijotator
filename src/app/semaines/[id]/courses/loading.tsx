"use client";

import { useParams } from "next/navigation";
import BandeauPage from "@/components/BandeauPage";

// Textes modèles des rayons : invisibles, ils donnent à chaque silhouette la taille d'un vrai rayon
const RAYONS_MODELES = [
  { rayon: "Fruits et légumes", articles: [["courgettes", "600 g"], ["tomates", "4"], ["oignons", "3"], ["citron", "1"], ["salade", "1"]] },
  { rayon: "Viandes et poissons", articles: [["blancs de poulet", "400 g"], ["saumon", "250 g"]] },
  { rayon: "Crèmerie et œufs", articles: [["œufs", "6"], ["crème fraîche", "200 ml"], ["chèvre frais", "150 g"]] },
  { rayon: "Épicerie", articles: [["pois chiches", "400 g"], ["riz basmati", "500 g"], ["lentilles corail", "250 g"]] },
];

// Sans ce squelette, la liste de courses hériterait de celui de la semaine. Même bandeau et
// mêmes rayons que la page, le texte inconnu en silhouettes.
export default function ChargementCourses() {
  // Le retour vers la semaine reste utilisable pendant le chargement
  const { id } = useParams<{ id: string }>();

  return (
    <main>
      <p role="status" className="sr-only">
        Chargement de la liste de courses…
      </p>
      <BandeauPage
        titre="Liste de courses"
        retour={{
          href: `/semaines/${id}`,
          libelle: (
            <>
              <span className="sr-only">Retour à la semaine</span>
              <span aria-hidden="true" className="fantome">
                Semaine du 19 octobre
              </span>
            </>
          ),
        }}
        actions={
          // Silhouette du bouton « Imprimer »
          <div aria-hidden="true" className="bouton trace w-full cursor-default sm:w-auto">
            <span className="fantome">00 Imprimer</span>
          </div>
        }
      >
        <p aria-hidden="true" className="mt-3 text-lg">
          <span className="fantome ligne-attente">Semaine du 19 octobre</span>
        </p>
      </BandeauPage>

      <div aria-hidden="true" className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="chiffres text-xl font-bold">
            <span className="fantome bg-email-3">0 / 13 dans le panier</span>
          </p>
          <p className="text-sm">
            <span className="fantome bg-email-2">00 Synchronisée en direct sur vos écrans</span>
          </p>
        </div>
        <div className="mt-3 h-3 rounded-full bg-email-3" />

        <div className="mt-8 gap-x-10 md:columns-2">
          {RAYONS_MODELES.map(({ rayon, articles }, i) => (
            <section key={rayon} className="mb-8 break-inside-avoid overflow-hidden rounded-2xl bg-email-2">
              <div className="flex items-center justify-between gap-3 border-b-[3px] border-email-3 bg-basilic-pale px-4 py-3 sm:px-5">
                <h2 className="titre-moyen text-xl">
                  <span className="fantome ligne-attente bg-basilic/25" style={{ animationDelay: `${i * 110}ms` }}>
                    {rayon}
                  </span>
                </h2>
                <span className="chiffres text-sm font-semibold">
                  <span className="fantome bg-basilic/15">0 / {articles.length}</span>
                </span>
              </div>
              <ul className="divide-y-2 divide-email">
                {articles.map(([nom, quantite]) => (
                  <li key={nom} className="flex min-h-14 items-center gap-4 px-4 py-2.5 sm:px-5">
                    <span className="size-7 shrink-0 rounded-lg border-2 border-email-3 bg-email" />
                    <span className="min-w-0 flex-1 text-[1.0625rem]">
                      <span className="fantome bg-email-3">{nom}</span>
                    </span>
                    <span className="chiffres shrink-0 font-medium">
                      <span className="fantome bg-email-3">{quantite}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
