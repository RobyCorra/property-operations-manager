"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "@/src/components/toast-provider";

/**
 * Molte azioni server terminano con un redirect: il toast lanciato dal
 * client verrebbe perso durante la navigazione. Queste azioni aggiungono
 * `?saved=<chiave>` alla destinazione; qui il messaggio viene mostrato e
 * il parametro rimosso dall'URL.
 */
const MESSAGES: Record<string, string> = {
  "1": "Modifiche salvate",
  user: "Utente salvato",
  booking: "Prenotazione salvata",
  cleaning: "Pulizia salvata",
  maintenance: "Intervento salvato",
  apartment: "Appartamento salvato",
};

export default function ToastOnRedirect() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const shown = useRef<string | null>(null);

  const saved = params.get("saved");

  useEffect(() => {
    if (!saved || shown.current === saved) return;
    shown.current = saved;

    toast.success(MESSAGES[saved] ?? "Modifiche salvate");

    // Ripulisce l'URL così un refresh non rimostra il messaggio
    const next = new URLSearchParams(params.toString());
    next.delete("saved");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [saved]);

  return null;
}
