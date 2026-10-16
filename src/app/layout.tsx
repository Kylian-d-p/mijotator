import type { Metadata } from "next";
import { Archivo, Atkinson_Hyperlegible_Next } from "next/font/google";
import EnTete from "@/components/EnTete";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Next.js n'a pas les métriques d'Atkinson Hyperlegible Next pour calculer une police de
// secours ajustée, et le signale à chaque compilation : on déclare donc la même pile de
// secours que --font-sans (globals.css).
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: false,
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
    <html
      lang="fr"
      className={`${archivo.variable} ${atkinson.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <EnTete />
        <div className="flex-1">{children}</div>
        <footer className="sans-impression border-t border-filet-doux">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-6 text-sm text-encre-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p>Menus proposés par une IA : vérifiez allergènes, quantités et cuissons avant de cuisiner.</p>
            <p className="archivo-etroit font-semibold uppercase tracking-wide">Mijotator</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
