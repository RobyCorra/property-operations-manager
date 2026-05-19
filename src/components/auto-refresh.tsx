"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * AutoRefresh — chiama router.refresh() ogni `intervalMs` millisecondi.
 * Usato nel layout manager per aggiornare la dashboard quando cleaner/manutentori
 * cambiano lo stato di pulizie o ticket senza che il manager debba ricaricare la pagina.
 */
export default function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
