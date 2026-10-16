const TRACES = {
  retour: <path d="M19 12H5m6-6-6 6 6 6" />,
  suite: <path d="M5 12h14m-6-6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  retourner: (
    <>
      <path d="M4 12a8 8 0 0 1 13.66-5.66L20 8.5" />
      <path d="M20 3.5v5h-5" />
      <path d="M20 12a8 8 0 0 1-13.66 5.66L4 15.5" />
      <path d="M4 20.5v-5h5" />
    </>
  ),
  valide: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  revoir: (
    <>
      <path d="M12 8v5" />
      <path d="M12 16.5v.01" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  imprimer: (
    <>
      <path d="M7 9V3h10v6" />
      <path d="M7 17H4v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7h-3" />
      <path d="M7 14h10v7H7z" />
    </>
  ),
  attention: (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.5v.01" />
    </>
  ),
  recommencer: (
    <>
      <path d="M4 12a8 8 0 1 0 2.34-5.66L4 8.5" />
      <path d="M4 3.5v5h5" />
    </>
  ),
  sortie: (
    <>
      <path d="M10 4H4v16h6" />
      <path d="M9 12h11m-4-4 4 4-4 4" />
    </>
  ),
  telecharger: (
    <>
      <path d="M12 4v11m-5-5 5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6m-6 4h6" />
    </>
  ),
  courrier: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
} as const;

export type NomIcone = keyof typeof TRACES;

export default function Icone({
  nom,
  className = "size-5",
}: {
  nom: NomIcone;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      {TRACES[nom]}
    </svg>
  );
}
