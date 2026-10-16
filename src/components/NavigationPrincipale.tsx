"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/", libelle: "Nouvelle fiche" },
  { href: "/fiches", libelle: "Mes fiches" },
];

function estActif(chemin: string, href: string) {
  return href === "/" ? chemin === "/" : chemin.startsWith(href);
}

export default function NavigationPrincipale() {
  const chemin = usePathname();

  return (
    <nav aria-label="Navigation principale">
      <ul className="flex items-center gap-0.5 sm:gap-2">
        {LIENS.map(({ href, libelle }) => {
          const actif = estActif(chemin, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={actif ? "page" : undefined}
                className={`relative block px-1.5 py-2 text-[0.95rem] font-semibold whitespace-nowrap no-underline transition-colors min-[400px]:px-2 sm:px-3 ${
                  actif ? "text-encre" : "text-encre-2 hover:text-encre"
                }`}
              >
                {libelle}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-1.5 -bottom-[14px] h-1 bg-encre transition-transform duration-300 ease-sortie min-[400px]:inset-x-2 sm:inset-x-3 ${
                    actif ? "scale-x-100" : "scale-x-0"
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
