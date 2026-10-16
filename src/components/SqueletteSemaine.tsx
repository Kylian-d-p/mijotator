const LARGEURS = ["62%", "48%", "71%", "55%", "66%", "44%", "58%"];

// Silhouette de la grille des repas pendant la génération ou le chargement
export default function SqueletteSemaine() {
  return (
    <div className="border-t-2 border-filet" aria-hidden="true">
      {LARGEURS.map((largeur, i) => (
        <div
          key={i}
          className="grid gap-3 border-b border-filet-doux py-5 md:grid-cols-[11rem_1fr] md:gap-6"
        >
          <div className="h-6 w-32 bg-papier-2 md:mt-3" />
          <div className="flex items-center gap-4 border-2 border-filet-doux px-4 py-4 sm:px-5">
            <div className="h-5 w-12 shrink-0 bg-essentiel" />
            <div
              className="ligne-attente h-4 bg-essentiel/25"
              style={{ width: largeur, animationDelay: `${i * 110}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
