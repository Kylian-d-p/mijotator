import Link from "next/link";
import Icone from "@/components/Icone";
import MiniPlanning from "@/components/MiniPlanning";
import { resumeContraintes, titreSemaine, type Creneau, type StatutSemaine } from "@/lib/semaine";

export type LigneSemaine = {
  id: string;
  debut: string;
  personnes: number;
  creneaux: Creneau[];
  temps_max_minutes: number;
  regime: string;
  statut: StatutSemaine;
};

// Une semaine qui n'est pas prête le signale à la place de la flèche
function EtatSemaine({ statut }: { statut: StatutSemaine }) {
  if (statut === "prete") {
    return (
      <Icone
        nom="suite"
        className="size-5 text-fonte-3 transition-transform duration-200 ease-sortie group-hover:translate-x-0.5 group-hover:text-fonte"
      />
    );
  }

  return statut === "en_attente" ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-email-2 px-3 py-1 text-[0.8125rem] font-bold whitespace-nowrap text-fonte-2">
      <span aria-hidden="true" className="flex h-3 items-end gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="bulle size-1.5 rounded-full bg-flamme" style={{ animationDelay: `${i * 220}ms` }} />
        ))}
      </span>
      En préparation
    </span>
  ) : (
    <span className="etiquette-soleil">Échec</span>
  );
}

// Les semaines de la plus récente à la plus ancienne, numérotées depuis la première
export default function SommaireSemaines({ semaines }: { semaines: LigneSemaine[] }) {
  return (
    <ol className="-mx-3 space-y-1 sm:-mx-4">
      {semaines.map((semaine) => (
        <li key={semaine.id}>
          <Link
            href={`/semaines/${semaine.id}`}
            className="group grid grid-cols-[4rem_1fr_auto] items-center gap-x-3.5 rounded-2xl px-3 py-3 no-underline transition-colors duration-150 hover:bg-email-2 sm:grid-cols-[5rem_1fr_auto] sm:gap-x-5 sm:px-4"
          >
            <MiniPlanning creneaux={semaine.creneaux} etat={semaine.statut} />
            <span className="min-w-0">
              <span className="block text-[1.0625rem] leading-snug font-bold decoration-flamme decoration-2 group-hover:underline sm:text-lg">
                {titreSemaine(semaine.debut)}
              </span>
              <span className="mt-0.5 block text-sm text-fonte-2">{resumeContraintes(semaine)}</span>
              {/* Sur téléphone, l'état d'une semaine pas encore prête passe sous ses contraintes */}
              {semaine.statut !== "prete" && (
                <span className="mt-1.5 block sm:hidden">
                  <EtatSemaine statut={semaine.statut} />
                </span>
              )}
            </span>
            <span className={semaine.statut === "prete" ? "" : "hidden sm:block"}>
              <EtatSemaine statut={semaine.statut} />
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
