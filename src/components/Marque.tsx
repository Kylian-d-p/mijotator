// La marque : une cocotte en fonte de profil. Au survol du lien d'accueil, son couvercle se soulève.
export default function Marque({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="var(--fonte)" className={`shrink-0 ${className}`}>
      <g className="marque-couvercle">
        <rect x="10" y="5" width="4" height="3" rx="1" />
        <rect x="3" y="8.5" width="18" height="2.5" rx="1.25" />
      </g>
      <path d="M4.5 12.5h15v4.5a3.5 3.5 0 0 1-3.5 3.5H8A3.5 3.5 0 0 1 4.5 17z" />
      <rect x="1.5" y="13.5" width="3.5" height="2.5" rx="1.25" />
      <rect x="19" y="13.5" width="3.5" height="2.5" rx="1.25" />
    </svg>
  );
}
