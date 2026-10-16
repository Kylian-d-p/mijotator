import {
  RAYONS,
  UNITES,
  type Contraintes,
  type Ingredient,
  type Moment,
  type Produit,
  type Repas,
  type SemaineGeneree,
} from "@/lib/semaine";

export const ETAPES_MIN = 3;
export const ETAPES_MAX = 8;

type Resultat = { erreurs: string[]; semaine: SemaineGeneree | null };

const estObjet = (valeur: unknown): valeur is Record<string, unknown> =>
  typeof valeur === "object" && valeur !== null && !Array.isArray(valeur);

const estTexte = (valeur: unknown): valeur is string =>
  typeof valeur === "string" && valeur.trim() !== "";

function lireProduit(valeur: unknown): Produit | null {
  if (!estObjet(valeur) || !estTexte(valeur.nom) || typeof valeur.quantite !== "number") return null;
  if (!UNITES.includes(valeur.unite as Produit["unite"])) return null;
  return { nom: valeur.nom.trim(), quantite: valeur.quantite, unite: valeur.unite as Produit["unite"] };
}

function lireIngredient(valeur: unknown): Ingredient | null {
  const produit = lireProduit(valeur);
  if (!produit || !(produit.quantite > 0) || !estObjet(valeur)) return null;
  if (!RAYONS.includes(valeur.rayon as Ingredient["rayon"])) return null;
  return { ...produit, rayon: valeur.rayon as Ingredient["rayon"] };
}

// Vérifie la réponse du modèle et la normalise. Une seule erreur suffit à rejeter la semaine :
// la génération est alors retentée.
export function verifierSemaine(
  donnees: unknown,
  contraintes: Pick<Contraintes, "midi" | "tempsMax">
): Resultat {
  const erreurs: string[] = [];
  const moments: Moment[] = contraintes.midi ? ["midi", "soir"] : ["soir"];

  if (!estObjet(donnees) || !Array.isArray(donnees.repas) || !Array.isArray(donnees.frigo)) {
    return { erreurs: ["structure de la réponse invalide"], semaine: null };
  }

  const attendus = 7 * moments.length;
  if (donnees.repas.length !== attendus) {
    erreurs.push(`${donnees.repas.length} repas au lieu de ${attendus}`);
  }

  const creneaux = new Set<string>();
  const repas: Repas[] = [];

  for (const brut of donnees.repas) {
    if (!estObjet(brut)) {
      erreurs.push("repas illisible");
      continue;
    }

    const creneau = `J${brut.jour} ${brut.moment}`;
    if (!Number.isInteger(brut.jour) || (brut.jour as number) < 1 || (brut.jour as number) > 7) {
      erreurs.push(`jour invalide : ${brut.jour}`);
    }
    if (!moments.includes(brut.moment as Moment)) erreurs.push(`moment non demandé : ${creneau}`);
    if (creneaux.has(creneau)) erreurs.push(`créneau en double : ${creneau}`);
    creneaux.add(creneau);

    if (!estTexte(brut.titre)) erreurs.push(`titre vide : ${creneau}`);

    const temps = brut.temps_minutes;
    if (!Number.isInteger(temps) || (temps as number) <= 0 || (temps as number) > contraintes.tempsMax) {
      erreurs.push(`temps hors limite : ${creneau} (${temps} min)`);
    }

    const ingredients = Array.isArray(brut.ingredients) ? brut.ingredients.map(lireIngredient) : [];
    if (ingredients.length === 0) erreurs.push(`aucun ingrédient : ${creneau}`);
    if (ingredients.some((i) => i === null)) erreurs.push(`ingrédient invalide : ${creneau}`);

    const etapes = Array.isArray(brut.etapes) ? brut.etapes : [];
    if (etapes.length < ETAPES_MIN || etapes.length > ETAPES_MAX || !etapes.every(estTexte)) {
      erreurs.push(`${etapes.length} étapes : ${creneau}`);
    }

    if (erreurs.length === 0) {
      repas.push({
        jour: brut.jour as number,
        moment: brut.moment as Moment,
        titre: (brut.titre as string).trim(),
        temps_minutes: temps as number,
        ingredients: ingredients as Ingredient[],
        etapes: (etapes as string[]).map((etape) => etape.trim()),
      });
    }
  }

  for (const moment of moments) {
    for (let jour = 1; jour <= 7; jour++) {
      if (!creneaux.has(`J${jour} ${moment}`)) erreurs.push(`créneau manquant : J${jour} ${moment}`);
    }
  }

  // Le frigo relevé sert seulement à alléger la liste : un produit illisible ou
  // sans quantité (« un pot entamé ») est ignoré plutôt que de faire rejeter la semaine
  const frigo = donnees.frigo
    .map(lireProduit)
    .filter((produit): produit is Produit => produit !== null && produit.quantite > 0);

  if (erreurs.length > 0) return { erreurs, semaine: null };

  const cout = donnees.cout_estime;
  return {
    erreurs,
    semaine: {
      frigo,
      repas: repas.sort((a, b) => a.jour - b.jour || a.moment.localeCompare(b.moment)),
      cout_estime: typeof cout === "number" && cout > 0 ? Math.round(cout * 100) / 100 : null,
    },
  };
}
