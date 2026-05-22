"use client";

import { ReactNode } from "react";
import { useLang } from "@/src/components/lang-context";
import LangPicker from "@/src/components/lang-picker";

export default function LangGate({ children }: { children: ReactNode }) {
  const { lang, mounted } = useLang();

  // Not mounted yet: show neutral loading (same gradient, no content flash)
  if (!mounted) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(160deg, #4338ca, #7c3aed)" }}
      />
    );
  }

  // Mounted but no language selected: show picker
  if (!lang) {
    return <LangPicker />;
  }

  // Language selected: show full content
  return <>{children}</>;
}
