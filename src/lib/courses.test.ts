import { describe, expect, it } from "vitest";
import { cleNom, consoliderCourses, estToujoursDisponible } from "@/lib/courses";
import type { Ingredient, Produit, Repas } from "@/lib/semaine";

const ingredient = (nom: string, quantite: number, unite: Ingredient["unite"], rayon: Ingredient["rayon"]) => ({
  nom,
  quantite,
  unite,
  rayon,
});

function repas(jour: number, ingredients: Ingredient[]): Repas {
  return { jour, moment: "soir", titre: `Plat ${jour}`, temps_minutes: 30, ingredients, etapes: ["a", "b", "c"] };
}

const trouver = (articles: ReturnType<typeof consoliderCourses>, nom: string) =>
  articles.find((a) => cleNom(a.nom) === nom);

describe("cleNom", () => {
  it("ignore la casse, les accents et le pluriel", () => {
    expect(cleNom("Tomates")).toBe(cleNom("tomate"));
    expect(cleNom("Œufs")).toBe(cleNom("oeuf"));
    expect(cleNom("Crème fraîche")).toBe("creme fraiche");
  });

  it("ne tronque pas les mots courts", () => {
    expect(cleNom("riz")).toBe("riz");
  });
});

describe("estToujoursDisponible", () => {
  it("repère sel, poivre, huile et eau, même avec un qualificatif", () => {
    expect(estToujoursDisponible("Huile d'olive")).toBe(true);
    expect(estToujoursDisponible("poivre noir")).toBe(true);
    expect(estToujoursDisponible("Eau")).toBe(true);
  });

  it("ne confond pas un mot qui contient « eau »", () => {
    expect(estToujoursDisponible("poireau")).toBe(false);
    expect(estToujoursDisponible("gâteau")).toBe(false);
  });
});

describe("consoliderCourses", () => {
  it("additionne un même produit écrit de deux façons", () => {
    const articles = consoliderCourses(
      [
        repas(1, [ingredient("tomate", 2, "piece", "fruits_legumes")]),
        repas(2, [ingredient("Tomates", 3, "piece", "fruits_legumes")]),
      ],
      []
    );
    expect(articles).toHaveLength(1);
    expect(articles[0].quantite).toBe(5);
  });

  it("garde deux lignes pour deux unités différentes", () => {
    const articles = consoliderCourses(
      [repas(1, [ingredient("oignon", 1, "piece", "fruits_legumes"), ingredient("oignons", 100, "g", "fruits_legumes")])],
      []
    );
    expect(articles.map((a) => a.unite).sort()).toEqual(["g", "piece"]);
  });

  it("déduit le frigo des besoins de la semaine", () => {
    const frigo: Produit[] = [
      { nom: "riz", quantite: 1000, unite: "g" },
      { nom: "oeufs", quantite: 6, unite: "piece" },
    ];
    const articles = consoliderCourses(
      [
        repas(1, [ingredient("Riz", 700, "g", "epicerie"), ingredient("Œufs", 4, "piece", "cremerie")]),
        repas(2, [ingredient("riz", 500, "g", "epicerie"), ingredient("œufs", 4, "piece", "cremerie")]),
      ],
      frigo
    );
    expect(trouver(articles, "riz")?.quantite).toBe(200);
    expect(trouver(articles, "oeuf")?.quantite).toBe(2);
  });

  it("retire ce que le frigo couvre entièrement", () => {
    const articles = consoliderCourses(
      [repas(1, [ingredient("lardons", 150, "g", "viandes_poissons")])],
      [{ nom: "lardons", quantite: 200, unite: "g" }]
    );
    expect(articles).toEqual([]);
  });

  it("ne déduit pas un produit du frigo exprimé dans une autre unité", () => {
    const articles = consoliderCourses(
      [repas(1, [ingredient("lait de coco", 200, "ml", "epicerie")])],
      [{ nom: "lait de coco", quantite: 1, unite: "piece" }]
    );
    expect(trouver(articles, "lait de coco")?.quantite).toBe(200);
  });

  it("ne met jamais sel, poivre, huile ou eau sur la liste", () => {
    const articles = consoliderCourses(
      [repas(1, [ingredient("Huile d'olive", 20, "ml", "epicerie"), ingredient("courgette", 2, "piece", "fruits_legumes")])],
      []
    );
    expect(articles.map((a) => a.nom)).toEqual(["courgette"]);
  });

  it("arrondit les pièces au-dessus et les grammes à l'unité", () => {
    const articles = consoliderCourses(
      [repas(1, [ingredient("poivron", 1.5, "piece", "fruits_legumes"), ingredient("beurre", 12.4, "g", "cremerie")])],
      []
    );
    expect(trouver(articles, "poivron")?.quantite).toBe(2);
    expect(trouver(articles, "beurre")?.quantite).toBe(12);
  });

  it("trie par rayon, puis par nom", () => {
    const articles = consoliderCourses(
      [
        repas(1, [
          ingredient("pâtes", 200, "g", "epicerie"),
          ingredient("courgette", 1, "piece", "fruits_legumes"),
          ingredient("ail", 5, "g", "fruits_legumes"),
        ]),
      ],
      []
    );
    expect(articles.map((a) => a.nom)).toEqual(["ail", "courgette", "pâtes"]);
  });
});
