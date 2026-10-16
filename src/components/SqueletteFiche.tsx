const LIGNES_ESSENTIEL = ["94%", "88%", "97%", "62%", "", "91%", "85%", "70%", "", "93%", "58%"];

// Silhouette d'une fiche pendant la génération ou le chargement.
export default function SqueletteFiche() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12" aria-hidden="true">
      <div className="lg:col-span-7">
        <div className="h-12 bg-essentiel" />
        <div className="space-y-3 bg-essentiel-pale px-5 py-7 sm:px-7">
          {LIGNES_ESSENTIEL.map((largeur, i) =>
            largeur ? (
              <div
                key={i}
                className="ligne-attente h-3.5 bg-essentiel/25"
                style={{ width: largeur, animationDelay: `${i * 90}ms` }}
              />
            ) : (
              <div key={i} className="h-3" />
            )
          )}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="h-12 bg-teste" />
        <div className="border-x-2 border-b-2 border-teste">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 border-b border-filet-doux px-5 py-6 last:border-b-0 sm:px-6">
              <div className="size-9 shrink-0 bg-teste" />
              <div className="flex-1 space-y-2.5 pt-1.5">
                <div
                  className="ligne-attente h-3.5 w-11/12 bg-teste/20"
                  style={{ animationDelay: `${(i + 4) * 120}ms` }}
                />
                <div
                  className="ligne-attente h-3.5 w-7/12 bg-teste/20"
                  style={{ animationDelay: `${(i + 5) * 120}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
