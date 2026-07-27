"use client";

import { useState } from "react";
import { useLang } from "@/src/components/lang-context";
import { generateCleaningAccessToken, revokeCleaningAccessToken } from "@/src/app/actions/cleaning-token";
import { Link2, Copy, CheckCheck, RefreshCw } from "lucide-react";

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

  return (
    <div className="flex flex-col gap-2 w-full overflow-hidden">
      {/* Link generato */}
      {link && (
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 overflow-hidden">
          <Link2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs text-indigo-700 font-mono truncate flex-1 min-w-0">{link}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiato!" : "Copia"}
          </button>
        </div>
      )}

      {/* Bottoni */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition-colors disabled:opacity-50 w-fit"
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
        {token ? "Rigenera link" : "{t.shGenerateLink}"}
      </button>

      {token && (
        <button
          onClick={handleRevoke}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 w-fit"
        >
          Revoca link
        </button>
      )}

      {token && (
        <p className="text-xs text-slate-400 break-words">
          Invia via WhatsApp — non serve login. Scade dopo 7 giorni.{" "}
          <span className="text-amber-600">{t.shRegenWarn}</span>
        </p>
      )}
    </div>
  );
}
