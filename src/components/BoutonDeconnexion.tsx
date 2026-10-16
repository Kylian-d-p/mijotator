"use client";

import { useRouter } from "next/navigation";
import Icone from "@/components/Icone";
import { creerClientNavigateur } from "@/lib/supabase/client";

// Icône seule dans l'en-tête, libellé à partir de 1024 px (ou toujours, avec avecLibelle)
export default function BoutonDeconnexion({ avecLibelle = false }: { avecLibelle?: boolean }) {
  const router = useRouter();

  async function deconnecter() {
    await creerClientNavigateur().auth.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={deconnecter}
      title="Se déconnecter"
      className={`flex h-10 shrink-0 cursor-pointer items-center justify-center text-encre-2 transition-colors hover:bg-surligneur hover:text-encre ${
        avecLibelle
          ? "gap-2 px-3 font-semibold"
          : "w-10 lg:w-auto lg:gap-2 lg:px-3 lg:font-semibold"
      }`}
    >
      <Icone nom="sortie" className={avecLibelle ? "size-4" : "size-5 lg:size-4"} />
      <span className={avecLibelle ? "" : "sr-only lg:not-sr-only"}>Se déconnecter</span>
    </button>
  );
}
