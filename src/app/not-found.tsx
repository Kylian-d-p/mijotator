import Link from "next/link";
import BandeauPage from "@/components/BandeauPage";
import Icone from "@/components/Icone";

export default function PageIntrouvable() {
  return (
    <main>
      <BandeauPage titre="Page introuvable">
        <p className="mt-4 max-w-xl text-lg">
          Cette semaine ou cette page n&apos;existe pas. Vérifiez le lien, ou retrouvez vos
          semaines dans la liste.
        </p>
      </BandeauPage>
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-12">
        <div className="flex flex-wrap gap-3">
          <Link href="/semaines" className="bouton bouton-principal">
            Mes semaines
            <Icone nom="suite" className="size-4" />
          </Link>
          <Link href="/" className="bouton bouton-secondaire">
            Nouvelle semaine
          </Link>
        </div>
      </div>
    </main>
  );
}
