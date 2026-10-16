"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/", libelle: "Nouvelle semaine" },
  { href: "/semaines", libelle: "Mes semaines" },
];

function estActif(chemin: string, href: string) {
  return href === "/" ? chemin === "/" : chemin.startsWith(href);
}

export default function NavigationPrincipale() {
  const chemin = usePathname();

  return (
    <nav aria-label="Navigation principale">
      <ul className="flex items-center gap-0.5 sm:gap-1">
        {LIENS.map(({ href, libelle }) => {
          const actif = estActif(chemin, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={actif ? "page" : undefined}
                className="group relative block rounded-lg px-1.5 py-2 text-[0.95rem] font-semibold whitespace-nowrap no-underline min-[400px]:px-2 sm:px-3"
              >
                {libelle}
                {/* Un seul trait sous le libellé : plein pour l'onglet actif, estompé au survol des autres */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-1.5 bottom-0.5 h-[3px] rounded-full bg-current transition-[transform,opacity] duration-300 ease-sortie min-[400px]:inset-x-2 sm:inset-x-3 ${
                    actif ? "scale-x-100" : "scale-x-0 opacity-40 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
