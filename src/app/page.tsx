import FormulaireFiche from "@/components/FormulaireFiche";
import ModeEmploi from "@/components/ModeEmploi";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
      <div className="mb-10 max-w-3xl sm:mb-12">
        <h1 className="archivo-large text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.98] font-extrabold tracking-tight">
          Nouvelle fiche
        </h1>
        <p className="mt-4 text-lg text-encre-2 sm:text-xl">
          Collez un cours, obtenez une{" "}
          <span className="surligne surligne-toujours text-encre">fiche de synthèse</span> et
          des <span className="surligne surligne-toujours text-encre">questions de révision</span>.
        </p>
      </div>

      <FormulaireFiche>
        <ModeEmploi />
      </FormulaireFiche>
    </main>
  );
}
