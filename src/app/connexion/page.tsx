import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BandeauPage from "@/components/BandeauPage";
import FormulaireConnexion from "@/components/FormulaireConnexion";
import { creerClientServeur } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { erreur } = await searchParams;

  return (
    <main>
      <BandeauPage titre="Connexion">
        <p className="mt-4 max-w-xl text-lg sm:text-xl">
          Saisissez votre adresse e-mail : vous recevrez un <strong>lien pour vous connecter</strong>,
          sans mot de passe.
        </p>
      </BandeauPage>
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-12">
        <div className="max-w-xl">
          <FormulaireConnexion erreurLien={erreur === "lien-invalide"} />
        </div>
      </div>
    </main>
  );
}
