// Auto-évaluation des questions, conservée dans le navigateur (localStorage).
// Les notes restent propres à chaque appareil : elles ne suivent pas le compte.

export type Note = "su" | "revoir";
export type NotesFiche = (Note | null)[];

const CLE = "revizator:auto-evaluation";
const abonnes = new Set<() => void>();

// Copie en mémoire si le stockage est indisponible (navigation privée, quota) :
// les notes restent alors valables le temps de la visite.
let secours: string | null = null;
let stockageIndisponible = false;

export function lireBrut(): string | null {
  if (stockageIndisponible) return secours;
  try {
    return window.localStorage.getItem(CLE);
  } catch {
    stockageIndisponible = true;
    return secours;
  }
}

export function abonner(rappel: () => void) {
  abonnes.add(rappel);
  window.addEventListener("storage", rappel);
  return () => {
    abonnes.delete(rappel);
    window.removeEventListener("storage", rappel);
  };
}

function toutesLesNotes(brut: string | null): Record<string, NotesFiche> {
  if (!brut) return {};
  try {
    const donnees = JSON.parse(brut);
    return typeof donnees === "object" && donnees !== null ? donnees : {};
  } catch {
    return {};
  }
}

export function notesDeLaFiche(
  brut: string | null,
  id: string,
  nombreQuestions?: number
): NotesFiche {
  const notes = toutesLesNotes(brut)[id];
  const valides = Array.isArray(notes)
    ? notes.map((n) => (n === "su" || n === "revoir" ? n : null))
    : [];
  const longueur = nombreQuestions ?? valides.length;
  return Array.from({ length: longueur }, (_, i) => valides[i] ?? null);
}

export function enregistrerNotes(id: string, notes: NotesFiche | null) {
  const toutes = toutesLesNotes(lireBrut());
  if (notes && notes.some((n) => n !== null)) {
    toutes[id] = notes;
  } else {
    delete toutes[id];
  }

  const brut = JSON.stringify(toutes);
  secours = brut;
  try {
    if (!stockageIndisponible) window.localStorage.setItem(CLE, brut);
  } catch {
    stockageIndisponible = true;
  }
  abonnes.forEach((rappel) => rappel());
}
