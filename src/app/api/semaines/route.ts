import * as Sentry from "@sentry/nextjs";
import { limiteurGenerations } from "@/lib/limitation";
import { publierGeneration } from "@/lib/qstash";
import { validerContraintes } from "@/lib/semaine";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { creerClientServeur } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // 0. Vérification de la session
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { erreur: "Votre session a expiré. Reconnectez-vous pour préparer une semaine." },
      { status: 401 }
    );
  }

  // 1. Validation des contraintes saisies
  const corps = await request.json().catch(() => null);
  const validation = validerContraintes(corps);

  if ("erreur" in validation) {
    return Response.json({ erreur: validation.erreur }, { status: 400 });
  }

  const { contraintes } = validation;

  // 2. Vérification du quota de l'utilisateur
  const enTetesQuota: Record<string, string> = {};

  try {
    const quota = await limiteurGenerations.limit(user.id);

    enTetesQuota["X-RateLimit-Limit"] = String(quota.limit);
    enTetesQuota["X-RateLimit-Remaining"] = String(quota.remaining);

    if (!quota.success) {
      const secondes = Math.max(1, Math.ceil((quota.reset - Date.now()) / 1000));
      const minutes = Math.ceil(secondes / 60);

      return Response.json(
        {
          erreur: `Vous avez atteint votre quota de ${quota.limit} semaines par heure. Réessayez dans ${minutes} minute(s).`,
        },
        { status: 429, headers: { ...enTetesQuota, "Retry-After": String(secondes) } }
      );
    }
  } catch (erreur) {
    // Si Redis est indisponible, on laisse passer la requête plutôt que de bloquer
    // tous les utilisateurs : c'est un choix « fail open ».
    console.error("Limitation de débit indisponible :", erreur);
  }

  // 3. Enregistrement de la demande, avec le statut « en attente »
  const { data: semaine, error } = await supabase
    .from("semaines")
    .insert({
      debut: contraintes.debut,
      personnes: contraintes.personnes,
      budget_euros: contraintes.budget,
      regime: contraintes.regime,
      temps_max_minutes: contraintes.tempsMax,
      midi: contraintes.midi,
      frigo: contraintes.frigo,
    })
    .select("id, statut")
    .single();

  if (error || !semaine) {
    console.error("Erreur lors de l'enregistrement de la demande :", error);
    return Response.json(
      { erreur: "La demande n'a pas pu être enregistrée. Réessayez plus tard." },
      { status: 500 }
    );
  }

  // 4. Publication du message de génération dans la file
  try {
    await publierGeneration(semaine.id);
  } catch (erreur) {
    console.error("Erreur lors de la publication du message :", erreur);
    Sentry.captureException(erreur, { tags: { tache: "publication-qstash" } });

    // Traitement système, sans utilisateur : usage légitime du client administrateur
    await creerClientAdmin()
      .from("semaines")
      .update({ statut: "erreur", message_erreur: "La préparation n'a pas pu être lancée." })
      .eq("id", semaine.id);

    return Response.json(
      { erreur: "La préparation n'a pas pu être lancée. Réessayez plus tard." },
      { status: 503 }
    );
  }

  // 5. Réponse immédiate : la demande est acceptée, le traitement suivra
  return Response.json(semaine, { status: 202, headers: enTetesQuota });
}
