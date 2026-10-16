import { describe, expect, it } from "vitest";
import { afficherQuantite, libelleJour, prochainLundi, titreSemaine, validerContraintes } from "@/lib/semaine";

// Vendredi 16 octobre 2026, 10 h à Paris
const maintenant = new Date("2026-10-16T08:00:00Z");

const saisie = {
  debut: "2026-10-19",
  personnes: 2,
  budget: 50,
  tempsMax: 30,
  midi: false,
  regime: " végétarien ",
  frigo: "",
};

describe("validerContraintes", () => {
  it("accepte une saisie correcte et nettoie les textes", () => {
    const resultat = validerContraintes(saisie, maintenant);
    expect(resultat).toEqual({ contraintes: { ...saisie, regime: "végétarien" } });
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

  it("ne prend midi que s'il vaut exactement true", () => {
    const resultat = validerContraintes({ ...saisie, midi: "oui" }, maintenant);
    expect("contraintes" in resultat && resultat.contraintes.midi).toBe(false);
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

describe("afficherQuantite", () => {
  it("passe en kilos et en litres au-delà de 1 000", () => {
    expect(afficherQuantite(550, "g")).toBe("550 g");
    expect(afficherQuantite(1200, "g")).toBe("1,2 kg");
    expect(afficherQuantite(1500, "ml")).toBe("1,5 L");
    expect(afficherQuantite(3, "piece")).toBe("3");
  });
});
