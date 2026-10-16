"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// N'affiche rien : rattache les erreurs du navigateur à l'identifiant de l'utilisateur connecté
export default function SentryUtilisateur({ id }: { id: string }) {
  useEffect(() => {
    Sentry.setUser({ id });
    return () => Sentry.setUser(null);
  }, [id]);

  return null;
}
