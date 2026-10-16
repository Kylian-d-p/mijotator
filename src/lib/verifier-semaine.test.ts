import { describe, expect, it } from "vitest";
import { verifierSemaine } from "@/lib/verifier-semaine";

const contraintes = { midi: false, tempsMax: 30 };

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

function semaineValide(midi = false) {
  const moments = midi ? ["midi", "soir"] : ["soir"];
  return {
    frigo: [],
    repas: moments.flatMap((moment) => [1, 2, 3, 4, 5, 6, 7].map((jour) => repasValide(jour, moment))),
    cout_estime: 42.5,
  };
}

describe("verifierSemaine", () => {
  it("accepte une semaine complète et trie les repas", () => {
    const donnees = semaineValide(true);
    donnees.repas.reverse();
    const { erreurs, semaine } = verifierSemaine(donnees, { midi: true, tempsMax: 30 });
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
    expect(erreurs).toContain("créneau manquant : J7 soir");
  });

  it("rejette un midi qui n'était pas demandé", () => {
    const donnees = semaineValide();
    donnees.repas[0] = repasValide(1, "midi");
    expect(verifierSemaine(donnees, contraintes).erreurs).toContain("moment non demandé : J1 midi");
  });

  it("rejette un repas trop long à préparer", () => {
    const donnees = semaineValide();
    donnees.repas[2].temps_minutes = 45;
    expect(verifierSemaine(donnees, contraintes).semaine).toBeNull();
  });

  it("rejette moins de trois étapes (« Sers chaud. » seul)", () => {
    const donnees = semaineValide();
    donnees.repas[0].etapes = ["Sers chaud."];
    expect(verifierSemaine(donnees, contraintes).erreurs).toContain("1 étapes : J1 soir");
  });

  it("rejette une unité ou un rayon inconnus", () => {
    const donnees = semaineValide();
    donnees.repas[0].ingredients = [{ nom: "riz", quantite: 1, unite: "tasse", rayon: "epicerie" }];
    expect(verifierSemaine(donnees, contraintes).erreurs).toContain("ingrédient invalide : J1 soir");
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
