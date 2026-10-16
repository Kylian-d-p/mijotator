import { controleBase } from "@/lib/controles";
import { executerControle } from "@/lib/statut";

export const dynamic = "force-dynamic";

const ENTETES = { "Cache-Control": "no-store" };

// Route publique interrogée par UptimeRobot : un code HTTP et un statut, aucun détail technique
export async function GET() {
  // Interrupteur de démonstration, utilisé pour simuler une panne sans rien casser
  if (process.env.SIMULER_PANNE === "true") {
    return Response.json({ statut: "indisponible" }, { status: 503, headers: ENTETES });
  }

  const base = await executerControle(controleBase);
  const disponible = base.statut !== "en_panne";

  return Response.json(
    { statut: disponible ? "ok" : "indisponible", verifieLe: new Date().toISOString() },
    { status: disponible ? 200 : 503, headers: ENTETES }
  );
}
