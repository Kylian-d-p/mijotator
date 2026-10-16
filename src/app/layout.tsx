import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import EnTete from "@/components/EnTete";
import Marque from "@/components/Marque";
import "./globals.css";

// Une seule famille pour tout : resserrée et grasse pour les titres, normale pour le texte
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
  title: {
    default: "Mijotator",
    template: "%s · Mijotator",
  },
  description:
    "Donnez vos contraintes, obtenez les repas de la semaine et la liste de courses qui va avec.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <EnTete />
        <div className="flex-1">{children}</div>
        <footer className="sans-impression border-t border-trait">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-fonte-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p>Menus proposés par une IA : vérifiez allergènes, quantités et cuissons avant de cuisiner.</p>
            <p className="flex items-center gap-2 font-bold text-fonte-2">
              <Marque className="size-4" />
              Mijotator
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
