export default function ChargementSemaines() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
      <p role="status" className="sr-only">
        Chargement de vos semaines…
      </p>
      <div className="border-b-2 border-filet pb-6">
        <h1 className="archivo-large text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.98] font-extrabold tracking-tight">
          Mes semaines
        </h1>
        <div className="ligne-attente mt-4 h-5 w-64 max-w-full bg-papier-2" />
      </div>
      <div className="mt-10 border-t border-filet">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-5 border-b border-filet-doux py-4">
            <div className="size-11 shrink-0 bg-essentiel/30 sm:size-12" />
            <div className="flex-1 space-y-2">
              <div
                className="ligne-attente h-4 bg-papier-2"
                style={{ width: `${[38, 44, 34, 40][i]}%`, animationDelay: `${i * 110}ms` }}
              />
              <div className="h-3 w-1/4 bg-papier-2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
