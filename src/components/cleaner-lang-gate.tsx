"use client";

import type { ReactNode } from "react";
import { LangProvider } from "@/src/components/lang-context";
import LangGate from "@/src/components/lang-gate";

/**
 * Wraps the cleaner dashboard with LangProvider + LangGate.
 * On first access shows the language picker; once chosen, renders children normally.
 */
export default function CleanerLangGate({ children, availableExtraLangs }: { children: ReactNode; availableExtraLangs?: string[] }) {
  return (
    <LangProvider>
      <LangGate availableExtraLangs={availableExtraLangs}>{children}</LangGate>
    </LangProvider>
  );
}
