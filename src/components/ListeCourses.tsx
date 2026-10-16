"use client";

import { useEffect, useState } from "react";
import Icone from "@/components/Icone";
import { afficherQuantite, LIBELLES_RAYON, RAYONS, type ArticleCourses } from "@/lib/semaine";
import { creerClientNavigateur } from "@/lib/supabase/client";

export type ArticleEnregistre = ArticleCourses & { id: string; coche: boolean };

type Connexion = "connexion" | "direct" | "hors-ligne";

// Liste cochable, synchronisée en temps réel entre tous les écrans de l'utilisateur
export default function ListeCourses({
  semaineId,
  articlesInitiaux,
}: {
  semaineId: string;
  articlesInitiaux: ArticleEnregistre[];
}) {
  const [articles, setArticles] = useState(articlesInitiaux);
  const [connexion, setConnexion] = useState<Connexion>("connexion");
  const [erreur, setErreur] = useState("");
  // Seule la coche posée à la main s'anime, pas celles déjà présentes au chargement
  const [derniereCoche, setDerniereCoche] = useState<string | null>(null);

  useEffect(() => {
    const supabase = creerClientNavigateur();
    const canal = supabase.channel(`courses-${semaineId}`);

    async function ecouter() {
      // L'abonnement doit être fait au nom de l'utilisateur, pour que la RLS autorise les événements
      await supabase.auth.getSession();

      canal
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "articles_courses",
            filter: `semaine_id=eq.${semaineId}`,
          },
          (evenement) => {
            const { id, coche } = evenement.new as { id: string; coche: boolean };
            setArticles((actuels) => actuels.map((a) => (a.id === id ? { ...a, coche } : a)));
          }
        )
        .subscribe((statut) => {
          if (statut === "SUBSCRIBED") setConnexion("direct");
          if (statut === "CHANNEL_ERROR" || statut === "TIMED_OUT" || statut === "CLOSED") {
            setConnexion("hors-ligne");
          }
        });
    }

    ecouter();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [semaineId]);

  async function basculer(article: ArticleEnregistre) {
    const coche = !article.coche;
    setErreur("");
    setDerniereCoche(coche ? article.id : null);
    // Mise à jour immédiate à l'écran, annulée si la base refuse
    setArticles((actuels) => actuels.map((a) => (a.id === article.id ? { ...a, coche } : a)));

    // La RLS et les droits par colonne n'autorisent que la case à cocher de ses propres articles
    const { error } = await creerClientNavigateur()
      .from("articles_courses")
      .update({ coche })
      .eq("id", article.id);

    if (error) {
      console.error(error);
      setArticles((actuels) => actuels.map((a) => (a.id === article.id ? { ...a, coche: !coche } : a)));
      setErreur("La modification n'a pas pu être enregistrée. Vérifiez votre connexion.");
    }
  }

  const nombreCoches = articles.filter((a) => a.coche).length;
  const rayons = RAYONS.filter((rayon) => articles.some((a) => a.rayon === rayon));
  // Le rayon en cours est le premier, dans l'ordre du magasin, où il reste quelque chose à prendre
  const rayonEnCours = rayons.find((rayon) => articles.some((a) => a.rayon === rayon && !a.coche));

  if (articles.length === 0) {
    return (
      <div className="puits max-w-xl px-6 py-5">
        <p className="titre-moyen text-xl">Rien à acheter</p>
        <p className="mt-1 text-fonte-2">Tout ce qu&apos;il faut pour la semaine est déjà dans votre frigo.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sans-impression flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="chiffres text-xl font-bold" aria-live="polite">
          {nombreCoches === articles.length ? "Tout est dans le panier" : `${nombreCoches} / ${articles.length} dans le panier`}
        </p>
        <p className="inline-flex items-center gap-2 text-sm text-fonte-2">
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${
              connexion === "direct" ? "bg-basilic-vif" : connexion === "connexion" ? "ligne-attente bg-fonte-3" : "bg-soleil"
            }`}
          />
          {connexion === "direct"
            ? "Synchronisée en direct sur vos écrans"
            : connexion === "connexion"
              ? "Connexion au temps réel…"
              : "Temps réel indisponible : rechargez pour voir les autres écrans"}
        </p>
      </div>

      <div className="sans-impression mt-3 h-3 overflow-hidden rounded-full bg-email-3" aria-hidden="true">
        <div
          className="h-full rounded-full bg-basilic-vif transition-[width] duration-500 ease-sortie"
          style={{ width: `${(nombreCoches / articles.length) * 100}%` }}
        />
      </div>

      {erreur && (
        <div role="alert" className="alerte mt-6 sm:px-6">
          <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* Colonnes CSS plutôt qu'une grille : un long rayon ne laisse pas de vide à côté de lui */}
      <div className="mt-8 gap-x-10 md:columns-2">
        {rayons.map((rayon) => {
          const articlesRayon = articles.filter((a) => a.rayon === rayon);
          const pris = articlesRayon.filter((a) => a.coche).length;
          const fini = pris === articlesRayon.length;
          return (
            <section
              key={rayon}
              aria-labelledby={`rayon-${rayon}`}
              className="mb-8 break-inside-avoid overflow-hidden rounded-2xl bg-email-2"
            >
              {/* Un rayon fini s'éteint : basilic adouci, articles en retrait */}
              <div
                className={`flex items-center justify-between gap-3 border-b-4 border-fonte px-4 py-3 transition-colors duration-300 sm:px-5 ${
                  fini ? "bg-basilic-eteint text-fonte" : "bg-basilic text-email"
                }`}
              >
                <h2 id={`rayon-${rayon}`} className="titre-moyen flex items-center gap-2 text-xl">
                  {fini && <Icone nom="valide" className="size-5" />}
                  {LIBELLES_RAYON[rayon]}
                </h2>
                <span className="flex items-center gap-2">
                  {rayon === rayonEnCours && <span className="etiquette-soleil sans-impression">En cours</span>}
                  <span className="chiffres text-sm font-semibold">
                    {pris} / {articlesRayon.length}
                  </span>
                </span>
              </div>
              <ul className="divide-y-2 divide-email">
                {articlesRayon.map((article) => (
                  <li key={article.id}>
                    <label className="flex min-h-14 cursor-pointer items-center gap-4 px-4 py-2.5 transition-colors hover:bg-basilic-pale sm:px-5">
                      <input
                        type="checkbox"
                        checked={article.coche}
                        onChange={() => basculer(article)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-fonte bg-email text-email transition-colors duration-150 peer-checked:border-basilic-vif peer-checked:bg-basilic-vif peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-flamme"
                      >
                        {article.coche && (
                          <Icone nom="valide" className={`size-4.5 ${derniereCoche === article.id ? "pose" : ""}`} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 text-[1.0625rem] peer-checked:text-fonte-3">
                        <span data-barre={article.coche} className="barre">
                          {article.nom}
                        </span>
                      </span>
                      <span className="chiffres shrink-0 text-right font-medium text-fonte-2 peer-checked:text-fonte-3">
                        {afficherQuantite(article.quantite, article.unite)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
