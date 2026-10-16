import { describe, expect, it } from "vitest";
import {
  afficherQuantite,
  decrireCreneaux,
  estWeekEnd,
  libelleJour,
  libelleJourCourt,
  prochainLundi,
  titreSemaine,
  TOUS_LES_CRENEAUX,
  TOUS_LES_SOIRS,
  validerContraintes,
} from "@/lib/semaine";

// Vendredi 16 octobre 2026, 10 h à Paris
const maintenant = new Date("2026-10-16T08:00:00Z");

const saisie = {
  debut: "2026-10-19",
  personnes: 2,
  budget: 50,
  tempsMax: 30,
  creneaux: ["3-soir", "1-soir", "1-midi"],
  regime: " végétarien ",
  frigo: "",
};

describe("validerContraintes", () => {
  it("accepte une saisie correcte et nettoie les textes", () => {
    const resultat = validerContraintes(saisie, maintenant);
    expect(resultat).toEqual({
      contraintes: { ...saisie, regime: "végétarien", creneaux: ["1-midi", "1-soir", "3-soir"] },
    });
  });

  it("refuse une date trop éloignée ou mal formée", () => {
    expect(validerContraintes({ ...saisie, debut: "2027-03-01" }, maintenant)).toHaveProperty("erreur");
    expect(validerContraintes({ ...saisie, debut: "2026-10-01" }, maintenant)).toHaveProperty("erreur");
    expect(validerContraintes({ ...saisie, debut: "19/10/2026" }, maintenant)).toHaveProperty("erreur");
  });

  it("refuse un nombre de personnes, un budget ou un temps hors limites", () => {
    expect(validerContraintes({ ...saisie, personnes: 0 }, maintenant)).toHaveProperty("erreur");
    expect(validerContraintes({ ...saisie, personnes: 2.5 }, maintenant)).toHaveProperty("erreur");
    expect(validerContraintes({ ...saisie, budget: 5 }, maintenant)).toHaveProperty("erreur");
    expect(validerContraintes({ ...saisie, tempsMax: 25 }, maintenant)).toHaveProperty("erreur");
  });

  it("refuse un frigo trop long", () => {
    expect(validerContraintes({ ...saisie, frigo: "x".repeat(1001) }, maintenant)).toHaveProperty("erreur");
  });

  it("exige au moins un créneau, tous valides", () => {
    expect(validerContraintes({ ...saisie, creneaux: [] }, maintenant)).toHaveProperty("erreur");
    expect(validerContraintes({ ...saisie, creneaux: ["8-soir"] }, maintenant)).toHaveProperty("erreur");
    expect(validerContraintes({ ...saisie, creneaux: "1-soir" }, maintenant)).toHaveProperty("erreur");
  });

  it("retire les créneaux en double", () => {
    const resultat = validerContraintes({ ...saisie, creneaux: ["2-soir", "2-soir"] }, maintenant);
    expect("contraintes" in resultat && resultat.contraintes.creneaux).toEqual(["2-soir"]);
  });
});

describe("dates", () => {
  it("propose le lundi qui vient", () => {
    expect(prochainLundi(maintenant)).toBe("2026-10-19");
    expect(prochainLundi(new Date("2026-10-19T10:00:00Z"))).toBe("2026-10-19");
  });

  it("nomme la semaine et ses jours", () => {
    expect(titreSemaine("2026-10-19")).toBe("Semaine du 19 octobre");
    expect(libelleJour("2026-10-19", 7)).toBe("Dimanche 25 octobre");
  });
});

describe("créneaux", () => {
  it("décrit les choix courants en mots, les autres en nombre de repas", () => {
    expect(decrireCreneaux(TOUS_LES_SOIRS)).toBe("tous les soirs");
    expect(decrireCreneaux(TOUS_LES_CRENEAUX)).toBe("midi et soir, 7 jours");
    expect(decrireCreneaux(["1-soir", "2-midi", "2-soir"])).toBe("3 repas");
  });

  it("donne le jour abrégé et repère le week-end", () => {
    expect(libelleJourCourt("2026-10-19", 1)).toEqual({ semaine: "lun.", date: "19" });
    expect(estWeekEnd("2026-10-19", 6)).toBe(true);
    expect(estWeekEnd("2026-10-19", 5)).toBe(false);
  });
});

describe("afficherQuantite", () => {
  it("passe en kilos et en litres au-delà de 1 000", () => {
    expect(afficherQuantite(550, "g")).toBe("550 g");
    expect(afficherQuantite(1200, "g")).toBe("1,2 kg");
    expect(afficherQuantite(1500, "ml")).toBe("1,5 L");
    expect(afficherQuantite(3, "piece")).toBe("3");
  });
});
