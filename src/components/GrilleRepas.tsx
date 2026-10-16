import Icone from "@/components/Icone";
import { afficherQuantite, libelleJour, type Repas } from "@/lib/semaine";

export type RepasEnregistre = Repas & { id: string };

function CarteRepas({ repas }: { repas: RepasEnregistre }) {
  return (
    <details className="group @container border-2 border-filet bg-papier open:border-encre">
      <summary className="flex cursor-pointer list-none items-start gap-4 px-4 py-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="bandeau mt-0.5 shrink-0 bg-essentiel px-2 py-0.5 text-[0.8125rem] text-encre">
          {repas.moment === "midi" ? "Midi" : "Soir"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[1.0625rem] leading-snug font-bold">{repas.titre}</span>
          <span className="chiffres mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-encre-2">
            <span className="inline-flex items-center gap-1">
              <Icone nom="horloge" className="size-3.5" />
              {repas.temps_minutes} min
            </span>
            <span>
              {repas.ingredients.length} ingrédient{repas.ingredients.length > 1 ? "s" : ""}
            </span>
          </span>
        </span>
        <Icone
          nom="plus"
          className="mt-1 size-4 shrink-0 transition-transform duration-300 ease-sortie group-open:rotate-45"
        />
      </summary>

      {/* Ingrédients et étapes côte à côte seulement si la carte est assez large */}
      <div className="grid gap-6 border-t border-filet-doux px-4 py-5 sm:px-5 @xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <h4 className="bandeau text-[0.9rem] text-encre-2">Ingrédients</h4>
          <ul className="mt-2 divide-y divide-filet-doux">
            {repas.ingredients.map((ingredient, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 py-1.5">
                <span>{ingredient.nom}</span>
                <span className="chiffres shrink-0 text-sm text-encre-2">
                  {afficherQuantite(ingredient.quantite, ingredient.unite)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="bandeau text-[0.9rem] text-encre-2">Étapes</h4>
          <ol className="mt-2 space-y-2.5">
            {repas.etapes.map((etape, i) => (
              <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-2">
                <span className="chiffres flex size-6 items-center justify-center bg-encre text-sm font-bold text-papier">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{etape}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </details>
  );
}

// Les jours du programme qui ont au moins un repas. Quand la semaine mêle midis et soirs,
// les midis restent dans la colonne de gauche et les soirs dans celle de droite, comme un planning.
export default function GrilleRepas({ repas, debut }: { repas: RepasEnregistre[]; debut: string }) {
  const jours = [1, 2, 3, 4, 5, 6, 7]
    .map((jour) => ({ jour, repas: repas.filter((r) => r.jour === jour) }))
    .filter(({ repas: repasDuJour }) => repasDuJour.length > 0);
  const deuxColonnes = repas.some((r) => r.moment === "midi") && repas.some((r) => r.moment === "soir");

  return (
    <ol className="border-t-2 border-filet">
      {jours.map(({ jour, repas: repasDuJour }) => (
        <li
          key={jour}
          className="grid gap-3 border-b border-filet-doux py-5 md:grid-cols-[11rem_1fr] md:gap-6"
        >
          <h3 className="archivo-large text-xl font-extrabold md:pt-3">{libelleJour(debut, jour)}</h3>
          <div className={`grid items-start gap-3 ${deuxColonnes ? "lg:grid-cols-2" : ""}`}>
            {repasDuJour.map((r) => (
              <div key={r.id} className={deuxColonnes ? (r.moment === "midi" ? "lg:col-start-1" : "lg:col-start-2") : ""}>
                <CarteRepas repas={r} />
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
