"use client";

import { useState } from "react";
import { generateMaintenanceAccessToken, revokeMaintenanceAccessToken } from "@/src/app/actions/maintenance-token";
import { Link2, Copy, CheckCheck, RefreshCw } from "lucide-react";

interface MaintenanceShareButtonProps {
  ticketId: string;
  existingToken?: string | null;
}

export default function MaintenanceShareButton({ ticketId, existingToken }: MaintenanceShareButtonProps) {
  const [token, setToken] = useState<string | null>(existingToken ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/manutenzione/${token}`
    : null;

  async function handleGenerate() {
    setLoading(true);
    try {
      const newToken = await generateMaintenanceAccessToken(ticketId);
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
      await revokeMaintenanceAccessToken(ticketId);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Link generato */}
      {link && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
          <Link2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span className="text-xs text-orange-700 font-mono truncate flex-1 min-w-0">{link}</span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiato!" : "Copia"}
          </button>
        </div>
      )}

      {/* Bottone genera */}
      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
          {token ? "Rigenera link" : "Genera link manutentore"}
        </button>
        {token && (
          <button
            onClick={handleRevoke}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
          >
            Revoca
          </button>
        )}
      </div>

      {token && (
        <p className="text-xs text-slate-400">
          Invia questo link al manutentore via WhatsApp — non serve login. Scade dopo 7 giorni.{" "}
          <span className="text-amber-600">Rigenerando o revocando, il vecchio non funzionerà più.</span>
        </p>
      )}
    </div>
  );
}
