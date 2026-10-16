// « Mode d'emploi » : ce que produit chaque semaine, en trois vignettes.
export default function ModeEmploi() {
  return (
    <aside aria-labelledby="mode-emploi" className="border-2 border-filet">
      <h2 id="mode-emploi" className="bandeau bg-encre px-5 py-3 text-papier sm:px-7">
        Mode d&apos;emploi
      </h2>
      <div className="p-5 sm:p-7">
        <p className="text-encre-2">Chaque demande produit une semaine complète, prête à cuisiner.</p>

        <ol className="mt-7 space-y-7">
          <li className="grid grid-cols-[5.25rem_1fr] items-start gap-5">
            <div aria-hidden="true" className="border border-filet-doux">
              <div className="h-3 bg-essentiel" />
              <div className="grid grid-cols-7 gap-0.5 bg-essentiel-pale p-2">
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={i} className={`h-2.5 ${i < 7 ? "bg-essentiel/30" : "bg-essentiel/60"}`} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold">Les repas</h3>
              <p className="mt-0.5 text-[0.95rem] text-encre-2">
                Un repas par jour et par moment demandé, avec ses ingrédients et ses étapes.
              </p>
            </div>
          </li>

          <li className="grid grid-cols-[5.25rem_1fr] items-start gap-5">
            <div aria-hidden="true" className="border border-filet-doux">
              <div className="h-3 bg-teste" />
              <div className="space-y-2 p-2.5">
                {[true, false, false].map((coche, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className={`size-2 shrink-0 border border-teste ${coche ? "bg-teste" : ""}`} />
                    <div className={`h-1 flex-1 ${coche ? "bg-encre/10" : "bg-encre/25"}`} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold">La liste de courses</h3>
              <p className="mt-0.5 text-[0.95rem] text-encre-2">
                Regroupée par rayon, sans ce que vous avez déjà dans le frigo.
              </p>
            </div>
          </li>

          <li className="grid grid-cols-[5.25rem_1fr] items-start gap-5">
            <div aria-hidden="true" className="flex h-[3.4rem] items-end justify-center gap-2 pb-1">
              <div className="flex h-12 w-7 items-center justify-center border-2 border-encre">
                <div className="size-2 bg-teste" />
              </div>
              <div className="flex h-9 w-11 items-center justify-center border-2 border-encre">
                <div className="size-2 bg-teste" />
              </div>
            </div>
            <div>
              <h3 className="font-bold">Cochée en direct</h3>
              <p className="mt-0.5 text-[0.95rem] text-encre-2">
                Cochez sur votre téléphone au magasin : vos autres écrans suivent sans rechargement.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </aside>
  );
}
