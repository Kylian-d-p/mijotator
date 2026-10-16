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
    <main className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
      <div className="mb-10 max-w-3xl sm:mb-12">
        <h1 className="archivo-large text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.98] font-extrabold tracking-tight">
          Nouvelle semaine
        </h1>
        <p className="mt-4 text-lg text-encre-2 sm:text-xl">
          Donnez vos contraintes, obtenez les{" "}
          <span className="surligne surligne-toujours text-encre">repas de la semaine</span> et
          la <span className="surligne surligne-toujours text-encre">liste de courses</span> qui
          va avec.
        </p>
      </div>

      <FormulaireSemaine valeursInitiales={valeursInitiales}>
        <ModeEmploi />
      </FormulaireSemaine>
    </main>
  );
}
