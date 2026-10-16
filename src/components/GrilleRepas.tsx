import Icone from "@/components/Icone";
import { afficherQuantite, aujourdhuiAParis, libelleJour, MOMENTS, type Repas } from "@/lib/semaine";

export type RepasEnregistre = Repas & { id: string };

// Un repas est une cocotte fermée : le couvercle émaillé porte le titre, son bouton en fonte
// l'ouvre sur l'intérieur blanc (ingrédients et étapes).
function CarteRepas({ repas }: { repas: RepasEnregistre }) {
  const moment = repas.moment === "midi" ? "Midi" : "Soir";

  return (
    <details className="repas" data-moment={repas.moment}>
      <summary className="flex cursor-pointer items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
        <span className="min-w-0 flex-1">
          <span className="block text-[1.0625rem] leading-snug font-bold sm:text-lg">{repas.titre}</span>
          <span className="chiffres mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
            <span>{moment}</span>
            <span className="inline-flex items-center gap-1">
              <Icone nom="horloge" className="size-3.5" />
              {repas.temps_minutes} min
            </span>
            <span>
              {repas.ingredients.length} ingrédient{repas.ingredients.length > 1 ? "s" : ""}
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className="bouton-couvercle flex size-9 shrink-0 items-center justify-center rounded-full bg-fonte text-email"
        >
          <Icone nom="plus" className="size-4" />
        </span>
      </summary>

      {/* L'intérieur de la cocotte, dans l'ombre du couvercle soulevé. Ingrédients et étapes
          côte à côte seulement s'il est assez large. */}
      <div className="@container rounded-2xl bg-email-2 shadow-[inset_0_12px_14px_-12px_rgb(30_26_23/0.4)]">
        <div className="grid gap-6 px-4 pt-5 pb-6 sm:px-5 @xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] @xl:gap-8">
          <div>
            <h4 className="font-bold">Ingrédients</h4>
            <ul className="mt-2 divide-y divide-email-3">
              {repas.ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 py-1.5">
                  <span>{ingredient.nom}</span>
                  <span className="chiffres shrink-0 text-right text-sm font-medium text-fonte-2">
                    {afficherQuantite(ingredient.quantite, ingredient.unite)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold">Étapes</h4>
            <ol className="mt-2.5 space-y-3">
              {repas.etapes.map((etape, i) => (
                <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-2.5">
                  <span className="chiffres flex size-7 items-center justify-center rounded-full bg-fonte text-sm font-bold text-email">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{etape}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </details>
  );
}

// Date (AAAA-MM-JJ) du jour n du programme
function dateDuProgramme(debut: string, jour: number) {
  const date = new Date(`${debut}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + jour - 1);
  return date.toISOString().slice(0, 10);
}

// Les jours du programme qui ont au moins un repas. Quand la semaine mêle midis et soirs,
// les midis restent dans la colonne de gauche et les soirs dans celle de droite, comme un planning.
// Le jour même porte la seule étiquette soleil de la page.
export default function GrilleRepas({ repas, debut }: { repas: RepasEnregistre[]; debut: string }) {
  const aujourdhui = aujourdhuiAParis();
  const jours = [1, 2, 3, 4, 5, 6, 7]
    .map((jour) => ({ jour, repas: repas.filter((r) => r.jour === jour) }))
    .filter(({ repas: repasDuJour }) => repasDuJour.length > 0);
  const deuxColonnes = repas.some((r) => r.moment === "midi") && repas.some((r) => r.moment === "soir");

  return (
    <ol>
      {/* Quand la semaine mêle midis et soirs, les deux colonnes sont nommées une fois */}
      {deuxColonnes && (
        <li aria-hidden="true" className="hidden gap-8 pb-1 lg:grid lg:grid-cols-[11rem_1fr]">
          <span />
          <span className="grid grid-cols-2 gap-3 font-semibold text-fonte-2">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-[3px] bg-flamme" />
              Midi
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-[3px] bg-braise" />
              Soir
            </span>
          </span>
        </li>
      )}
      {jours.map(({ jour, repas: repasDuJour }) => {
        const [jourSemaine, ...reste] = libelleJour(debut, jour).split(" ");
        const estAujourdhui = dateDuProgramme(debut, jour) === aujourdhui;
        return (
          <li
            key={jour}
            className="grid gap-3 border-b border-trait py-6 first:pt-2 last:border-b-0 md:grid-cols-[11rem_1fr] md:gap-8"
          >
            <h3 className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 md:block md:pt-1.5">
              <span className="titre-moyen block text-[1.75rem]">{jourSemaine}</span>
              <span className="text-fonte-2 md:mt-0.5 md:block">{reste.join(" ")}</span>
              {estAujourdhui && <span className="etiquette-soleil md:mt-2">Aujourd&apos;hui</span>}
            </h3>
            <div className={`grid items-start gap-3 ${deuxColonnes ? "lg:grid-cols-2" : ""}`}>
              {repasDuJour.map((r) => (
                <div
                  key={r.id}
                  className={deuxColonnes ? (r.moment === "midi" ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-2 lg:row-start-1") : ""}
                >
                  <CarteRepas repas={r} />
                </div>
              ))}
              {/* Sur deux colonnes, un moment sans repas garde sa place, comme une case vide du planning */}
              {deuxColonnes &&
                MOMENTS.filter((moment) => !repasDuJour.some((r) => r.moment === moment)).map((moment) => (
                  <div
                    key={moment}
                    aria-hidden="true"
                    className={`hidden min-h-[4.75rem] items-center rounded-2xl bg-email-2 px-5 text-sm text-fonte-3 lg:row-start-1 lg:flex ${
                      moment === "midi" ? "lg:col-start-1" : "lg:col-start-2"
                    }`}
                  >
                    {moment === "midi" ? "Pas de midi prévu" : "Pas de soir prévu"}
                  </div>
                ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
