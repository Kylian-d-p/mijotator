import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
    <main className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
      <div className="max-w-xl">
        <h1 className="archivo-large text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.98] font-extrabold tracking-tight">
          Connexion
        </h1>
        <p className="mt-4 text-lg text-encre-2 sm:text-xl">
          Saisissez votre adresse e-mail : vous recevrez un{" "}
          <span className="surligne surligne-toujours text-encre">lien pour vous connecter</span>,
          sans mot de passe.
        </p>
        <FormulaireConnexion erreurLien={erreur === "lien-invalide"} />
      </div>
    </main>
  );
}
