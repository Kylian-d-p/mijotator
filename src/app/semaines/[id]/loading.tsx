import SqueletteSemaine from "@/components/SqueletteSemaine";

export default function ChargementSemaine() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
      <p role="status" className="sr-only">
        Chargement de la semaine…
      </p>
      <div className="h-6 w-36 bg-papier-2" />
      <div className="mt-6 space-y-3 border-b-2 border-filet pb-7 sm:mt-8">
        <div className="ligne-attente h-10 w-2/3 bg-papier-2" />
        <div className="ligne-attente h-4 w-1/3 bg-papier-2" />
      </div>
      <div className="mt-8 sm:mt-10">
        <SqueletteSemaine />
      </div>
    </main>
  );
}
