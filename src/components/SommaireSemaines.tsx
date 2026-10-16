import Link from "next/link";
import Icone from "@/components/Icone";
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

// L'état de la semaine sur son feu : couvercle flamme si elle est prête, feu nu pendant la
// préparation, couvercle soleil si elle a échoué
function Couvercle({ statut }: { statut: StatutSemaine }) {
  if (statut === "en_attente") {
    return (
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full border-2 border-bord shadow-[inset_0_0_0_5px_var(--email),inset_0_0_0_6.5px_var(--email-3)] sm:size-14"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex size-12 items-center justify-center rounded-full shadow-[0_6px_10px_-6px_rgb(30_26_23/0.7)] sm:size-14 ${
        statut === "prete" ? "bg-flamme" : "bg-soleil"
      }`}
    >
      <span className="size-3.5 rounded-full bg-fonte sm:size-4" />
    </span>
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
            className="group grid grid-cols-[3rem_1fr_auto] items-center gap-x-4 rounded-2xl px-3 py-3 no-underline transition-colors duration-150 hover:bg-email-2 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-x-5 sm:px-4"
          >
            <Couvercle statut={semaine.statut} />
            <span className="min-w-0">
              <span className="block text-[1.0625rem] leading-snug font-bold decoration-flamme decoration-2 group-hover:underline sm:text-lg">
                {titreSemaine(semaine.debut)}
              </span>
              <span className="mt-0.5 block truncate text-sm text-fonte-2">{resumeContraintes(semaine)}</span>
            </span>
            <EtatSemaine statut={semaine.statut} />
          </Link>
        </li>
      ))}
    </ol>
  );
}
