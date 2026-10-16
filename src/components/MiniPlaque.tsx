// Petite plaque de cuisson décorative : 7 jours × 2 repas, les feux allumés portent un couvercle
export default function MiniPlaque({
  allumes = [],
  surFonte = false,
  className = "",
}: {
  allumes?: number[];
  surFonte?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`grid grid-cols-7 gap-1 rounded-xl p-2 ${surFonte ? "bg-fonte-douce" : "bg-fonte"} ${className}`}
    >
      {Array.from({ length: 14 }, (_, i) =>
        allumes.includes(i) ? (
          <span key={i} className="flex aspect-square items-center justify-center rounded-full bg-flamme">
            <span className="size-1/3 rounded-full bg-fonte" />
          </span>
        ) : (
          <span key={i} className="aspect-square rounded-full border-[1.5px] border-[#7a716a]" />
        )
      )}
    </div>
  );
}
