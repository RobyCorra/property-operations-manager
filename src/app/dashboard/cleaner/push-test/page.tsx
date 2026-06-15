"use client";

import { useEffect, useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

function now() {
  return new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

interface LogEntry { ts: string; level: "info" | "ok" | "warn" | "error"; msg: string; }

export default function CleanerPushTestPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isNative, setIsNative] = useState(false);
  const [apnsTokenInDb, setApnsTokenInDb] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  function log(level: LogEntry["level"], msg: string) {
    setLogs(prev => [{ ts: now(), level, msg }, ...prev].slice(0, 60));
  }

  const checkAll = useCallback(async () => {
    log("info", "── Controllo stato push ──");

    const native = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    setIsNative(native);
    log("info", `Piattaforma: ${platform} — nativo: ${native ? "sì" : "no"}`);

    if (!native) {
      log("warn", "Non sei su app nativa — Web Push non supportato in WKWebView");
      log("info", "Su app Capacitor le push arrivano solo tramite APNs (iOS nativo)");
      return;
    }

    // Controlla token APNs nel DB
    try {
      const res = await fetch("/api/apns-token/status");
      if (res.ok) {
        const data = await res.json();
        setApnsTokenInDb(data.hasToken);
        log(data.hasToken ? "ok" : "warn",
          data.hasToken
            ? `Token APNs registrato nel DB: ...${data.tokenShort}`
            : "Nessun token APNs nel DB — notifiche non attive");
      } else {
        log("warn", "Impossibile verificare token APNs nel DB");
      }
    } catch (e) {
      log("error", `Errore verifica DB: ${e}`);
    }
  }, []);

  useEffect(() => { checkAll(); }, [checkAll]);

  async function handleRegisterApns() {
    setBusy(true);
    try {
      log("info", "Richiedo permesso notifiche iOS...");
      const perm = await PushNotifications.requestPermissions();
      log(perm.receive === "granted" ? "ok" : "error", `Permesso: ${perm.receive}`);
      if (perm.receive !== "granted") { setBusy(false); return; }

      log("info", "Registro con APNs...");
      await PushNotifications.register();

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          log("warn", "Timeout — nessun token ricevuto da APNs in 10s");
          resolve();
        }, 10000);

        PushNotifications.addListener("registration", async (token) => {
          clearTimeout(timeout);
          log("ok", `Token APNs ricevuto: ...${token.value.slice(-20)}`);
          try {
            const res = await fetch("/api/apns-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: token.value }),
            });
            if (res.ok) {
              log("ok", "Token salvato nel DB ✓");
              setApnsTokenInDb(true);
            } else {
              log("error", "Errore salvataggio token nel DB");
            }
          } catch (e) {
            log("error", `Errore salvataggio: ${e}`);
          }
          resolve();
        });

        PushNotifications.addListener("registrationError", (err) => {
          clearTimeout(timeout);
          log("error", `Registrazione APNs fallita: ${JSON.stringify(err)}`);
          resolve();
        });
      });
    } catch (e) {
      log("error", `Errore: ${e}`);
    }
    setBusy(false);
  }

  async function handleTestApns() {
    setBusy(true);
    log("info", "Invio push APNs di test dal server...");
    try {
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "self" }),
      });
      const body = await res.json();
      if (!res.ok) {
        log("error", `Errore server: ${JSON.stringify(body)}`);
      } else {
        log("ok", "Push APNs inviata dal server — aspetta 5-10s...");
        log("info", "(metti l'app in background per vedere la notifica)");
      }
    } catch (e) {
      log("error", `Errore: ${e}`);
    }
    setBusy(false);
  }

  const Dot = ({ ok, warn }: { ok: boolean; warn?: boolean }) => (
    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0 ${ok ? "bg-emerald-400" : warn ? "bg-amber-400" : "bg-red-400"}`} />
  );

  const logColor = { info: "text-slate-400", ok: "text-emerald-400", warn: "text-amber-400", error: "text-red-400" } as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-mono text-sm">
      <div className="max-w-xl mx-auto space-y-5">

        <div>
          <h1 className="text-lg font-bold">🔔 Push Test — APNs</h1>
          <p className="text-slate-500 text-xs mt-1">Su app Capacitor le notifiche arrivano solo tramite APNs nativo</p>
        </div>

        {/* Stato */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Stato</p>
          <p className="flex items-center"><Dot ok={isNative} />App nativa (Capacitor)</p>
          <p className="flex items-center">
            <Dot ok={apnsTokenInDb === true} warn={apnsTokenInDb === null} />
            {apnsTokenInDb === null ? "Token APNs: verifica..." :
             apnsTokenInDb ? "Token APNs registrato nel DB ✓" : "Token APNs NON nel DB"}
          </p>
        </div>

        {/* Azioni */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Azioni</p>
          <button onClick={handleRegisterApns} disabled={busy || !isNative}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
            {busy ? "⏳ Attendi..." : "① Registra APNs (richiedi permesso)"}
          </button>
          <button onClick={handleTestApns} disabled={busy || !apnsTokenInDb}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
            ② Invia push APNs di test
          </button>
          <button onClick={checkAll} disabled={busy}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
            Aggiorna stato
          </button>
        </div>

        {/* Note */}
        <div className="bg-slate-900 rounded-xl p-4 text-xs text-slate-400 space-y-1.5">
          <p><span className="text-violet-400">①</span> Registra APNs — chiede il permesso iOS e salva il token</p>
          <p><span className="text-emerald-400">②</span> Invia push — poi metti l'app in background per vederla arrivare</p>
          <p className="text-slate-600 pt-1">Web Push e Service Worker non funzionano in WKWebView — è normale.</p>
        </div>

        {/* Log */}
        <div className="bg-black rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Log</p>
            {logs.length > 0 && (
              <button onClick={() => setLogs([])} className="text-[10px] text-slate-600 hover:text-slate-400">Pulisci</button>
            )}
          </div>
          <div className="space-y-0.5 max-h-72 overflow-y-auto">
            {logs.length === 0 && <p className="text-slate-600 text-xs">In attesa...</p>}
            {logs.map((e, i) => (
              <p key={i} className={`text-xs ${logColor[e.level]}`}>
                <span className="text-slate-600">[{e.ts}]</span> {e.msg}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
