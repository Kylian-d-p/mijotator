import BandeauPage from "@/components/BandeauPage";
import SqueletteSemaine from "@/components/SqueletteSemaine";

// Même bandeau et même grille que la page d'une semaine, le texte inconnu en silhouettes
export default function ChargementSemaine() {
  return (
    <main>
      <p role="status" className="sr-only">
        Chargement de la semaine…
      </p>
      <BandeauPage
        titre={
          <span aria-hidden="true" className="fantome ligne-attente">
            Semaine du 19 octobre
          </span>
        }
        retour={{ href: "/semaines", libelle: "Mes semaines" }}
        actions={
          // Silhouette de la carte « Liste de courses »
          <div
            aria-hidden="true"
            className="trace flex w-full items-center gap-4 rounded-2xl border-b-[3px] border-transparent px-4 py-3.5 sm:w-auto sm:min-w-80 sm:px-5"
          >
            <span className="trace size-11 shrink-0 rounded-full" />
            <span className="flex-1">
              <span className="block text-lg leading-tight font-bold">
                <span className="fantome">Liste de courses</span>
              </span>
              <span className="chiffres text-sm">
                <span className="fantome">24 articles · 0 coché</span>
              </span>
            </span>
          </div>
        }
      >
        <p aria-hidden="true" className="mt-4 text-lg">
          <span className="fantome">2 personnes · tous les soirs · 30 min de préparation max</span>
        </p>
        <p aria-hidden="true" className="chiffres mt-1">
          <span className="fantome">Budget 60 € · environ 52 € d&apos;ingrédients (estimation)</span>
        </p>
      </BandeauPage>

      <div className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        <SqueletteSemaine />
      </div>
    </main>
  );
}
