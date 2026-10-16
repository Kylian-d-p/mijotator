export default function ChargementSemaines() {
  return (
    <main>
      <p role="status" className="sr-only">
        Chargement de vos semaines…
      </p>
      <div className="bandeau-email bandeau-flamme">
        <div className="mx-auto max-w-6xl px-5 pt-7 pb-8 sm:px-8 sm:pt-10 sm:pb-11">
          <h1 className="titre text-[clamp(2.5rem,7vw,4.5rem)]">Mes semaines</h1>
          <div aria-hidden="true" className="ligne-attente mt-4 h-5 w-64 max-w-full rounded-md bg-white/25" />
        </div>
      </div>
      <div aria-hidden="true" className="mx-auto max-w-6xl space-y-1 px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 sm:gap-5">
            <div className="size-12 shrink-0 rounded-full bg-flamme-pale sm:size-14" />
            <div className="flex-1 space-y-2">
              <div
                className="ligne-attente h-4 rounded-full bg-email-2"
                style={{ width: `${[38, 44, 34, 40][i]}%`, animationDelay: `${i * 110}ms` }}
              />
              <div className="h-3 w-1/4 rounded-full bg-email-2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
