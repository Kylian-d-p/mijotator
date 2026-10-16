import SqueletteSemaine from "@/components/SqueletteSemaine";

export default function ChargementSemaine() {
  return (
    <main>
      <p role="status" className="sr-only">
        Chargement de la semaine…
      </p>
      <div className="bandeau-email bandeau-flamme" aria-hidden="true">
        <div className="mx-auto max-w-6xl px-5 pt-7 pb-8 sm:px-8 sm:pt-10 sm:pb-11">
          <div className="mb-5 h-5 w-32 rounded-md bg-white/20 sm:mb-7" />
          <div className="ligne-attente h-12 w-2/3 max-w-xl rounded-lg bg-white/25 sm:h-16" />
          <div className="mt-4 h-5 w-1/2 max-w-md rounded-md bg-white/20" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        <SqueletteSemaine />
      </div>
    </main>
  );
}
