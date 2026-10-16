import BandeauPage from "@/components/BandeauPage";
import FormulaireSemaine, { type ValeursFormulaire } from "@/components/FormulaireSemaine";
import ModeEmploi from "@/components/ModeEmploi";
import { estCreneau, prochainLundi, TOUS_LES_SOIRS } from "@/lib/semaine";
import { creerClientServeur } from "@/lib/supabase/server";

export default async function Home() {
  // Le formulaire reprend les réglages de la dernière semaine (la RLS ne renvoie que celles de l'utilisateur)
  const supabase = await creerClientServeur();
  const { data: derniere } = await supabase
    .from("semaines")
    .select("personnes, budget_euros, regime, temps_max_minutes, creneaux")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const creneauxPrecedents = ((derniere?.creneaux ?? []) as string[]).filter(estCreneau);

  const valeursInitiales: ValeursFormulaire = {
    debut: prochainLundi(),
    personnes: derniere?.personnes ?? 2,
    budget: derniere ? Number(derniere.budget_euros) : 50,
    regime: derniere?.regime ?? "",
    tempsMax: derniere?.temps_max_minutes ?? 30,
    creneaux: creneauxPrecedents.length > 0 ? creneauxPrecedents : TOUS_LES_SOIRS,
  };

  return (
    <main>
      <BandeauPage titre="Nouvelle semaine">
        <p className="mt-4 text-lg sm:text-xl">
          Donnez vos contraintes, obtenez les <strong>repas de la semaine</strong> et la{" "}
          <strong>liste de courses</strong> qui va avec.
        </p>
      </BandeauPage>

      <div className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-12">
        <FormulaireSemaine valeursInitiales={valeursInitiales}>
          <ModeEmploi />
        </FormulaireSemaine>
      </div>
    </main>
  );
}
