import { RAYONS, type ArticleCourses, type Produit, type Repas } from "@/lib/semaine";

// Le modèle les liste parfois malgré la consigne : ils ne vont jamais sur la liste
const TOUJOURS_DISPONIBLES = ["sel", "poivre", "huile", "eau"];

export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Mots au singulier approximatif : « Tomates » et « tomate » donnent les mêmes mots
export function motsDe(nom: string): string[] {
  return normaliser(nom)
    .split(" ")
    .filter(Boolean)
    .map((mot) => (mot.length > 3 ? mot.replace(/[sx]$/, "") : mot));
}

export function cleNom(nom: string): string {
  return motsDe(nom).join(" ");
}

export function estToujoursDisponible(nom: string): boolean {
  const mots = motsDe(nom);
  return TOUJOURS_DISPONIBLES.some((mot) => mots.includes(mot));
}

// Pièces arrondies au-dessus (on n'achète pas une demi-courgette), grammes et millilitres à l'unité
function arrondir(article: ArticleCourses): ArticleCourses {
  const quantite =
    article.unite === "piece" ? Math.ceil(article.quantite) : Math.max(1, Math.round(article.quantite));
  return { ...article, quantite };
}

// Liste de courses : les besoins de la semaine, additionnés par produit et par unité,
// moins ce que contient déjà le frigo. Un produit dans deux unités reste sur deux lignes.
export function consoliderCourses(repas: Repas[], frigo: Produit[]): ArticleCourses[] {
  const besoins = new Map<string, ArticleCourses>();

  for (const { ingredients } of repas) {
    for (const ingredient of ingredients) {
      if (estToujoursDisponible(ingredient.nom)) continue;

      const cle = `${cleNom(ingredient.nom)}|${ingredient.unite}`;
      const besoin = besoins.get(cle);
      if (besoin) {
        besoin.quantite += ingredient.quantite;
      } else {
        besoins.set(cle, { ...ingredient, nom: ingredient.nom.trim() });
      }
    }
  }

  for (const produit of frigo) {
    const besoin = besoins.get(`${cleNom(produit.nom)}|${produit.unite}`);
    if (besoin) besoin.quantite = Math.max(0, besoin.quantite - produit.quantite);
  }

  return [...besoins.values()]
    .filter((article) => article.quantite > 0)
    .map(arrondir)
    .sort(
      (a, b) =>
        RAYONS.indexOf(a.rayon) - RAYONS.indexOf(b.rayon) || a.nom.localeCompare(b.nom, "fr")
    );
}
