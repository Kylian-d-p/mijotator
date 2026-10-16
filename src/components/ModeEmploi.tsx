// « Mode d'emploi » : ce que contient chaque fiche, montré comme dans
// les premières pages d'un cahier de révision.
export default function ModeEmploi() {
  return (
    <aside aria-labelledby="mode-emploi" className="border-2 border-filet">
      <h2 id="mode-emploi" className="bandeau bg-encre px-5 py-3 text-papier sm:px-7">
        Mode d&apos;emploi
      </h2>
      <div className="p-5 sm:p-7">
        <p className="text-encre-2">
          Chaque fiche suit le même plan, comme un cahier de révision.
        </p>

        <ol className="mt-7 space-y-7">
          <li className="grid grid-cols-[5.25rem_1fr] items-start gap-5">
            <div aria-hidden="true" className="border border-filet-doux">
              <div className="h-3 bg-essentiel" />
              <div className="space-y-1.5 bg-essentiel-pale p-2.5">
                <div className="h-1 w-full bg-essentiel/40" />
                <div className="h-1 w-11/12 bg-essentiel/40" />
                <div className="h-1 w-full bg-essentiel/40" />
                <div className="h-1 w-2/3 bg-essentiel/40" />
              </div>
            </div>
            <div>
              <h3 className="font-bold">L&apos;essentiel</h3>
              <p className="mt-0.5 text-[0.95rem] text-encre-2">
                Une synthèse de <span className="chiffres">150</span> à{" "}
                <span className="chiffres">300</span> mots, tirée uniquement de votre cours.
              </p>
            </div>
          </li>

          <li className="grid grid-cols-[5.25rem_1fr] items-start gap-5">
            <div aria-hidden="true" className="border border-filet-doux">
              <div className="h-3 bg-teste" />
              <div className="space-y-2 p-2.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="size-2 shrink-0 bg-teste" />
                    <div className="h-1 flex-1 bg-encre/20" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold">Je me teste</h3>
              <p className="mt-0.5 text-[0.95rem] text-encre-2">
                Trois questions pour vérifier ce que vous avez compris.
              </p>
            </div>
          </li>

          <li className="grid grid-cols-[5.25rem_1fr] items-start gap-5">
            <div
              aria-hidden="true"
              className="flex h-[3.4rem] items-center justify-center border-[1.5px] border-dashed border-bordure-champ"
            >
              <span className="rotate-180 text-[0.8rem] font-bold text-encre-2">Corrigé</span>
            </div>
            <div>
              <h3 className="font-bold">Les corrigés</h3>
              <p className="mt-0.5 text-[0.95rem] text-encre-2">
                Imprimés à l&apos;envers : retournez-les une fois votre réponse en tête,
                puis notez si vous saviez.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </aside>
  );
}
