"use client";

import { useState } from "react";
import { useLang } from "@/src/components/lang-context";
import { generateCleaningAccessToken, revokeCleaningAccessToken } from "@/src/app/actions/cleaning-token";
import { Link2, Copy, CheckCheck, RefreshCw, Trash2 } from "lucide-react";

interface CleaningShareButtonProps {
  cleaningId: string;
  existingToken?: string | null;
}

export default function CleaningShareButton({ cleaningId, existingToken }: CleaningShareButtonProps) {
  const { t } = useLang();
  const [token, setToken] = useState<string | null>(existingToken ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/pulizia/${token}`
    : null;

  async function handleGenerate() {
    setLoading(true);
    try {
      const newToken = await generateCleaningAccessToken(cleaningId);
      setToken(newToken);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRevoke() {
    setLoading(true);
    try {
      await revokeCleaningAccessToken(cleaningId);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  // Nessun link ancora generato → un solo pulsante primario a tutta larghezza.
  if (!token) {
    return (
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold bg-indigo-600 text-white shadow-sm active:scale-[.98] transition-transform disabled:opacity-50"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
        {t.shGenerateLink}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full overflow-hidden">
      {/* Link generato (sola lettura) */}
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2.5 overflow-hidden">
        <Link2 className="w-4 h-4 text-indigo-400 shrink-0" />
        <span className="text-xs text-indigo-700 font-mono truncate flex-1 min-w-0">{link}</span>
      </div>

      {/* Azione primaria: Copia */}
      <button
        onClick={handleCopy}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold bg-indigo-600 text-white shadow-sm active:scale-[.98] transition-transform"
      >
        {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copiato!" : "Copia link"}
      </button>

      {/* Azioni secondarie affiancate */}
      <div className="flex gap-2.5">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold bg-slate-50 border border-slate-200 text-slate-600 active:scale-[.98] transition-transform disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Rigenera
        </button>
        <button
          onClick={handleRevoke}
          disabled={loading}
          className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold bg-white border border-rose-200 text-rose-600 active:scale-[.98] transition-transform disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Revoca
        </button>
      </div>

      <p className="text-xs text-slate-400 break-words">
        Invia via WhatsApp — non serve login. Scade dopo 7 giorni.{" "}
        <span className="text-amber-600">{t.shRegenWarn}</span>
      </p>
    </div>
  );
}
