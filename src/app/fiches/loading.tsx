export default function ChargementSommaire() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
      <p role="status" className="sr-only">
        Chargement de vos fiches…
      </p>
      <div className="border-b-2 border-filet pb-6">
        <h1 className="archivo-large text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.98] font-extrabold tracking-tight">
          Mes fiches
        </h1>
        <div className="ligne-attente mt-4 h-5 w-64 max-w-full bg-papier-2" />
      </div>
      <div className="mt-12">
        <div className="h-4 w-32 bg-papier-2" />
        <div className="mt-3 border-t border-filet">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-5 border-b border-filet-doux py-4">
              <div className="size-11 shrink-0 bg-essentiel/30 sm:size-12" />
              <div
                className="ligne-attente h-4 bg-papier-2"
                style={{ width: `${[58, 44, 66, 38, 52][i]}%`, animationDelay: `${i * 110}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
