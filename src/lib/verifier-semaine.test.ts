import { describe, expect, it } from "vitest";
import { TOUS_LES_CRENEAUX, TOUS_LES_SOIRS, type Creneau } from "@/lib/semaine";
import { verifierSemaine } from "@/lib/verifier-semaine";

const contraintes = { creneaux: TOUS_LES_SOIRS, tempsMax: 30 };

function repasValide(jour: number, moment = "soir") {
  return {
    jour,
    moment,
    titre: `Plat ${jour} ${moment}`,
    temps_minutes: 25,
    ingredients: [{ nom: "courgette", quantite: 2, unite: "piece", rayon: "fruits_legumes" }],
    etapes: ["Couper.", "Cuire.", "Servir."],
  };
}

function semaineValide(creneaux: Creneau[] = TOUS_LES_SOIRS) {
  return {
    frigo: [],
    repas: creneaux.map((c) => {
      const [jour, moment] = c.split("-");
      return repasValide(Number(jour), moment);
    }),
    cout_estime: 42.5,
  };
}

describe("verifierSemaine", () => {
  it("accepte une semaine complète et trie les repas", () => {
    const donnees = semaineValide(TOUS_LES_CRENEAUX);
    donnees.repas.reverse();
    const { erreurs, semaine } = verifierSemaine(donnees, { creneaux: TOUS_LES_CRENEAUX, tempsMax: 30 });
    expect(erreurs).toEqual([]);
    expect(semaine?.repas).toHaveLength(14);
    expect(semaine?.repas[0]).toMatchObject({ jour: 1, moment: "midi" });
    expect(semaine?.cout_estime).toBe(42.5);
  });

  it("rejette une semaine incomplète", () => {
    const donnees = semaineValide();
    donnees.repas.pop();
    const { erreurs, semaine } = verifierSemaine(donnees, contraintes);
    expect(semaine).toBeNull();
    expect(erreurs).toContain("6 repas au lieu de 7");
    expect(erreurs).toContain("créneau manquant : 7-soir");
  });

  it("rejette un midi qui n'était pas demandé", () => {
    const donnees = semaineValide();
    donnees.repas[0] = repasValide(1, "midi");
    expect(verifierSemaine(donnees, contraintes).erreurs).toContain("créneau non demandé : 1-midi");
  });

  it("accepte un choix libre de créneaux, et seulement ceux-là", () => {
    const creneaux: Creneau[] = ["1-soir", "3-midi", "3-soir", "6-midi"];
    const { erreurs, semaine } = verifierSemaine(semaineValide(creneaux), { creneaux, tempsMax: 30 });
    expect(erreurs).toEqual([]);
    expect(semaine?.repas.map((r) => `${r.jour}-${r.moment}`)).toEqual(creneaux);

    const enTrop = semaineValide([...creneaux, "7-soir"]);
    expect(verifierSemaine(enTrop, { creneaux, tempsMax: 30 }).erreurs).toContain("créneau non demandé : 7-soir");
  });

  it("rejette un repas trop long à préparer", () => {
    const donnees = semaineValide();
    donnees.repas[2].temps_minutes = 45;
    expect(verifierSemaine(donnees, contraintes).semaine).toBeNull();
  });

  it("rejette moins de trois étapes (« Sers chaud. » seul)", () => {
    const donnees = semaineValide();
    donnees.repas[0].etapes = ["Sers chaud."];
    expect(verifierSemaine(donnees, contraintes).erreurs).toContain("1 étapes : 1-soir");
  });

  it("rejette une unité ou un rayon inconnus", () => {
    const donnees = semaineValide();
    donnees.repas[0].ingredients = [{ nom: "riz", quantite: 1, unite: "tasse", rayon: "epicerie" }];
    expect(verifierSemaine(donnees, contraintes).erreurs).toContain("ingrédient invalide : 1-soir");
  });

  it("ignore un produit du frigo sans quantité au lieu de rejeter la semaine", () => {
    const donnees = {
      ...semaineValide(),
      frigo: [
        { nom: "crème fraîche", quantite: 0, unite: "g" },
        { nom: "riz", quantite: 1000, unite: "g" },
      ],
    };
    const { semaine } = verifierSemaine(donnees, contraintes);
    expect(semaine?.frigo).toEqual([{ nom: "riz", quantite: 1000, unite: "g" }]);
  });

  it("ramène un coût nul ou absent à null (le coût n'est qu'indicatif)", () => {
    expect(verifierSemaine({ ...semaineValide(), cout_estime: 0 }, contraintes).semaine?.cout_estime).toBeNull();
    expect(verifierSemaine({ ...semaineValide(), cout_estime: "35" }, contraintes).semaine?.cout_estime).toBeNull();
  });

  it("rejette une réponse sans structure", () => {
    expect(verifierSemaine(null, contraintes).erreurs).toEqual(["structure de la réponse invalide"]);
    expect(verifierSemaine({ repas: [] }, contraintes).semaine).toBeNull();
  });
});
