"use client";

import Icone from "@/components/Icone";

export default function BoutonImprimer({ className = "bouton-secondaire" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`bouton sans-impression ${className}`}
    >
      <Icone nom="imprimer" className="size-4" />
      Imprimer
    </button>
  );
}
