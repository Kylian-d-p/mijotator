import Icone from "@/components/Icone";
import MiniPlaque from "@/components/MiniPlaque";

// « Mode d'emploi » : un panneau de fonte noire qui porte trois objets émaillés,
// ce que produit chaque semaine.
export default function ModeEmploi() {
  return (
    <aside
      aria-labelledby="mode-emploi"
      className="rounded-3xl bg-fonte p-6 text-email shadow-[0_18px_30px_-22px_rgb(30_26_23/0.9)] sm:p-8 lg:sticky lg:top-6"
    >
      <h2 id="mode-emploi" className="titre-moyen text-2xl sm:text-[1.75rem]">
        Mode d&apos;emploi
      </h2>
      <p className="mt-2 text-white/75">Chaque demande produit une semaine complète, prête à cuisiner.</p>

      <ol className="mt-7 space-y-7">
        <li className="grid grid-cols-[5.5rem_1fr] items-start gap-5">
          <MiniPlaque allumes={[7, 8, 9, 10, 11, 12, 13, 5, 6]} surFonte />
          <div>
            <h3 className="font-bold">Les repas</h3>
            <p className="mt-0.5 text-[0.95rem] text-white/75">
              Un repas par case cochée du planning, avec ses ingrédients et ses étapes.
            </p>
          </div>
        </li>

        <li className="grid grid-cols-[5.5rem_1fr] items-start gap-5">
          <div aria-hidden="true" className="overflow-hidden rounded-xl bg-email">
            <div className="h-3 border-b-2 border-fonte-douce bg-basilic" />
            <div className="space-y-2 bg-email-2 p-2.5">
              {[true, false, false].map((coche, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className={`size-3 shrink-0 rounded-[3px] ${coche ? "bg-basilic-vif" : "border-[1.5px] border-fonte bg-email"}`}
                  />
                  <span className={`h-1 flex-1 rounded-full ${coche ? "bg-fonte/15" : "bg-fonte/35"}`} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold">La liste de courses</h3>
            <p className="mt-0.5 text-[0.95rem] text-white/75">
              Regroupée par rayon, sans ce que vous avez déjà dans le frigo.
            </p>
          </div>
        </li>

        <li className="grid grid-cols-[5.5rem_1fr] items-start gap-5">
          {/* Le téléphone et l'ordinateur en émail blanc, cochés en même temps */}
          <div aria-hidden="true" className="flex h-[3.4rem] items-end justify-center gap-2 pb-1">
            <div className="flex h-12 w-7 items-center justify-center rounded-md border-b-[3px] border-fonte-douce bg-email">
              <span className="flex size-4 items-center justify-center rounded-full bg-basilic-vif text-email">
                <Icone nom="valide" className="size-3" />
              </span>
            </div>
            <div className="flex h-9 w-11 items-center justify-center rounded-md border-b-[3px] border-fonte-douce bg-email">
              <span className="flex size-4 items-center justify-center rounded-full bg-basilic-vif text-email">
                <Icone nom="valide" className="size-3" />
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-bold">Cochée en direct</h3>
            <p className="mt-0.5 text-[0.95rem] text-white/75">
              Cochez sur votre téléphone au magasin : vos autres écrans suivent sans rechargement.
            </p>
          </div>
        </li>
      </ol>
    </aside>
  );
}
