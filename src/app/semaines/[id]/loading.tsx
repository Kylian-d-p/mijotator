import SqueletteSemaine from "@/components/SqueletteSemaine";

export default function ChargementSemaine() {
  return (
    <main>
      <p role="status" className="sr-only">
        Chargement de la semaine…
      </p>
      <div className="bandeau-email bandeau-flamme" aria-hidden="true">
        <div className="mx-auto max-w-6xl px-5 pt-4 pb-8 sm:px-8 sm:pt-6 sm:pb-11">
          <div className="trace mb-5 h-5 w-32 rounded-md sm:mb-7" />
          <div className="ligne-attente trace h-12 w-2/3 max-w-xl rounded-lg sm:h-16" />
          <div className="trace mt-4 h-5 w-1/2 max-w-md rounded-md" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        <SqueletteSemaine />
      </div>
    </main>
  );
}
