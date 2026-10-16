"use client";

import { useSyncExternalStore } from "react";
import { abonner, lireBrut, notesDeLaFiche } from "@/lib/auto-evaluation";

// Score d'auto-évaluation d'une fiche dans le sommaire (stocké dans ce navigateur).
export default function ScoreFiche({ idFiche }: { idFiche: string }) {
  const brut = useSyncExternalStore(abonner, lireBrut, () => null);
  const notes = notesDeLaFiche(brut, idFiche);
  const notees = notes.filter((n) => n !== null).length;

  if (notees === 0) return null;

  const sues = notes.filter((n) => n === "su").length;
  return (
    <span
      className="bg-teste-pale px-2 py-0.5 text-[0.8125rem] font-bold text-teste-fonce tabular-nums"
      title={`${sues} question${sues > 1 ? "s" : ""} sue${sues > 1 ? "s" : ""} sur ${notes.length}`}
    >
      <span className="sr-only">Score : </span>
      {sues}/{notes.length}
    </span>
  );
}
