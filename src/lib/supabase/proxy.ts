import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CHEMINS_PUBLICS = ["/connexion", "/auth", "/api", "/monitoring"];

export async function mettreAJourSession(request: NextRequest) {
  let reponse = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesAEcrire, enTetes) {
        cookiesAEcrire.forEach(({ name, value }) => request.cookies.set(name, value));
        reponse = NextResponse.next({ request });
        cookiesAEcrire.forEach(({ name, value, options }) => reponse.cookies.set(name, value, options));
        // Une réponse qui écrit les cookies de session ne doit jamais être mise en cache
        Object.entries(enTetes).forEach(([nom, valeur]) => reponse.headers.set(nom, valeur));
      },
    },
  });

  // Vérifie le jeton auprès de Supabase et le rafraîchit si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const chemin = request.nextUrl.pathname;
  const cheminPublic = CHEMINS_PUBLICS.some((prefixe) => chemin.startsWith(prefixe));

  if (!user && !cheminPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  return reponse;
}
