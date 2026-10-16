"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import AffichageFiche from "@/components/AffichageFiche";
import Icone from "@/components/Icone";
import SqueletteFiche from "@/components/SqueletteFiche";
import { LIMITES, type FicheEnregistree } from "@/lib/fiche";
import { creerClientNavigateur } from "@/lib/supabase/client";

type Mode = "texte" | "pdf";
type Etape = "envoi" | "enregistrement" | "generation";

const TAILLE_MAX_PDF = 5 * 1024 * 1024;
const DELAI_MAX_MS = 90000;

const LIBELLES_ETAPE: Record<Etape, string> = {
  envoi: "Envoi du fichier…",
  enregistrement: "Enregistrement de la demande…",
  generation: "Génération en arrière-plan…",
};

// La fiche n'a pas échoué : on a seulement cessé de l'attendre sur cette page.
class AttenteInterrompue extends Error {}

// Nombres d'interface en Archivo (Atkinson barre ses zéros). Archivo n'a pas l'espace
// fine insécable de fr-FR : espace simple, et le nombre ne se coupe pas.
const formatNombre = new Intl.NumberFormat("fr-FR");

function Chiffre({ n }: { n: number }) {
  const texte = formatNombre
    .formatToParts(n)
    .map((part) => (part.type === "group" ? " " : part.value))
    .join("");
  return <span className="chiffres whitespace-nowrap">{texte}</span>;
}

async function deposerPdf(fichier: File): Promise<string> {
  const supabase = creerClientNavigateur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Votre session a expiré. Reconnectez-vous.");
  }

  const chemin = `${user.id}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from("cours")
    .upload(chemin, fichier, { contentType: "application/pdf" });

  if (error) {
    console.error(error);
    throw new Error("L'envoi du fichier a échoué. Vérifiez qu'il s'agit d'un PDF de 5 Mo maximum.");
  }

  return chemin;
}

// S'abonne aux changements de la fiche et attend qu'elle soit prête ou en erreur
async function attendreFiche(id: string): Promise<FicheEnregistree> {
  const supabase = creerClientNavigateur();

  // Charge la session : l'abonnement doit être fait au nom de l'utilisateur,
  // pour que la Row Level Security autorise la réception des événements
  await supabase.auth.getSession();

  return new Promise((resolve, reject) => {
    const canal = supabase.channel(`fiche-${id}`);
    let termine = false;

    const minuteur = setTimeout(
      () =>
        terminer(() =>
          reject(
            new AttenteInterrompue(
              "La génération prend plus de temps que prévu. Votre fiche apparaîtra dans « Mes fiches » dès qu'elle sera prête."
            )
          )
        ),
      DELAI_MAX_MS
    );

    function terminer(action: () => void) {
      if (termine) return;
      termine = true;
      clearTimeout(minuteur);
      supabase.removeChannel(canal);
      action();
    }

    function examiner(fiche: FicheEnregistree) {
      if (fiche.statut === "prete") {
        terminer(() => resolve(fiche));
      } else if (fiche.statut === "erreur") {
        terminer(() =>
          reject(new Error(fiche.message_erreur ?? "La génération de la fiche a échoué."))
        );
      }
    }

    canal
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "fiches", filter: `id=eq.${id}` },
        (evenement) => examiner(evenement.new as FicheEnregistree)
      )
      .subscribe(async (statut) => {
        if (statut === "SUBSCRIBED") {
          // La génération a pu se terminer avant l'abonnement : on vérifie une fois l'état actuel
          const reponse = await fetch(`/api/fiches/${id}`, { cache: "no-store" });
          if (reponse.ok) examiner(await reponse.json());
        }

        if (statut === "CHANNEL_ERROR" || statut === "TIMED_OUT") {
          terminer(() =>
            reject(
              new AttenteInterrompue(
                "La connexion en temps réel a échoué. Votre fiche apparaîtra dans « Mes fiches » dès qu'elle sera prête."
              )
            )
          );
        }
      });
  });
}

function JaugeLongueur({ longueur, id }: { longueur: number; id: string }) {
  const tropCourt = longueur < LIMITES.texteMin;
  const tropLong = longueur > LIMITES.texteMax;
  const remplissage = Math.min(longueur / LIMITES.texteMax, 1) * 100;
  const seuilMin = (LIMITES.texteMin / LIMITES.texteMax) * 100;

  let statut: ReactNode;
  if (longueur === 0) {
    statut = (
      <>
        Entre <Chiffre n={LIMITES.texteMin} /> et <Chiffre n={LIMITES.texteMax} /> caractères
      </>
    );
  } else if (tropCourt) {
    statut = (
      <>
        Encore <Chiffre n={LIMITES.texteMin - longueur} /> caractères au minimum
      </>
    );
  } else if (tropLong) {
    statut = (
      <span className="surligne surligne-toujours font-semibold text-encre">
        <Chiffre n={longueur - LIMITES.texteMax} /> caractères en trop : raccourcissez le cours
      </span>
    );
  } else {
    statut = (
      <span className="inline-flex items-center gap-1.5 text-encre">
        <Icone nom="valide" className="size-4" />
        Longueur correcte
      </span>
    );
  }

  return (
    <div className="mt-3">
      <div className="relative h-2.5 bg-papier-2" aria-hidden="true">
        {/* Graduations tous les 1 000 caractères */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, transparent 0 calc(12.5% - 1px), var(--filet-doux) calc(12.5% - 1px) 12.5%)",
          }}
        />
        <div
          className={`absolute inset-y-0 left-0 transition-[width,background-color] duration-300 ease-sortie ${
            tropLong ? "bg-surligneur" : tropCourt ? "bg-encre-3" : "bg-encre"
          }`}
          style={{ width: `${remplissage}%` }}
        />
        <div
          className="absolute -top-1 -bottom-1 w-0.5 bg-encre"
          style={{ left: `${seuilMin}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <p id={id} className="text-encre-2">
          {statut}
        </p>
        <p className="text-encre-2">
          <Chiffre n={longueur} /> / <Chiffre n={LIMITES.texteMax} />
        </p>
      </div>
    </div>
  );
}

