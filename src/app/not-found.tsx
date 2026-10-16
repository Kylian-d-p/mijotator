import Link from "next/link";
import Icone from "@/components/Icone";

export default function PageIntrouvable() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-14 pb-20 sm:px-8 sm:pt-20">
      <div className="max-w-xl">
        <h1 className="archivo-large text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.98] font-extrabold tracking-tight">
          Page introuvable
        </h1>
        <p className="mt-4 text-lg text-encre-2">
          Cette fiche ou cette page n&apos;existe pas. Vérifiez le lien, ou retrouvez vos fiches
          dans le sommaire.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/fiches" className="bouton bouton-principal">
            Mes fiches
            <Icone nom="suite" className="size-4" />
          </Link>
          <Link href="/" className="bouton bouton-secondaire">
            Nouvelle fiche
          </Link>
        </div>
      </div>
    </main>
  );
}
