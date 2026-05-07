"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { saveApartmentAccess, saveApartmentAttachmentFromBlob, deleteApartmentAttachmentById } from "@/src/app/actions/apartment";

type AccessInfo = {
  doorCode?: string | null;
  safeCode?: string | null;
  buildingCode?: string | null;
  floor?: string | null;
  wifiNetwork?: string | null;
  wifiPassword?: string | null;
  directions?: string | null;
  checkInNotes?: string | null;
  parking?: string | null;
};

type MediaFile = {
  id: string;
  filename: string;
  url: string | null;
  mimeType: string | null;
  size: number | null;
};

interface Props {
  apartmentId: string;
  initialAccessInfo: AccessInfo;
  initialMedia: MediaFile[];
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isVideo(mimeType: string | null) {
  return mimeType?.startsWith("video/") ?? false;
}

function CodeField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (v: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black font-mono tracking-wider"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50"
          title={visible ? "Nascondi" : "Mostra"}
        >
          {visible ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );
}

export default function ApartmentAccessPanel({ apartmentId, initialAccessInfo, initialMedia }: Props) {
  const [open, setOpen] = useState(true);
  const [info, setInfo] = useState<AccessInfo>(initialAccessInfo);
  const [media, setMedia] = useState<MediaFile[]>(initialMedia);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [, startDeleteTransition] = useTransition();
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof AccessInfo) => (value: string) => setInfo((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    const formData = new FormData();
    formData.append("id", apartmentId);
    formData.append("doorCode", info.doorCode ?? "");
    formData.append("safeCode", info.safeCode ?? "");
    formData.append("buildingCode", info.buildingCode ?? "");
    formData.append("floor", info.floor ?? "");
    formData.append("wifiNetwork", info.wifiNetwork ?? "");
    formData.append("wifiPassword", info.wifiPassword ?? "");
    formData.append("directions", info.directions ?? "");
    formData.append("checkInNotes", info.checkInNotes ?? "");
    formData.append("parking", info.parking ?? "");
    const result = await saveApartmentAccess(formData);
    if (result.success) {
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    } else {
      setSaveError((result as { error?: string }).error ?? "Errore durante il salvataggio.");
    }
    setSaving(false);
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadStatus("uploading");
    try {
      const blob = await upload(
        `uploads/apartment/${apartmentId}/access/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload" }
      );
      const formData = new FormData();
      formData.append("apartmentId", apartmentId);
      formData.append("url", blob.url);
      formData.append("filename", file.name);
      formData.append("mimeType", file.type);
      formData.append("size", String(file.size));
      formData.append("category", "ACCESS");
      const result = await saveApartmentAttachmentFromBlob(formData);
      if (result.success && result.attachment) {
        setMedia((prev) => [result.attachment as MediaFile, ...prev]);
      } else {
        setUploadError("Errore durante il salvataggio del file.");
      }
    } catch {
      setUploadError("Errore durante il caricamento. Riprova.");
    }
    setUploadStatus("idle");
    e.target.value = "";
  };

  const handleDeleteMedia = (id: string) => {
    startDeleteTransition(async () => {
      await deleteApartmentAttachmentById(id);
      setMedia((prev) => prev.filter((m) => m.id !== id));
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-lg">🔑</div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Accesso appartamento</h2>
            <p className="text-xs text-gray-400 mt-0.5">Codici, istruzioni e foto per accedere</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          {open ? "Chiudi ▲" : "Espandi ▼"}
        </button>
      </div>

      {open && (
        <>
          {/* Codici */}
          <div className="px-6 pt-5 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Codici di accesso</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CodeField label="Codice porta / smart lock" name="doorCode" value={info.doorCode ?? ""} onChange={set("doorCode")} />
              <CodeField label="Codice cassetta chiavi" name="safeCode" value={info.safeCode ?? ""} onChange={set("safeCode")} />
              <CodeField label="Codice portone / citofono" name="buildingCode" value={info.buildingCode ?? ""} onChange={set("buildingCode")} />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Piano / interno</label>
                <input
                  type="text"
                  value={info.floor ?? ""}
                  onChange={(e) => set("floor")(e.target.value)}
                  placeholder="Es. 3° piano, interno 8"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rete Wi-Fi</label>
                <input
                  type="text"
                  value={info.wifiNetwork ?? ""}
                  onChange={(e) => set("wifiNetwork")(e.target.value)}
                  placeholder="Nome rete Wi-Fi"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <CodeField label="Password Wi-Fi" name="wifiPassword" value={info.wifiPassword ?? ""} onChange={set("wifiPassword")} />
            </div>
          </div>

          <div className="mx-6 my-5 border-t border-gray-100" />

          {/* Istruzioni */}
          <div className="px-6 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Istruzioni</p>
            <div className="space-y-4">
              {[
                { key: "directions" as const, label: "Come raggiungere l'appartamento", placeholder: "Es. Dall'ingresso principale girare a destra..." },
                { key: "checkInNotes" as const, label: "Note check-in / check-out", placeholder: "Es. Check-in dalle 15:00, chiavi nella cassetta all'uscita..." },
                { key: "parking" as const, label: "Parcheggio", placeholder: "Es. ZTL attiva, parcheggio P1 a 200m..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <textarea
                    rows={2}
                    value={info[key] ?? ""}
                    onChange={(e) => set(key)(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mx-6 my-5 border-t border-gray-100" />

          {/* Media */}
          <div className="px-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Foto e video accesso</p>
              <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                disabled={uploadStatus === "uploading"}
                className="flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {uploadStatus === "uploading" ? (
                  <><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Caricamento...</>
                ) : "↑ Carica"}
              </button>
              <input
                ref={mediaInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm"
                onChange={handleMediaSelect}
              />
            </div>

            {uploadError && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">⚠️ {uploadError}</div>
            )}

            {media.length === 0 ? (
              <div
                onClick={() => mediaInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-10 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mb-2">📸</span>
                <p className="text-xs font-medium text-gray-500">Carica foto o video dell'accesso</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Cassetta chiavi, portone, istruzioni video...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {media.map((file) => (
                  <div key={file.id} className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex flex-col">
                    <a href={file.url ?? "#"} target="_blank" rel="noreferrer" className="block aspect-video relative">
                      {isVideo(file.mimeType) ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xl">▶</div>
                        </div>
                      ) : (
                        <img src={file.url ?? ""} alt={file.filename} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                    </a>
                    <div className="px-2 py-1.5 bg-white border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-gray-700 truncate">{file.filename}</p>
                        <p className="text-[9px] text-gray-400">{isVideo(file.mimeType) ? "Video" : "Foto"}{file.size ? ` • ${formatSize(file.size)}` : ""}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(file.id)}
                        className="shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-500 text-[10px] flex items-center justify-center hover:bg-red-200"
                      >✕</button>
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => mediaInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 aspect-video cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl text-gray-300">+</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Aggiungi</span>
                </div>
              </div>
            )}
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 mt-5">
            {saveError && <p className="mr-auto text-xs text-red-600">⚠️ {saveError}</p>}
            {saveOk && <p className="mr-auto text-xs text-green-600 font-medium">✓ Salvato</p>}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-black px-6 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              Salva accesso
            </button>
          </div>
        </>
      )}
    </div>
  );
}
