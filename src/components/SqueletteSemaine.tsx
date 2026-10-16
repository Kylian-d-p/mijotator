const LARGEURS = ["62%", "48%", "71%", "55%", "66%", "44%", "58%"];

// Silhouette de la grille des repas pendant la génération ou le chargement : des couvercles pâles
export default function SqueletteSemaine() {
  return (
    <div aria-hidden="true">
      {LARGEURS.map((largeur, i) => (
        <div
          key={i}
          className="grid gap-3 border-b border-trait py-6 first:pt-2 last:border-b-0 md:grid-cols-[11rem_1fr] md:gap-8"
        >
          <div className="space-y-2 md:pt-2">
            <div className="h-6 w-24 rounded-md bg-email-2" />
            <div className="h-4 w-20 rounded-md bg-email-2" />
          </div>
          <div className="flex items-center gap-4 rounded-2xl border-b-[3px] border-email-3 bg-flamme-pale px-4 py-4 sm:px-5">
            <div className="flex-1 space-y-2">
              <div
                className="ligne-attente h-4 rounded-full bg-flamme/30"
                style={{ width: largeur, animationDelay: `${i * 110}ms` }}
              />
              <div className="h-3 w-28 rounded-full bg-flamme/15" />
            </div>
            <div className="size-9 shrink-0 rounded-full bg-flamme/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
