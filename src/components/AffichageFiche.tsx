import type { ReactNode } from "react";
import JeMeTeste from "@/components/JeMeTeste";
import type { FicheEnregistree } from "@/lib/fiche";

type Bloc = { type: "paragraphe"; texte: string } | { type: "liste"; elements: string[] };

// La synthèse arrive en texte brut : paragraphes séparés par une ligne vide,
// éléments de liste commençant par « - ».
function decouperSynthese(synthese: string): Bloc[] {
  const blocs: Bloc[] = [];
  let paragraphe: string[] = [];
  let liste: string[] = [];

  const fermerParagraphe = () => {
    if (paragraphe.length > 0) {
      blocs.push({ type: "paragraphe", texte: paragraphe.join(" ") });
      paragraphe = [];
    }
  };
  const fermerListe = () => {
    if (liste.length > 0) {
      blocs.push({ type: "liste", elements: liste });
      liste = [];
    }
  };

  for (const ligneBrute of synthese.split("\n")) {
    const ligne = ligneBrute.trim();
    const puce = ligne.match(/^[-•*]\s+(.*)$/);

    if (ligne === "") {
      fermerParagraphe();
      fermerListe();
    } else if (puce) {
      fermerParagraphe();
      liste.push(puce[1]);
    } else {
      fermerListe();
      paragraphe.push(ligne);
    }
  }
  fermerParagraphe();
  fermerListe();

  return blocs;
}

// Les termes que le modèle met en **gras** sont surlignés, comme au stabilo.
function avecTermesCles(texte: string): ReactNode[] {
  return texte.split(/\*\*(.+?)\*\*/g).map((morceau, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="surligne surligne-toujours font-bold">
        {morceau}
      </strong>
    ) : (
      morceau
    )
  );
}

export default function AffichageFiche({ fiche }: { fiche: FicheEnregistree }) {
  const blocs = decouperSynthese(fiche.synthese);
  const nombreMots = fiche.synthese.split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <section aria-labelledby={`essentiel-${fiche.id}`} className="lg:col-span-7">
        <div className="flex items-center justify-between gap-4 bg-essentiel px-5 py-3 text-encre sm:px-7">
          <h2 id={`essentiel-${fiche.id}`} className="bandeau">
            L&apos;essentiel
          </h2>
          <p className="chiffres text-sm font-semibold">{nombreMots} mots</p>
        </div>

        <div className="bg-essentiel-pale px-5 py-7 text-[1.0625rem] leading-[1.7] sm:px-7 sm:text-[1.125rem]">
          <div className="max-w-[65ch] space-y-5">
            {blocs.map((bloc, i) =>
              bloc.type === "paragraphe" ? (
                <p key={i}>{avecTermesCles(bloc.texte)}</p>
              ) : (
                <ul key={i} className="puce-essentiel space-y-2.5">
                  {bloc.elements.map((element, j) => (
                    <li key={j}>{avecTermesCles(element)}</li>
                  ))}
                </ul>
              )
            )}
          </div>
        </div>
      </section>

      <div className="lg:col-span-5">
        <JeMeTeste idFiche={fiche.id} questions={fiche.questions} />
      </div>
    </div>
  );
}
