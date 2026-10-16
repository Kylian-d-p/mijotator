// La marque : un couvercle de cocotte vu de dessus, émail flamme et bouton en fonte
export default function Marque({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`marque-couvercle shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="11" fill="var(--flamme)" />
      <circle cx="12" cy="12" r="8" fill="none" stroke="var(--braise)" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.5" fill="var(--fonte)" />
    </svg>
  );
}
