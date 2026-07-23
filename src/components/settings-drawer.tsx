"use client";

import { useState, useEffect, useTransition } from "react";
import { X, User, Building2, Bell, ChevronRight, ExternalLink, Check, Loader2 } from "lucide-react";
import {
  getSettingsData,
  updateProfile,
  updatePassword,
  updateOrgName,
  updateNotificationPrefs,
  uploadOrgLogo,
  updateOrgFiscal,
  updateConflictSettings,
  type NotificationPrefs,
} from "@/src/app/actions/settings";
import LanguageSelector from "@/src/components/language-selector";
import { useLang } from "@/src/components/lang-context";

type Section = "profilo" | "org" | "notifiche";

type SettingsData = Awaited<ReturnType<typeof getSettingsData>>;

// ── Toggle iOS-style ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-[28px] w-[48px] shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
      style={{ background: checked ? "#30d158" : "#e5e5ea" }}
    >
      <span
        className="pointer-events-none inline-block h-[24px] w-[24px] rounded-full bg-white shadow-md ring-0 transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ── Status message ─────────────────────────────────────────────────────────────
function StatusMsg({ result }: { result: { success?: boolean; error?: string } | null }) {
  if (!result) return null;
  if (result.error) return <p className="text-[13px] text-red-600 font-[500]">{result.error}</p>;
  return (
    <p className="flex items-center gap-1.5 text-[13px] text-[#30d158] font-[600]">
      <Check size={14} strokeWidth={2.5} /> Salvato
    </p>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-[600] text-[#8e8e93] uppercase tracking-[.04em]">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-[10px] border border-[#d1d1d6] bg-white px-3 py-[9px] text-[14px] text-[#1c1c1e] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all";
const btnCls = "inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#1c1c1e] text-white text-[13px] font-[600] px-4 py-[9px] transition hover:bg-[#3a3a3c] disabled:opacity-50";

// Pannello diagnostico push: mostra se il dispositivo ha registrato un token
// (web/APNs/FCM) e permette di inviarsi una notifica di prova.
function PushDiagnostics() {
  const [info, setInfo] = useState<{ web: number; apns: number; fcm: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setTestMsg(null);
    try {
      const r = await fetch("/api/push/debug");
      const d = await r.json();
      setInfo({ web: d.me?.webSubscriptions ?? 0, apns: d.me?.apnsTokens ?? 0, fcm: d.me?.fcmTokens ?? 0 });
    } catch {
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const sendTest = async () => {
    setTestMsg("Invio in corso…");
    try {
      const r = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "self" }),
      });
      const d = await r.json();
      if (!r.ok) { setTestMsg("❌ Errore invio."); return; }
      const fcm = d.fcm as { success: number; failure: number; errors: string[] } | null;
      if (fcm) {
        if (fcm.errors.length > 0 && fcm.success === 0) {
          setTestMsg(`❌ Firebase errore: ${fcm.errors.join(", ")}`);
        } else if (fcm.failure === 0 && fcm.success > 0) {
          setTestMsg(`✅ Firebase ha accettato il messaggio (${fcm.success}/${fcm.success + fcm.failure}). Controlla la notifica.`);
        } else if (fcm.failure > 0) {
          setTestMsg(`⚠️ Firebase: ${fcm.success} ok, ${fcm.failure} falliti. Errori: ${fcm.errors.join(", ")}`);
        } else {
          setTestMsg(`⚠️ Firebase: nessun token trovato per questo utente (FCM=0).`);
        }
      } else {
        setTestMsg("✅ Inviata. Controlla la notifica (anche con app in background).");
      }
    } catch {
      setTestMsg("❌ Errore invio.");
    }
  };

  const totalTokens = (info?.web ?? 0) + (info?.apns ?? 0) + (info?.fcm ?? 0);

  return (
    <div>
      <p className="text-[11px] font-[700] text-[#8e8e93] uppercase tracking-[.06em] px-1 mb-2">Diagnostica push</p>
      <div className="bg-white rounded-[14px] p-4 space-y-3" style={{ border: ".5px solid #e5e5ea" }}>
        {info && (
          <div className="text-[13px] text-[#1c1c1e] space-y-1">
            <p>Questo dispositivo è registrato per le notifiche:</p>
            <p className={totalTokens > 0 ? "text-[#30d158] font-[700]" : "text-[#ff3b30] font-[700]"}>
              {totalTokens > 0 ? "✅ Sì" : "❌ No — nessun token registrato"}
            </p>
            <p className="text-[12px] text-[#8e8e93]">
              Web: {info.web} · iOS (APNs): {info.apns} · Android (FCM): {info.fcm}
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={refresh} disabled={loading} className={btnCls} style={{ background: "#e5e5ea", color: "#1c1c1e" }}>
            {loading ? "…" : "Aggiorna"}
          </button>
          <button onClick={sendTest} disabled={totalTokens === 0} className={btnCls}>
            Inviami una prova
          </button>
        </div>
        {testMsg && <p className="text-[12px] text-[#1c1c1e]">{testMsg}</p>}
      </div>
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export default function SettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  const [data, setData] = useState<SettingsData | null>(null);
  const [section, setSection] = useState<Section>("profilo");
  const [isPending, startTransition] = useTransition();

  // profile form
  const [profileResult, setProfileResult] = useState<{ success?: boolean; error?: string } | null>(null);
  // password form
  const [pwResult, setPwResult] = useState<{ success?: boolean; error?: string } | null>(null);
  // org form
  const [orgResult, setOrgResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [fiscalResult, setFiscalResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [conflictResult, setConflictResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [logoResult, setLogoResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  // notification prefs
  const [prefs, setPrefs] = useState<NotificationPrefs>({ cleaningStarted: true, cleaningCompleted: true, maintenanceNew: true, chatCleaner: true, chatMaintenance: true });
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    if (open && !data) {
      getSettingsData()
        .then(d => {
          setData(d);
          setPrefs(d.notificationPrefs);
        })
        .catch(err => {
          console.error("[SettingsDrawer] getSettingsData error:", err);
          // Imposta un oggetto vuoto per uscire dal loop di loading
          setData({ id: "", name: "", email: "", notificationPrefs: { cleaningStarted: true, cleaningCompleted: true, maintenanceNew: true, chatCleaner: true, chatMaintenance: true }, organization: null } as any);
        });
    }
  }, [open, data]);

  const handlePrefChange = (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setPrefsSaved(false);
    startTransition(async () => {
      await updateNotificationPrefs(next);
      setPrefsSaved(true);
    });
  };

  // Nessun body lock: il layout h-screen overflow-hidden contiene già il rubber-band iOS.
  // Impostare position:fixed sul body sposta il tab bar e ridimensiona il viewport.

  if (!open) return null;

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "profilo", label: "Profilo", icon: <User size={15} strokeWidth={2} /> },
    { id: "org", label: "Organizzazione", icon: <Building2 size={15} strokeWidth={2} /> },
    { id: "notifiche", label: "Notifiche", icon: <Bell size={15} strokeWidth={2} /> },
  ];

  return (
    <>
      {/* Backdrop — absolute dentro la gabbia h-screen del layout */}
      <div className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer — absolute (non fixed) per restare nella gabbia overflow-hidden
          del layout, che contiene il rubber-band di iOS come fa per il tab bar.
          Header = figlio flex normale (resta fermo), solo il contenuto scrolla. */}
      <div
        className="absolute right-0 inset-y-0 z-50 w-full md:w-[380px] flex flex-col overflow-hidden"
        style={{ background: "#f2f2f7", fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif", boxShadow: "-8px 0 40px rgba(0,0,0,.15)" }}
      >
        {/* Header — figlio flex, shrink-0: non scorre mai */}
        <div className="shrink-0">
          <div className="flex items-center justify-between px-5 border-b border-[#e5e5ea]" style={{ background: "rgba(255,255,255,.97)", paddingTop: "calc(env(safe-area-inset-top) + 58px + 16px)", paddingBottom: "16px" }}>
            <div className="flex items-center gap-2">
              <span className="text-[20px]">⚙️</span>
              <span className="text-[17px] font-[700] text-[#1c1c1e]">Impostazioni</span>
            </div>
            <button onClick={onClose} className="w-[30px] h-[30px] rounded-full bg-[#e5e5ea] flex items-center justify-center hover:bg-[#d1d1d6] transition-colors">
              <X size={16} strokeWidth={2.5} className="text-[#3c3c43]" />
            </button>
          </div>
          <div className="flex gap-1 px-4 py-3 border-b border-[#e5e5ea] bg-white">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className="flex items-center gap-1.5 px-3 py-[6px] rounded-[8px] text-[13px] font-[600] transition-all"
                style={section === s.id ? { background: "#1c1c1e", color: "white" } : { background: "transparent", color: "#6e6e73" }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenuto scrollabile — flex-1, l'unico elemento che scorre */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-4 flex flex-col gap-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >

          {!data && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[#8e8e93]" />
            </div>
          )}

          {/* ── PROFILO ── */}
          {data && section === "profilo" && (
            <>
              <div className="bg-white rounded-[14px] p-4 flex flex-col gap-3" style={{ border: ".5px solid #e5e5ea" }}>
                <p className="text-[13px] font-[700] text-[#1c1c1e]">{t.settingsLanguage}</p>
                <LanguageSelector />
              </div>

              <div className="bg-white rounded-[14px] p-4 flex flex-col gap-4" style={{ border: ".5px solid #e5e5ea" }}>
                <p className="text-[13px] font-[700] text-[#1c1c1e]">Dati personali</p>
                <form
                  onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { try { setProfileResult(null); const res = await updateProfile(fd); setProfileResult(res ?? { success: true }); if (res?.success) setData(d => d ? { ...d, name: fd.get("name") as string, email: fd.get("email") as string } : d); } catch { setProfileResult({ error: "Errore durante il salvataggio." }); } }); }}
                  className="flex flex-col gap-3"
                >
                  <Field label="Nome">
                    <input name="name" defaultValue={data.name} className={inputCls} required />
                  </Field>
                  <Field label="Email">
                    <input name="email" type="email" defaultValue={data.email} className={inputCls} required />
                  </Field>
                  <div className="flex items-center justify-between pt-1">
                    <StatusMsg result={profileResult} />
                    <button type="submit" className={btnCls}>Salva</button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-[14px] p-4 flex flex-col gap-4" style={{ border: ".5px solid #e5e5ea" }}>
                <p className="text-[13px] font-[700] text-[#1c1c1e]">Cambia password</p>
                <form
                  onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { try { setPwResult(null); const res = await updatePassword(fd); setPwResult(res ?? { success: true }); } catch { setPwResult({ error: "Errore durante il salvataggio." }); } }); }}
                  className="flex flex-col gap-3"
                >
                  <Field label="Password attuale">
                    <input name="current" type="password" className={inputCls} required />
                  </Field>
                  <Field label="Nuova password">
                    <input name="next" type="password" minLength={8} className={inputCls} required />
                  </Field>
                  <Field label="Conferma password">
                    <input name="confirm" type="password" minLength={8} className={inputCls} required />
                  </Field>
                  <div className="flex items-center justify-between pt-1">
                    <StatusMsg result={pwResult} />
                    <button type="submit" className={btnCls}>Aggiorna</button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ── ORGANIZZAZIONE ── */}
          {data && section === "org" && (
            <>
              <div className="bg-white rounded-[14px] p-4 flex flex-col gap-4" style={{ border: ".5px solid #e5e5ea" }}>
                <p className="text-[13px] font-[700] text-[#1c1c1e]">Nome organizzazione</p>
                <form
                  onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { try { setOrgResult(null); const res = await updateOrgName(fd); setOrgResult(res ?? { success: true }); if (res?.success) setData(d => d ? { ...d, organization: d.organization ? { ...d.organization, name: fd.get("name") as string } : null } : d); } catch { setOrgResult({ error: "Errore durante il salvataggio." }); } }); }}
                  className="flex flex-col gap-3"
                >
                  <Field label="Nome">
                    <input name="name" defaultValue={data.organization?.name ?? ""} className={inputCls} required />
                  </Field>
                  <div className="flex items-center justify-between pt-1">
                    <StatusMsg result={orgResult} />
                    <button type="submit" className={btnCls}>Salva</button>
                  </div>
                </form>
              </div>

              {/* Dati fiscali */}
              <div className="bg-white rounded-[14px] p-4 flex flex-col gap-4" style={{ border: ".5px solid #e5e5ea" }}>
                <p className="text-[13px] font-[700] text-[#1c1c1e]">Dati fiscali</p>
                <form
                  onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { try { setFiscalResult(null); const res = await updateOrgFiscal(fd); setFiscalResult(res ?? { success: true }); } catch { setFiscalResult({ error: "Errore durante il salvataggio." }); } }); }}
                  className="flex flex-col gap-3"
                >
                  <Field label="Ragione sociale">
                    <input name="legalName" defaultValue={data.organization?.legalName ?? ""} className={inputCls} placeholder="Es. Mario Rossi S.r.l." />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Partita IVA">
                      <input name="vatNumber" defaultValue={data.organization?.vatNumber ?? ""} className={inputCls} placeholder="IT12345678901" />
                    </Field>
                    <Field label="Codice fiscale">
                      <input name="fiscalCode" defaultValue={data.organization?.fiscalCode ?? ""} className={inputCls} placeholder="RSSMRA80A01H501U" />
                    </Field>
                  </div>
                  <Field label="Indirizzo">
                    <input name="address" defaultValue={data.organization?.address ?? ""} className={inputCls} placeholder="Via Roma 1" />
                  </Field>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="CAP">
                      <input name="zip" defaultValue={data.organization?.zip ?? ""} className={inputCls} placeholder="00100" />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Città">
                        <input name="city" defaultValue={data.organization?.city ?? ""} className={inputCls} placeholder="Roma" />
                      </Field>
                    </div>
                  </div>
                  <Field label="Paese">
                    <input name="country" defaultValue={data.organization?.country ?? "Italia"} className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Telefono">
                      <input name="phone" defaultValue={data.organization?.phone ?? ""} className={inputCls} placeholder="+39 06 1234567" />
                    </Field>
                    <Field label="Email">
                      <input name="email" type="email" defaultValue={data.organization?.email ?? ""} className={inputCls} placeholder="info@azienda.it" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="PEC">
                      <input name="pec" defaultValue={data.organization?.pec ?? ""} className={inputCls} placeholder="azienda@pec.it" />
                    </Field>
                    <Field label="Codice SDI">
                      <input name="sdiCode" defaultValue={data.organization?.sdiCode ?? ""} className={inputCls} placeholder="Es. ABCDE12" />
                    </Field>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <StatusMsg result={fiscalResult} />
                    <button type="submit" className={btnCls}>Salva</button>
                  </div>
                </form>
              </div>

              {/* Logo upload */}
              <div className="bg-white rounded-[14px] p-4 flex flex-col gap-4" style={{ border: ".5px solid #e5e5ea" }}>
                <p className="text-[13px] font-[700] text-[#1c1c1e]">Logo organizzazione</p>
                <div className="flex items-center gap-4">
                  {data.organization?.logoUrl ? (
                    <img src={data.organization.logoUrl} alt="Logo" className="w-[48px] h-[48px] rounded-[10px] object-contain border border-[#e5e5ea] bg-[#f9f9fb]" />
                  ) : (
                    <div className="w-[48px] h-[48px] rounded-[10px] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-[13px] font-[800] shrink-0">
                      {(data.organization?.name ?? "?").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <form
                    onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { try { setLogoResult(null); setLogoUploading(true); const res = await uploadOrgLogo(fd); setLogoUploading(false); setLogoResult(res); if (res?.success && res.url) { setData(d => d ? { ...d, organization: d.organization ? { ...d.organization, logoUrl: res.url! } : null } : d); } } catch { setLogoUploading(false); setLogoResult({ error: "Errore durante il caricamento." }); } }); }}
                    className="flex flex-col gap-2 flex-1"
                  >
                    <input name="logo" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="text-[13px] text-[#3c3c43] file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#f2f2f7] file:px-3 file:py-1.5 file:text-[12px] file:font-[600] file:text-[#1c1c1e]" />
                    <div className="flex items-center gap-3">
                      <button type="submit" disabled={logoUploading} className={btnCls}>
                        {logoUploading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Carica
                      </button>
                      <StatusMsg result={logoResult} />
                    </div>
                    <p className="text-[11px] text-[#8e8e93]">JPG, PNG, WEBP o SVG — max 2MB</p>
                  </form>
                </div>
              </div>

              {/* Regole AI */}
              <div className="bg-white rounded-[14px] p-4 flex flex-col gap-4" style={{ border: ".5px solid #e5e5ea" }}>
                <p className="text-[13px] font-[700] text-[#1c1c1e]">🤖 Regole analisi conflitti AI</p>
                <p className="text-[11px] text-[#8e8e93]">Soglie usate dall'assistente AI per rilevare problemi operativi</p>
                <form
                  onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { try { setConflictResult(null); const res = await updateConflictSettings(fd); setConflictResult(res ?? { success: true }); } catch { setConflictResult({ error: "Errore durante il salvataggio." }); } }); }}
                  className="flex flex-col gap-3"
                >
                  <Field label="Max pulizie per cleaner al giorno">
                    <input
                      name="conflictMaxCleaningsPerDay"
                      type="number" min={1} max={20}
                      defaultValue={data.organization?.conflictMaxCleaningsPerDay ?? 3}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Ore preavviso pulizia senza cleaner">
                    <input
                      name="conflictUrgentHours"
                      type="number" min={1} max={168}
                      defaultValue={data.organization?.conflictUrgentHours ?? 48}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Giorni prima che un ticket diventi bloccante">
                    <input
                      name="conflictStaleTicketDays"
                      type="number" min={1} max={90}
                      defaultValue={data.organization?.conflictStaleTicketDays ?? 7}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Minuti sovrapposizione per doppio booking cleaner">
                    <input
                      name="conflictOverlapMinutes"
                      type="number" min={15} max={480}
                      defaultValue={data.organization?.conflictOverlapMinutes ?? 90}
                      className={inputCls}
                    />
                  </Field>
                  <div className="flex items-center justify-between pt-1">
                    <StatusMsg result={conflictResult} />
                    <button type="submit" className={btnCls}>Salva</button>
                  </div>
                </form>
              </div>

              <a
                href="/dashboard/manager/users"
                className="bg-white rounded-[14px] p-4 flex items-center justify-between group hover:bg-[#f9f9fb] transition-colors"
                style={{ border: ".5px solid #e5e5ea" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-[34px] h-[34px] rounded-[10px] bg-blue-50 flex items-center justify-center">
                    <User size={16} strokeWidth={2} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[14px] font-[600] text-[#1c1c1e]">Gestione utenti</p>
                    <p className="text-[12px] text-[#8e8e93]">Cleaner, manutentori, supervisor</p>
                  </div>
                </div>
                <ExternalLink size={15} strokeWidth={2} className="text-[#8e8e93] group-hover:text-[#1c1c1e] transition-colors" />
              </a>
            </>
          )}

          {/* ── NOTIFICHE ── */}
          {data && section === "notifiche" && (
            <>
              {/* Gruppo: Attività */}
              <div>
                <p className="text-[11px] font-[700] text-[#8e8e93] uppercase tracking-[.06em] px-1 mb-2">Attività</p>
                <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: ".5px solid #e5e5ea" }}>
                  {[
                    { key: "cleaningStarted" as const, label: "Pulizia avviata", sub: "Quando un cleaner inizia una pulizia" },
                    { key: "cleaningCompleted" as const, label: "Pulizia completata", sub: "Quando il cleaner invia per verifica" },
                    { key: "maintenanceNew" as const, label: "Nuovo ticket manutenzione", sub: "Quando viene aperto un ticket" },
                  ].map((item, i, arr) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between px-4 py-3.5"
                      style={{ borderBottom: i < arr.length - 1 ? ".5px solid #e5e5ea" : "none" }}
                    >
                      <div>
                        <p className="text-[14px] font-[600] text-[#1c1c1e]">{item.label}</p>
                        <p className="text-[12px] text-[#8e8e93] mt-0.5">{item.sub}</p>
                      </div>
                      <Toggle checked={prefs[item.key]} onChange={v => handlePrefChange(item.key, v)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gruppo: Chat */}
              <div>
                <p className="text-[11px] font-[700] text-[#8e8e93] uppercase tracking-[.06em] px-1 mb-2">Chat</p>
                <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: ".5px solid #e5e5ea" }}>
                  {[
                    { key: "chatCleaner" as const, label: "Messaggi dal cleaner", sub: "Notifica quando un cleaner scrive in chat" },
                    { key: "chatMaintenance" as const, label: "Messaggi dal manutentore", sub: "Notifica quando un tecnico scrive in chat" },
                  ].map((item, i, arr) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between px-4 py-3.5"
                      style={{ borderBottom: i < arr.length - 1 ? ".5px solid #e5e5ea" : "none" }}
                    >
                      <div>
                        <p className="text-[14px] font-[600] text-[#1c1c1e]">{item.label}</p>
                        <p className="text-[12px] text-[#8e8e93] mt-0.5">{item.sub}</p>
                      </div>
                      <Toggle checked={prefs[item.key]} onChange={v => handlePrefChange(item.key, v)} />
                    </div>
                  ))}
                </div>
              </div>

              {prefsSaved && (
                <div className="px-4 py-2.5 rounded-[10px] bg-[#f0fdf4]" style={{ border: ".5px solid #bbf7d0" }}>
                  <p className="flex items-center gap-1.5 text-[12px] text-[#30d158] font-[600]">
                    <Check size={12} strokeWidth={2.5} /> Preferenze salvate
                  </p>
                </div>
              )}

              <PushDiagnostics />
            </>
          )}
        </div>
      </div>
    </>
  );
}
