import SqueletteFiche from "@/components/SqueletteFiche";

export default function ChargementFiche() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
      <p role="status" className="sr-only">
        Chargement de la fiche…
      </p>
      <div className="h-6 w-28 bg-papier-2" />
      <div className="mt-6 flex items-start gap-5 border-b-2 border-filet pb-7 sm:mt-8 sm:gap-7">
        <div className="size-14 shrink-0 bg-essentiel sm:size-24" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="ligne-attente h-9 w-3/4 bg-papier-2" />
          <div className="ligne-attente h-4 w-1/3 bg-papier-2" />
        </div>
      </div>
      <div className="mt-8 sm:mt-10">
        <SqueletteFiche />
      </div>
    </main>
  );
}
