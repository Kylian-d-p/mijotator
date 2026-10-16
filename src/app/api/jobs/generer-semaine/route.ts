import * as Sentry from "@sentry/nextjs";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { consoliderCourses } from "@/lib/courses";
import { envoyerNotification } from "@/lib/email";
import { genererSemaine } from "@/lib/generer-semaine";
import { ErreurIA, messageErreurIA } from "@/lib/ia";
import { NOMBRE_REESSAIS } from "@/lib/qstash";
import type { ArticleCourses, Creneau, Repas } from "@/lib/semaine";
import { creerClientAdmin } from "@/lib/supabase/admin";

export const maxDuration = 60;

type ClientAdmin = ReturnType<typeof creerClientAdmin>;

type SemaineAGenerer = {
  id: string;
  user_id: string;
  statut: string;
  debut: string;
  personnes: number;
  budget_euros: number;
  regime: string;
  temps_max_minutes: number;
  creneaux: Creneau[];
  frigo: string;
};

function estReessayable(erreur: unknown): boolean {
  if (erreur instanceof ErreurIA) {
    return erreur.status === 429 || erreur.status >= 500;
  }
  // Délai dépassé, panne réseau ou erreur inattendue : une nouvelle tentative peut réussir
  return true;
}

// Effet secondaire : un échec d'envoi est journalisé, mais ne fait jamais échouer le traitement
async function notifier(
  supabase: ClientAdmin,
  semaine: SemaineAGenerer,
  details:
    | { statut: "prete"; repas: Repas[]; courses: ArticleCourses[] }
    | { statut: "erreur"; messageErreur: string }
) {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(semaine.user_id);
    const destinataire = data.user?.email;

    if (error || !destinataire) {
      throw new Error("Adresse e-mail de l'auteur introuvable.");
    }

    await envoyerNotification({
      destinataire,
      semaineId: semaine.id,
      debut: semaine.debut,
      ...details,
    });
  } catch (erreur) {
    console.error("Échec de l'envoi de la notification :", erreur);
    Sentry.captureException(erreur, {
      level: "warning",
      tags: { tache: "notification-email" },
      extra: { semaineId: semaine.id },
    });
  }
}

// Enregistre les repas et la liste avant de passer la semaine à « prête » : l'interface,
// prévenue en temps réel du changement de statut, trouve alors des données complètes.
async function enregistrer(
  supabase: ClientAdmin,
  semaine: SemaineAGenerer,
  repas: Repas[],
  courses: ArticleCourses[]
) {
  // Idempotence : une tentative précédente a pu enregistrer une partie des lignes
  for (const table of ["repas", "articles_courses"] as const) {
    const { error } = await supabase.from(table).delete().eq("semaine_id", semaine.id);
    if (error) throw new Error(`Nettoyage de ${table} impossible : ${error.message}`);
  }

  const proprietaire = { semaine_id: semaine.id, user_id: semaine.user_id };

  const { error: erreurRepas } = await supabase
    .from("repas")
    .insert(repas.map((r) => ({ ...proprietaire, ...r })));
  if (erreurRepas) throw new Error(`Enregistrement des repas impossible : ${erreurRepas.message}`);

  if (courses.length > 0) {
    const { error: erreurCourses } = await supabase
      .from("articles_courses")
      .insert(courses.map((a) => ({ ...proprietaire, ...a })));
    if (erreurCourses) {
      throw new Error(`Enregistrement de la liste impossible : ${erreurCourses.message}`);
    }
  }
}

async function traiter(request: Request) {
  const { semaineId } = await request.json();
  const tentative = Number(request.headers.get("Upstash-Retried") ?? "0");

  // Le worker n'a pas d'utilisateur connecté : il utilise le client administrateur
  const supabase = creerClientAdmin();

  const { data: semaine } = await supabase
    .from("semaines")
    .select("id, user_id, statut, debut, personnes, budget_euros, regime, temps_max_minutes, creneaux, frigo")
    .eq("id", semaineId)
    .maybeSingle<SemaineAGenerer>();

  // Idempotence : une semaine absente ou déjà traitée n'est pas générée une seconde fois
  if (!semaine || semaine.statut !== "en_attente") {
    return Response.json({ resultat: "ignoré" });
  }

  Sentry.setUser({ id: semaine.user_id });

  try {
    const resultat = await genererSemaine(
      {
        debut: semaine.debut,
        personnes: semaine.personnes,
        budget: Number(semaine.budget_euros),
        regime: semaine.regime,
        tempsMax: semaine.temps_max_minutes,
        creneaux: semaine.creneaux,
        frigo: semaine.frigo,
      },
      {
        id: semaine.id,
        nom: "generation-semaine",
        userId: semaine.user_id,
        metadata: { tentativeQStash: tentative + 1, repasDemandes: semaine.creneaux.length },
      }
    );

    const courses = consoliderCourses(resultat.repas, resultat.frigo);
    await enregistrer(supabase, semaine, resultat.repas, courses);

    const { error } = await supabase
      .from("semaines")
      .update({
        statut: "prete",
        frigo_releve: resultat.frigo,
        cout_estime: resultat.cout_estime,
        modele: process.env.AI_MODEL,
      })
      .eq("id", semaine.id);
    if (error) throw new Error(`Mise à jour de la semaine impossible : ${error.message}`);

    await notifier(supabase, semaine, { statut: "prete", repas: resultat.repas, courses });

    return Response.json({ resultat: "prête" });
  } catch (erreur) {
    console.error(`Échec de la génération (tentative ${tentative + 1}) :`, erreur);
    Sentry.captureException(erreur, {
      tags: { tache: "generation-semaine", tentative: String(tentative + 1) },
      extra: { semaineId: semaine.id },
    });

    // Erreur passagère et tentatives restantes : on demande à QStash de réessayer
    if (estReessayable(erreur) && tentative < NOMBRE_REESSAIS) {
      return Response.json({ resultat: "nouvelle tentative" }, { status: 500 });
    }

    // Erreur définitive ou dernière tentative : on enregistre l'échec et on prévient l'auteur
    const message = messageErreurIA(erreur);

    await supabase
      .from("semaines")
      .update({ statut: "erreur", message_erreur: message })
      .eq("id", semaine.id);

    await notifier(supabase, semaine, { statut: "erreur", messageErreur: message });

    return Response.json({ resultat: "erreur" });
  }
}

export const POST = verifySignatureAppRouter(traiter);
