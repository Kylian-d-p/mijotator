import Link from "next/link";
import type { ReactNode } from "react";
import Icone from "@/components/Icone";

// Le couvercle de la page : un aplat d'émail uni pleine largeur, fermé par un bord en fonte.
// Flamme pour tout ce qui touche aux repas, basilic pour les courses.
export default function BandeauPage({
  titre,
  email = "flamme",
  retour,
  actions,
  children,
}: {
  titre: ReactNode;
  email?: "flamme" | "basilic";
  retour?: { href: string; libelle: string };
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={`bandeau-email bandeau-${email}`}>
      <div className="mx-auto max-w-6xl px-5 pt-4 pb-8 sm:px-8 sm:pt-6 sm:pb-11">
        {retour && (
          <Link
            href={retour.href}
            className="sans-impression mb-5 inline-flex items-center gap-2 rounded-md font-semibold no-underline hover:underline sm:mb-7"
          >
            <Icone nom="retour" className="size-4" />
            {retour.libelle}
          </Link>
        )}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div className="min-w-0 max-w-3xl">
            <h1 className="titre text-[clamp(2.5rem,7vw,4.5rem)]">{titre}</h1>
            {children}
          </div>
          {actions && <div className="w-full sm:w-auto">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
