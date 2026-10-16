import Link from "next/link";
import Icone from "@/components/Icone";

// Sur le bandeau flamme de la semaine, la liste de courses s'annonce dans son propre émail
export default function LienCourses({
  semaineId,
  articles,
  coches,
}: {
  semaineId: string;
  articles: number;
  coches: number;
}) {
  return (
    <Link
      href={`/semaines/${semaineId}/courses`}
      className="group flex w-full items-center gap-4 rounded-2xl border-b-4 border-fonte bg-basilic px-4 py-3.5 text-email no-underline shadow-[0_14px_22px_-14px_rgb(0_0_0/0.85)] transition-transform duration-200 ease-sortie hover:-translate-y-0.5 sm:w-auto sm:min-w-80 sm:px-5"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-email text-basilic">
        <Icone nom="panier" className="size-6" />
      </span>
      <span className="flex-1">
        <span className="block text-lg leading-tight font-bold">Liste de courses</span>
        <span className="chiffres text-sm text-white/90">
          {articles === 0
            ? "Rien à acheter"
            : `${articles} article${articles > 1 ? "s" : ""} · ${coches} coché${coches > 1 ? "s" : ""}`}
        </span>
      </span>
      <Icone nom="suite" className="size-5 shrink-0 transition-transform duration-200 ease-sortie group-hover:translate-x-0.5" />
    </Link>
  );
}
