import { creneau, JOURS, libelleJour, MOMENTS, TOUS_LES_SOIRS, type Creneau } from "@/lib/semaine";

// Textes modèles des silhouettes : invisibles, ils donnent aux squelettes la taille du vrai contenu
const JOURS_MODELES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const TITRES_MODELES = [
  "Curry de pois chiches au riz",
  "Gratin de courgettes au chèvre",
  "Salade de quinoa aux légumes",
  "Pâtes au pesto et tomates cerises",
  "Soupe de lentilles corail",
  "Poulet rôti et pommes de terre",
  "Omelette aux champignons",
];

// Silhouette de la grille des repas, dans la mise en page de GrilleRepas : des couvercles pâles
// aux places des repas attendus. Sans créneaux connus (chargement de la page), sept soirs.
export default function SqueletteSemaine({
  creneaux = TOUS_LES_SOIRS,
  debut,
}: {
  creneaux?: readonly Creneau[];
  debut?: string;
}) {
  const jours = JOURS.map((jour) => ({
    jour,
    moments: MOMENTS.filter((moment) => creneaux.includes(creneau(jour, moment))),
  })).filter(({ moments }) => moments.length > 0);
  const deuxColonnes = creneaux.some((c) => c.endsWith("-midi")) && creneaux.some((c) => c.endsWith("-soir"));
  // Rang de chaque repas attendu, pour varier les titres modèles et décaler la respiration
  const attendus = JOURS.flatMap((jour) => MOMENTS.map((moment) => creneau(jour, moment))).filter((c) => creneaux.includes(c));

  return (
    <ol aria-hidden="true">
      {deuxColonnes && (
        <li className="hidden gap-8 pb-1 lg:grid lg:grid-cols-[11rem_1fr]">
          <span />
          <span className="grid grid-cols-2 gap-3 font-semibold text-fonte-2">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-[3px] bg-flamme" />
              Midi
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-[3px] bg-braise" />
              Soir
            </span>
          </span>
        </li>
      )}
      {jours.map(({ jour, moments }) => {
        // Les dates sont connues pendant la génération, pas pendant le chargement de la page
        const [jourSemaine, ...reste] = debut ? libelleJour(debut, jour).split(" ") : [JOURS_MODELES[jour - 1], "19", "octobre"];
        return (
          <li
            key={jour}
            className="grid gap-3 border-b border-trait py-6 first:pt-2 last:border-b-0 md:grid-cols-[11rem_1fr] md:gap-8"
          >
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 md:block md:pt-1.5">
              <span className="titre-moyen block text-[1.75rem]">
                <span className={debut ? "" : "fantome bg-email-3"}>{jourSemaine}</span>
              </span>
              <span className="text-fonte-2 md:mt-0.5 md:block">
                <span className={debut ? "" : "fantome bg-email-3"}>{reste.join(" ")}</span>
              </span>
            </div>
            <div className={`grid items-start gap-3 ${deuxColonnes ? "lg:grid-cols-2" : ""}`}>
              {MOMENTS.map((moment) => {
                const colonne = deuxColonnes ? (moment === "midi" ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-2 lg:row-start-1") : "";

                if (!moments.includes(moment)) {
                  // Sur deux colonnes, un moment sans repas garde sa place, comme dans la vraie grille
                  return deuxColonnes ? (
                    <div
                      key={moment}
                      className={`hidden min-h-[4.75rem] items-center rounded-2xl bg-email-2 px-5 text-sm text-fonte-3 lg:flex ${colonne}`}
                    >
                      {moment === "midi" ? "Pas de midi prévu" : "Pas de soir prévu"}
                    </div>
                  ) : null;
                }

                const i = attendus.indexOf(creneau(jour, moment));
                return (
                  <div
                    key={moment}
                    className={`flex items-center gap-4 rounded-2xl border-b-[3px] border-email-3 bg-flamme-pale px-4 py-3.5 sm:px-5 sm:py-4 ${colonne}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[1.0625rem] leading-snug font-bold sm:text-lg">
                        <span
                          className="fantome ligne-attente bg-flamme/30"
                          style={{ animationDelay: `${(i % 7) * 110}ms` }}
                        >
                          {TITRES_MODELES[i % TITRES_MODELES.length]}
                        </span>
                      </span>
                      <span className="chiffres mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
                        <span className="fantome bg-flamme/15">{moment === "midi" ? "Midi" : "Soir"}</span>
                        <span className="fantome bg-flamme/15">00 25 min</span>
                        <span className="fantome bg-flamme/15">6 ingrédients</span>
                      </span>
                    </span>
                    <span className="size-9 shrink-0 rounded-full bg-flamme/20" />
                  </div>
                );
              })}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
