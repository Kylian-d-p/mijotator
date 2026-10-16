export const MOMENTS = ["midi", "soir"] as const;
export const UNITES = ["g", "ml", "piece"] as const;
export const RAYONS = [
  "fruits_legumes",
  "viandes_poissons",
  "cremerie",
  "epicerie",
  "surgeles",
  "boulangerie",
  "boissons",
  "autre",
] as const;

export type Moment = (typeof MOMENTS)[number];
export type Unite = (typeof UNITES)[number];
export type Rayon = (typeof RAYONS)[number];

export const LIBELLES_RAYON: Record<Rayon, string> = {
  fruits_legumes: "Fruits et légumes",
  viandes_poissons: "Viandes et poissons",
  cremerie: "Crèmerie et œufs",
  epicerie: "Épicerie",
  surgeles: "Surgelés",
  boulangerie: "Boulangerie",
  boissons: "Boissons",
  autre: "Autre",
};

export type Produit = {
  nom: string;
  quantite: number;
  unite: Unite;
};

export type Ingredient = Produit & { rayon: Rayon };

export type Repas = {
  jour: number;
  moment: Moment;
  titre: string;
  temps_minutes: number;
  ingredients: Ingredient[];
  etapes: string[];
};

// Ce que renvoie le modèle, une fois vérifié. Le coût n'est qu'indicatif (null s'il est absurde).
export type SemaineGeneree = {
  frigo: Produit[];
  repas: Repas[];
  cout_estime: number | null;
};

export type ArticleCourses = Ingredient;

export type StatutSemaine = "en_attente" | "prete" | "erreur";

// Ce que l'utilisateur saisit dans le formulaire
export type Contraintes = {
  debut: string;
  personnes: number;
  budget: number;
  regime: string;
  tempsMax: number;
  midi: boolean;
  frigo: string;
};

export const LIMITES = {
  personnesMin: 1,
  personnesMax: 8,
  budgetMin: 10,
  budgetMax: 500,
  regimeMax: 200,
  frigoMax: 1000,
  // Date de début : au plus une semaine dans le passé, au plus trois mois devant
  joursAvantMax: 7,
  joursApresMax: 90,
};

export const TEMPS_POSSIBLES = [15, 20, 30, 45, 60, 90];

const JOUR_MS = 24 * 60 * 60 * 1000;

// Les dates de début sont des jours, sans heure : on les lit et on les affiche en UTC
function dateDuJour(debut: string, decalage = 0) {
  const date = new Date(`${debut}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + decalage);
  return date;
}

// Date du jour à Paris, au format AAAA-MM-JJ
export function aujourdhuiAParis(maintenant = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(maintenant);
}

// Lundi qui vient (aujourd'hui si l'on est lundi), au format AAAA-MM-JJ
export function prochainLundi(maintenant = new Date()) {
  const date = dateDuJour(aujourdhuiAParis(maintenant));
  date.setUTCDate(date.getUTCDate() + ((8 - date.getUTCDay()) % 7));
  return date.toISOString().slice(0, 10);
}

// Valide la saisie du formulaire, côté serveur comme côté navigateur
export function validerContraintes(
  corps: unknown,
  maintenant = new Date()
): { contraintes: Contraintes } | { erreur: string } {
  const c = (typeof corps === "object" && corps !== null ? corps : {}) as Record<string, unknown>;

  const debut = typeof c.debut === "string" ? c.debut : "";
  const ecartJours = /^\d{4}-\d{2}-\d{2}$/.test(debut)
    ? (dateDuJour(debut).getTime() - dateDuJour(aujourdhuiAParis(maintenant)).getTime()) / JOUR_MS
    : NaN;
  if (
    !Number.isFinite(ecartJours) ||
    ecartJours < -LIMITES.joursAvantMax ||
    ecartJours > LIMITES.joursApresMax
  ) {
    return {
      erreur: `La date de début doit être comprise entre ${LIMITES.joursAvantMax} jours avant et ${LIMITES.joursApresMax} jours après aujourd'hui.`,
    };
  }

  const personnes = Number(c.personnes);
  if (
    !Number.isInteger(personnes) ||
    personnes < LIMITES.personnesMin ||
    personnes > LIMITES.personnesMax
  ) {
    return {
      erreur: `Le nombre de personnes doit être compris entre ${LIMITES.personnesMin} et ${LIMITES.personnesMax}.`,
    };
  }

  const budget = Number(c.budget);
  if (!Number.isFinite(budget) || budget < LIMITES.budgetMin || budget > LIMITES.budgetMax) {
    return {
      erreur: `Le budget doit être compris entre ${LIMITES.budgetMin} et ${LIMITES.budgetMax} €.`,
    };
  }

  const tempsMax = Number(c.tempsMax);
  if (!TEMPS_POSSIBLES.includes(tempsMax)) {
    return { erreur: "Le temps de préparation choisi n'est pas proposé." };
  }

  const regime = typeof c.regime === "string" ? c.regime.trim() : "";
  if (regime.length > LIMITES.regimeMax) {
    return { erreur: `Le régime et les allergies tiennent en ${LIMITES.regimeMax} caractères maximum.` };
  }

  const frigo = typeof c.frigo === "string" ? c.frigo.trim() : "";
  if (frigo.length > LIMITES.frigoMax) {
    return { erreur: `Le contenu du frigo tient en ${LIMITES.frigoMax} caractères maximum.` };
  }

  return {
    contraintes: {
      debut,
      personnes,
      budget: Math.round(budget * 100) / 100,
      regime,
      tempsMax,
      midi: c.midi === true,
      frigo,
    },
  };
}

export function titreSemaine(debut: string) {
  const date = dateDuJour(debut).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return `Semaine du ${date}`;
}

// « Lundi 19 octobre » pour le jour 1 d'une semaine qui commence le 19 octobre
export function libelleJour(debut: string, jour: number) {
  const texte = dateDuJour(debut, jour - 1).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

export function libelleDateLongue(debut: string) {
  return dateDuJour(debut).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const formatQuantite = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

// 550 g, 1,2 kg, 400 ml, 1,5 L, 3 (pièces)
export function afficherQuantite(quantite: number, unite: Unite) {
  if (unite === "piece") return formatQuantite.format(quantite);
  if (quantite >= 1000) {
    return `${formatQuantite.format(quantite / 1000)} ${unite === "g" ? "kg" : "L"}`;
  }
  return `${formatQuantite.format(quantite)} ${unite}`;
}

export function resumeContraintes(semaine: {
  personnes: number;
  midi: boolean;
  temps_max_minutes: number;
  regime: string;
}) {
  return [
    `${semaine.personnes} personne${semaine.personnes > 1 ? "s" : ""}`,
    semaine.midi ? "midi et soir" : "le soir",
    `${semaine.temps_max_minutes} min max`,
    semaine.regime.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");
}
