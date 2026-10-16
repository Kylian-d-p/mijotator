import Link from "next/link";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";
import NavigationPrincipale from "@/components/NavigationPrincipale";
import SentryUtilisateur from "@/components/SentryUtilisateur";
import { creerClientServeur } from "@/lib/supabase/server";

export default async function EnTete() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sans-impression border-b-2 border-filet">
      {user && <SentryUtilisateur id={user.id} />}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 no-underline min-[400px]:gap-3"
          aria-label="Revizator, accueil"
        >
          <span className="archivo-large text-lg font-extrabold tracking-tight min-[400px]:text-xl sm:text-2xl">
            Revizator
          </span>
          {/* Gamme quadri, comme en marge d'une page imprimée : en carré 2×2 sur petit écran */}
          <span className="grid grid-cols-2 sm:flex" aria-hidden="true">
            <span className="size-1.5 bg-essentiel transition-transform duration-300 ease-sortie group-hover:-translate-y-1 sm:size-2.5" />
            <span className="size-1.5 bg-teste transition-transform delay-[40ms] duration-300 ease-sortie group-hover:-translate-y-1 sm:size-2.5" />
            <span className="size-1.5 bg-surligneur transition-transform delay-[80ms] duration-300 ease-sortie group-hover:-translate-y-1 sm:size-2.5" />
            <span className="size-1.5 bg-encre transition-transform delay-[120ms] duration-300 ease-sortie group-hover:-translate-y-1 sm:size-2.5" />
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-1 sm:gap-3">
            <NavigationPrincipale />
            <div className="hidden items-center gap-3 min-[420px]:flex sm:border-l sm:border-filet-doux sm:pl-3">
              <span className="hidden max-w-56 truncate text-sm text-encre-2 xl:block">
                {user.email}
              </span>
              <BoutonDeconnexion />
            </div>
          </div>
        )}
      </div>

      {/* Sous 420 px, la navigation occupe toute la ligne : le compte passe en dessous */}
      {user && (
        <div className="border-t border-filet-doux min-[420px]:hidden">
          <div className="flex items-center justify-between gap-3 py-1 pr-1 pl-4 text-sm">
            <span className="min-w-0 truncate text-encre-2">{user.email}</span>
            <BoutonDeconnexion avecLibelle />
          </div>
        </div>
      )}
    </header>
  );
}