function StatutFichier({ fichier, valide, id }: { fichier: File | null; valide: boolean; id: string }) {
  let statut: ReactNode;
  if (fichier === null) {
    statut = (
      <>
        PDF de <Chiffre n={5} /> Mo maximum, contenant du texte sélectionnable (pas un scan)
      </>
    );
  } else if (!valide) {
    statut = (
      <span className="surligne surligne-toujours font-semibold text-encre">
        Ce fichier n&apos;est pas un PDF de 5 Mo maximum
      </span>
    );
  } else {
    statut = (
      <span className="inline-flex max-w-full items-center gap-1.5 text-encre">
        <Icone nom="valide" className="size-4 shrink-0" />
        <span className="truncate">{fichier.name}</span>
        <span className="chiffres shrink-0 text-encre-2">
          ({(fichier.size / 1024 / 1024).toFixed(1).replace(".", ",")} Mo)
        </span>
      </span>
    );
  }

  return (
    <p id={id} className="mt-3 text-sm text-encre-2">
      {statut}
    </p>
  );
}

function Chargement() {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {["bg-essentiel", "bg-teste", "bg-surligneur", "bg-papier"].map((couleur, i) => (
        <span
          key={couleur}
          className={`ligne-attente size-2 ${couleur}`}
          style={{ animationDelay: `${i * 160}ms`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

export default function FormulaireFiche({ children }: { children?: ReactNode }) {
  const [mode, setMode] = useState<Mode>("texte");
  const [titre, setTitre] = useState("");
  const [texte, setTexte] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [cleFichier, setCleFichier] = useState(0);
  const [etape, setEtape] = useState<Etape | null>(null);
  const [erreur, setErreur] = useState("");
  const [attente, setAttente] = useState("");
  const [fiche, setFiche] = useState<FicheEnregistree | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);
  const [tentative, setTentative] = useState(false);
  const zoneResultat = useRef<HTMLDivElement>(null);
  const titreResultat = useRef<HTMLHeadingElement>(null);
  const champTitre = useRef<HTMLInputElement>(null);
  const champTexte = useRef<HTMLTextAreaElement>(null);
  const champFichier = useRef<HTMLInputElement>(null);

  const chargement = etape !== null;
  const texteValide =
    texte.length >= LIMITES.texteMin && texte.length <= LIMITES.texteMax;
  const fichierValide =
    fichier !== null &&
    fichier.type === "application/pdf" &&
    fichier.size <= TAILLE_MAX_PDF;
  const contenuValide = mode === "texte" ? texteValide : fichierValide;
  const formulaireValide = titre.trim() !== "" && contenuValide;

  useEffect(() => {
    if (!fiche) return;
    const sansMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    zoneResultat.current?.scrollIntoView({
      behavior: sansMouvement ? "auto" : "smooth",
      block: "start",
    });
    titreResultat.current?.focus({ preventScroll: true });
  }, [fiche]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();

    // Le bouton reste actif : on explique ce qui manque et on place le curseur au bon endroit.
    if (!formulaireValide) {
      setTentative(true);
      const champ =
        titre.trim() === "" ? champTitre : mode === "texte" ? champTexte : champFichier;
      champ.current?.focus();
      return;
    }

    setTentative(false);
    setErreur("");
    setAttente("");
    setFiche(null);

    try {
      let corps: { titre: string; texte?: string; cheminFichier?: string };

      if (mode === "pdf" && fichier) {
        setEtape("envoi");
        const cheminFichier = await deposerPdf(fichier);
        corps = { titre, cheminFichier };
      } else {
        corps = { titre, texte };
      }

      setEtape("enregistrement");
      const reponse = await fetch("/api/fiches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      const donnees = await reponse.json().catch(() => ({}));

      // Présent sur une réponse 202 comme sur une réponse 429
      const entete = reponse.headers.get("X-RateLimit-Remaining");
      if (entete !== null) setRestantes(Number(entete));

      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Une erreur est survenue.");
        return;
      }

      // La demande est acceptée : on vide le formulaire et on attend la fiche
      setTitre("");
      setTexte("");
      setFichier(null);
      setCleFichier((cle) => cle + 1);

      setEtape("generation");
      const ficheTerminee = await attendreFiche(donnees.id);
      setFiche(ficheTerminee);
    } catch (err) {
      if (err instanceof AttenteInterrompue) {
        setAttente(err.message);
      } else {
        setErreur(
          err instanceof TypeError
            ? "Impossible de contacter le serveur."
            : (err as Error).message
        );
      }
    } finally {
      setEtape(null);
    }
  }

  let aide: ReactNode = null;
  if (!chargement && !formulaireValide) {
    if (titre.trim() === "" && !contenuValide) {
      aide =
        mode === "texte" ? (
          <>
            Ajoutez un titre et au moins <Chiffre n={LIMITES.texteMin} /> caractères de cours.
          </>
        ) : (
          "Ajoutez un titre et choisissez le PDF du cours."
        );
    } else if (titre.trim() === "") {
      aide = "Ajoutez un titre pour retrouver la fiche.";
    } else if (mode === "texte") {
      aide = "Ajustez la longueur du cours.";
    } else {
      aide = fichier === null ? "Choisissez le PDF du cours." : "Choisissez un PDF de 5 Mo maximum.";
    }
  }

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
        <form onSubmit={envoyer} className="flex flex-col gap-6 lg:col-span-7" aria-busy={chargement}>
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor="titre" className="font-bold">
                Titre du cours
              </label>
              <span className="chiffres text-sm text-encre-3" aria-hidden="true">
                {titre.length} / {LIMITES.titreMax}
              </span>
            </div>
            <input
              id="titre"
              ref={champTitre}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              maxLength={LIMITES.titreMax}
              placeholder="Ex. : Introduction au cloud computing"
              autoComplete="off"
              aria-invalid={tentative && titre.trim() === ""}
              disabled={chargement}
              className="champ mt-2 text-[1.125rem] font-semibold placeholder:font-normal disabled:bg-papier-2"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <span className="font-bold">
                {mode === "texte" ? (
                  <label htmlFor="texte">Texte du cours</label>
                ) : (
                  <label htmlFor="fichier">Fichier PDF du cours</label>
                )}
              </span>
              <div role="group" aria-label="Source du cours" className="flex border-2 border-encre">
                {(
                  [
                    { valeur: "texte", libelle: "Coller un texte" },
                    { valeur: "pdf", libelle: "Envoyer un PDF" },
                  ] as const
                ).map(({ valeur, libelle }) => (
                  <button
                    key={valeur}
                    type="button"
                    onClick={() => setMode(valeur)}
                    aria-pressed={mode === valeur}
                    disabled={chargement}
                    className={`min-h-9 cursor-pointer px-3 text-[0.9rem] font-bold transition-colors disabled:cursor-not-allowed ${
                      mode === valeur ? "bg-encre text-papier" : "bg-papier text-encre hover:bg-surligneur"
                    }`}
                  >
                    {libelle}
                  </button>
                ))}
              </div>
            </div>

            {mode === "texte" ? (
              <>
                <textarea
                  id="texte"
                  ref={champTexte}
                  value={texte}
                  onChange={(e) => setTexte(e.target.value)}
                  placeholder="Collez ici le contenu de votre cours…"
                  aria-describedby="texte-statut"
                  aria-invalid={(texte.length > 0 || tentative) && !texteValide}
                  disabled={chargement}
                  className="champ mt-2 h-60 resize-y sm:h-72 disabled:bg-papier-2"
                />
                <JaugeLongueur longueur={texte.length} id="texte-statut" />
              </>
            ) : (
              <>
                <input
                  key={cleFichier}
                  id="fichier"
                  ref={champFichier}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
                  aria-describedby="fichier-statut"
                  aria-invalid={(fichier !== null || tentative) && !fichierValide}
                  disabled={chargement}
                  className="champ mt-2 cursor-pointer text-encre-2 file:mr-4 file:cursor-pointer file:border-2 file:border-encre file:bg-papier file:px-4 file:py-1.5 file:font-bold file:text-encre file:transition-colors hover:file:bg-surligneur disabled:cursor-not-allowed disabled:bg-papier-2"
                />
                <StatutFichier fichier={fichier} valide={fichierValide} id="fichier-statut" />
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={chargement}
              className="bouton bouton-principal w-full disabled:cursor-wait disabled:border-encre disabled:bg-encre disabled:text-papier sm:w-auto sm:min-w-56"
            >
              {etape ? (
                <>
                  <Chargement />
                  {LIBELLES_ETAPE[etape]}
                </>
              ) : (
                "Générer la fiche"
              )}
            </button>
            {aide &&
              (tentative ? (
                <p role="alert" className="text-[0.95rem] font-semibold text-encre">
                  <span className="surligne surligne-toujours">{aide}</span>
                </p>
              ) : (
                <p className="text-[0.95rem] text-encre-2">{aide}</p>
              ))}
          </div>

          {restantes !== null && (
            <p className="-mt-2 text-sm text-encre-2">
              {restantes > 0 ? (
                <>
                  Il vous reste <Chiffre n={restantes} /> génération{restantes > 1 ? "s" : ""}{" "}
                  pour l&apos;heure en cours.
                </>
              ) : (
                "Vous avez utilisé tout votre quota pour l'heure en cours."
              )}
            </p>
          )}
        </form>

        {children && <div className="lg:col-span-5">{children}</div>}
      </div>

      <div ref={zoneResultat} className="scroll-mt-6">
        {erreur && (
          <div
            role="alert"
            className="mt-12 flex gap-4 bg-surligneur-pale px-5 py-4 sm:px-6"
          >
            <Icone nom="attention" className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-bold">La fiche n&apos;a pas pu être créée</p>
              <p className="mt-1 text-encre-2">{erreur}</p>
            </div>
          </div>
        )}

        {attente && (
          <div role="status" className="mt-12 flex gap-4 border-2 border-filet px-5 py-4 sm:px-6">
            <Icone nom="revoir" className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-bold">La fiche est toujours en préparation</p>
              <p className="mt-1 text-encre-2">{attente}</p>
              <Link href="/fiches" className="mt-3 inline-flex items-center gap-2 font-semibold">
                Mes fiches
                <Icone nom="suite" className="size-4" />
              </Link>
            </div>
          </div>
        )}

        {chargement && (
          <div className="mt-16">
            <p role="status" className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-encre-2">
              <span className="archivo-large text-2xl font-extrabold text-encre">
                Rédaction de la fiche
              </span>
              <span className="sr-only">en cours. </span>
              {etape === "generation"
                ? "Vous pouvez quitter cette page : la fiche apparaîtra dans « Mes fiches » dès qu'elle sera prête."
                : "Cela peut prendre quelques secondes."}
            </p>
            <SqueletteFiche />
          </div>
        )}

        {fiche && (
          <section aria-labelledby="titre-resultat" className="mt-16 border-t-2 border-filet pt-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id="titre-resultat"
                  ref={titreResultat}
                  tabIndex={-1}
                  className="archivo-large text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] font-extrabold tracking-tight outline-none"
                >
                  {fiche.titre}
                </h2>
                <p className="mt-2 inline-flex items-center gap-2 text-encre-2">
                  <Icone nom="valide" className="size-4 text-encre" />
                  Fiche enregistrée dans vos fiches.
                </p>
              </div>
              <Link href={`/fiches/${fiche.id}`} className="bouton bouton-secondaire">
                Ouvrir la fiche
                <Icone nom="suite" className="size-4" />
              </Link>
            </div>
            <AffichageFiche fiche={fiche} />
          </section>
        )}
      </div>
    </>
  );
}
