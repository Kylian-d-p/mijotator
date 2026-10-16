import Link from "next/link";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";
import Marque from "@/components/Marque";
import NavigationPrincipale from "@/components/NavigationPrincipale";
import SentryUtilisateur from "@/components/SentryUtilisateur";
import { creerClientServeur } from "@/lib/supabase/server";

// En-tête dans l'émail du bandeau de la page : flamme, ou basilic sur la liste de courses
export default async function EnTete() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="entete sans-impression">
      {user && <SentryUtilisateur id={user.id} />}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg no-underline min-[400px]:gap-2.5"
          aria-label="Mijotator, accueil"
        >
          <Marque className="size-5 min-[400px]:size-6 sm:size-7" />
          <span className="titre-moyen text-lg [font-stretch:85%] min-[400px]:text-xl sm:text-2xl sm:[font-stretch:100%]">Mijotator</span>
        </Link>

        {user && (
          <div className="flex items-center gap-1 sm:gap-3">
            <NavigationPrincipale />
            <div className="filet-courant hidden items-center gap-3 min-[420px]:flex sm:border-l sm:pl-3">
              <span className="hidden max-w-56 truncate text-sm xl:block">{user.email}</span>
              <BoutonDeconnexion />
            </div>
          </div>
        )}
      </div>

      {/* Sous 420 px, la navigation occupe toute la ligne : le compte passe en dessous */}
      {user && (
        <div className="filet-courant border-t min-[420px]:hidden">
          <div className="flex items-center justify-between gap-3 py-1 pr-1 pl-4 text-sm">
            <span className="min-w-0 truncate">{user.email}</span>
            <BoutonDeconnexion avecLibelle />
          </div>
        </div>
      )}
    </header>
  );
}
