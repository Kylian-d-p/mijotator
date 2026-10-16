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

  if (articles.length === 0) {
    return (
      <div className="max-w-xl border-2 border-filet px-5 py-4 sm:px-6">
        <p className="font-bold">Rien à acheter</p>
        <p className="mt-1 text-encre-2">Tout ce qu&apos;il faut pour la semaine est déjà dans votre frigo.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sans-impression flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="chiffres text-lg font-semibold" aria-live="polite">
          {nombreCoches} / {articles.length} dans le panier
        </p>
        <p className="inline-flex items-center gap-2 text-sm text-encre-2">
          <span
            aria-hidden="true"
            className={`size-2.5 ${
              connexion === "direct" ? "bg-essentiel" : connexion === "connexion" ? "ligne-attente bg-encre-3" : "bg-surligneur"
            }`}
          />
          {connexion === "direct"
            ? "Synchronisée en direct sur vos écrans"
            : connexion === "connexion"
              ? "Connexion au temps réel…"
              : "Temps réel indisponible : rechargez pour voir les autres écrans"}
        </p>
      </div>

      <div className="mt-2 h-2 bg-papier-2" aria-hidden="true">
        <div
          className="h-full bg-teste transition-[width] duration-300 ease-sortie"
          style={{ width: `${(nombreCoches / articles.length) * 100}%` }}
        />
      </div>

      {erreur && (
        <div role="alert" className="mt-6 flex gap-4 bg-surligneur-pale px-5 py-4 sm:px-6">
          <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* Colonnes CSS plutôt qu'une grille : un long rayon ne laisse pas de vide à côté de lui */}
      <div className="mt-8 gap-x-12 md:columns-2">
        {rayons.map((rayon) => (
          <section key={rayon} aria-labelledby={`rayon-${rayon}`} className="mb-8 break-inside-avoid">
            <h2 id={`rayon-${rayon}`} className="bandeau bg-teste px-4 py-2 text-papier">
              {LIBELLES_RAYON[rayon]}
            </h2>
            <ul className="border-x-2 border-b-2 border-teste">
              {articles
                .filter((a) => a.rayon === rayon)
                .map((article) => (
                  <li key={article.id} className="border-b border-filet-doux last:border-b-0">
                    <label className="flex min-h-12 cursor-pointer items-center gap-4 px-4 py-2.5 hover:bg-teste-pale">
                      <input
                        type="checkbox"
                        checked={article.coche}
                        onChange={() => basculer(article)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="flex size-6 shrink-0 items-center justify-center border-2 border-encre text-papier peer-checked:border-teste peer-checked:bg-teste peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-encre"
                      >
                        {article.coche && <Icone nom="valide" className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1 peer-checked:text-encre-3 peer-checked:line-through">
                        {article.nom}
                      </span>
                      <span className="chiffres shrink-0 text-encre-2 peer-checked:text-encre-3 peer-checked:line-through">
                        {afficherQuantite(article.quantite, article.unite)}
                      </span>
                    </label>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
