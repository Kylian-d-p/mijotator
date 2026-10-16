import "server-only";
import { Resend } from "resend";
import {
  afficherQuantite,
  LIBELLES_RAYON,
  libelleJour,
  titreSemaine,
  type ArticleCourses,
  type Repas,
} from "@/lib/semaine";

const EXPEDITEUR = "Mijotator <onboarding@resend.dev>";

// Remplace les caractères spéciaux HTML : une donnée saisie par l'utilisateur
// ne doit jamais pouvoir injecter de balises dans l'e-mail
function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Notification = {
  destinataire: string;
  semaineId: string;
  debut: string;
  statut: "prete" | "erreur";
  messageErreur?: string;
  repas?: Pick<Repas, "jour" | "moment" | "titre">[];
  courses?: ArticleCourses[];
};

function ligneArticle(article: ArticleCourses) {
  return `${article.nom} : ${afficherQuantite(article.quantite, article.unite)}`;
}

// Menu et liste dans l'e-mail : consultables au magasin, même sans réseau
function contenuSemaine(notification: Notification) {
  const repas = notification.repas ?? [];
  const courses = notification.courses ?? [];

  const menuHtml = repas
    .map(
      (r) =>
        `<li>${echapperHtml(libelleJour(notification.debut, r.jour))}, ${r.moment} : ${echapperHtml(r.titre)}</li>`
    )
    .join("");

  const rayons = [...new Set(courses.map((a) => a.rayon))];
  const coursesHtml = rayons
    .map(
      (rayon) =>
        `<p><strong>${LIBELLES_RAYON[rayon]}</strong></p><ul>${courses
          .filter((a) => a.rayon === rayon)
          .map((a) => `<li>${echapperHtml(ligneArticle(a))}</li>`)
          .join("")}</ul>`
    )
    .join("");

  const texte = [
    "Menu :",
    ...repas.map((r) => `- ${libelleJour(notification.debut, r.jour)}, ${r.moment} : ${r.titre}`),
    "",
    "Liste de courses :",
    ...courses.map((a) => `- ${ligneArticle(a)}`),
  ].join("\n");

  return {
    html: `<h2>Menu</h2><ul>${menuHtml}</ul><h2>Liste de courses</h2>${coursesHtml || "<p>Rien à acheter : tout est déjà dans votre frigo.</p>"}`,
    texte,
  };
}

export async function envoyerNotification(notification: Notification) {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    throw new Error("La variable RESEND_API_KEY n'est pas définie.");
  }

  const resend = new Resend(cle);
  const lien = `${process.env.APP_URL}/semaines/${notification.semaineId}`;
  const titre = titreSemaine(notification.debut);
  const titreMinuscule = titre.charAt(0).toLowerCase() + titre.slice(1);

  const prete = notification.statut === "prete";
  const semaine = prete ? contenuSemaine(notification) : null;

  const sujet = prete
    ? `Votre ${titreMinuscule} est prête`
    : `La préparation de votre ${titreMinuscule} a échoué`;

  const html = semaine
    ? `<p>Bonjour,</p>
       <p>Votre <strong>${echapperHtml(titreMinuscule)}</strong> est prête.</p>
       <p><a href="${lien}">Ouvrir la semaine dans Mijotator</a></p>
       ${semaine.html}`
    : `<p>Bonjour,</p>
       <p>La préparation de votre <strong>${echapperHtml(titreMinuscule)}</strong> a échoué :
       ${echapperHtml(notification.messageErreur ?? "erreur inconnue")}.</p>
       <p>Vous pouvez réessayer depuis l'application.</p>`;

  const texte = semaine
    ? `Votre ${titreMinuscule} est prête : ${lien}\n\n${semaine.texte}`
    : `La préparation de votre ${titreMinuscule} a échoué. Vous pouvez réessayer depuis l'application.`;

  const { error } = await resend.emails.send({
    from: EXPEDITEUR,
    to: [notification.destinataire],
    subject: sujet,
    html,
    text: texte,
  });

  if (error) {
    throw new Error(`Envoi refusé par Resend : ${error.message}`);
  }
}
