import { creneau, JOURS, MOMENTS, type Creneau } from "@/lib/semaine";

// Miniature du planning : 7 jours × midi et soir, les repas prévus dans l'émail de leur moment.
// Elle dit d'un coup d'œil la forme d'une semaine (tous les soirs, midis du week-end…).
export default function MiniPlanning({
  creneaux,
  etat = "prete",
  surFonte = false,
  className = "",
}: {
  creneaux: readonly Creneau[];
  etat?: "prete" | "en_attente" | "erreur";
  surFonte?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`grid grid-cols-7 gap-[2px] ${className}`}>
      {MOMENTS.flatMap((moment) =>
        JOURS.map((jour) => {
          const c = creneau(jour, moment);
          const couleur = !creneaux.includes(c)
            ? surFonte
              ? "bg-white/12"
              : "bg-email-3"
            : etat === "erreur"
              ? "bg-bord"
              : etat === "en_attente"
                ? "ligne-attente bg-flamme/45"
                : moment === "midi"
                  ? "bg-flamme"
                  : "bg-braise";
          return <span key={c} className={`aspect-square rounded-[2px] ${couleur}`} />;
        })
      )}
    </div>
  );
}
