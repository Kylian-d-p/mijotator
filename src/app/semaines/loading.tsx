import Link from "next/link";
import BandeauPage from "@/components/BandeauPage";
import Icone from "@/components/Icone";
import MiniPlanning from "@/components/MiniPlanning";

// Textes modèles des lignes : invisibles, ils donnent à chaque silhouette la taille d'une vraie semaine
const MODELES = [
  { titre: "Semaine du 19 octobre", resume: "2 personnes · tous les soirs · 30 min de préparation max" },
  { titre: "Semaine du 12 octobre", resume: "4 personnes · 7 soirs et 2 midis · 45 min de préparation max · végétarien" },
  { titre: "Semaine du 5 octobre", resume: "2 personnes · 5 soirs · 20 min de préparation max" },
  { titre: "Semaine du 28 septembre", resume: "3 personnes · tous les soirs · 30 min de préparation max" },
];

// Même bandeau et même liste que la page, le texte inconnu en silhouettes
export default function ChargementSemaines() {
  return (
    <main>
      <p role="status" className="sr-only">
        Chargement de vos semaines…
      </p>
      <BandeauPage
        titre="Mes semaines"
        actions={
          <Link href="/" className="bouton bouton-clair w-full sm:w-auto">
            <Icone nom="plus" className="size-4" />
            Nouvelle semaine
          </Link>
        }
      >
        <p aria-hidden="true" className="mt-4 text-lg">
          <span className="fantome ligne-attente">4 semaines, de la plus récente à la plus ancienne.</span>
        </p>
      </BandeauPage>

      <div className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        <ol aria-hidden="true" className="-mx-3 space-y-1 sm:-mx-4">
          {MODELES.map(({ titre, resume }, i) => (
            <li
              key={titre}
              className="grid grid-cols-[4rem_1fr_auto] items-center gap-x-3.5 px-3 py-3 sm:grid-cols-[5rem_1fr_auto] sm:gap-x-5 sm:px-4"
            >
              <MiniPlanning creneaux={[]} />
              <span className="min-w-0">
                <span className="block text-[1.0625rem] leading-snug font-bold sm:text-lg">
                  <span className="fantome ligne-attente bg-email-3" style={{ animationDelay: `${i * 110}ms` }}>
                    {titre}
                  </span>
                </span>
                <span className="mt-0.5 block text-sm">
                  <span className="fantome bg-email-2">{resume}</span>
                </span>
              </span>
              <Icone nom="suite" className="size-5 text-email-3" />
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
