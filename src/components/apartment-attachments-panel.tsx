"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import {
  saveApartmentAttachmentFromBlob,
  deleteApartmentAttachmentById,
} from "@/src/app/actions/apartment";

type Attachment = {
  id: string;
  filename: string;
  url: string | null;
  mimeType: string | null;
  size: number | null;
  category: string;
  linkedTo: string | null;
  notes: string | null;
  createdAt: Date;
};

export type ApartmentItem = { label: string; name: string };

interface Props {
  apartmentId: string;
  initialAttachments: Attachment[];
  items: ApartmentItem[];
}

const CATEGORIES: Record<string, string> = {
  MANUAL: "Manuale",
  WARRANTY: "Garanzia",
  PHOTO: "Foto",
  TECHNICAL_SHEET: "Scheda tecnica",
  INSTALLER_INSTRUCTIONS: "Istruzioni",
  OTHER: "Altro",
};

const CATEGORY_COLORS: Record<string, string> = {
  MANUAL: "bg-blue-50 text-blue-700",
  WARRANTY: "bg-green-50 text-green-700",
  PHOTO: "bg-purple-50 text-purple-700",
  TECHNICAL_SHEET: "bg-orange-50 text-orange-700",
  INSTALLER_INSTRUCTIONS: "bg-yellow-50 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-600",
};

function fileIcon(mimeType: string | null) {
  if (!mimeType) return "📎";
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("word")) return "📝";
  if (mimeType === "text/plain") return "📋";
  return "📎";
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ApartmentAttachmentsPanel({ apartmentId, initialAttachments, items }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "saving" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ url: string; filename: string; mimeType: string; size: number } | null>(null);
  const [category, setCategory] = useState("OTHER");
  const [linkedTo, setLinkedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [, startDeleteTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAttachments = activeFilter === "ALL"
    ? attachments
    : attachments.filter((a) => a.category === activeFilter);

  const categoryCounts = attachments.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});

  const activeCategories = Object.keys(categoryCounts);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadStatus("uploading");
    try {
      const blob = await upload(
        `uploads/apartment/${apartmentId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload" }
      );
      setPendingFile({ url: blob.url, filename: file.name, mimeType: file.type, size: file.size });
      setUploadStatus("idle");
      setShowForm(true);
    } catch {
      setUploadError("Errore durante il caricamento. Riprova.");
      setUploadStatus("error");
    }
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!pendingFile) return;
    setUploadStatus("saving");
    const formData = new FormData();
    formData.append("apartmentId", apartmentId);
    formData.append("url", pendingFile.url);
    formData.append("filename", pendingFile.filename);
    formData.append("mimeType", pendingFile.mimeType);
    formData.append("size", String(pendingFile.size));
    formData.append("category", category);
    formData.append("linkedTo", linkedTo);
    formData.append("notes", notes);
    const result = await saveApartmentAttachmentFromBlob(formData);
    if (result.success && result.attachment) {
      setAttachments((prev) => [result.attachment as Attachment, ...prev]);
      setPendingFile(null);
      setCategory("OTHER");
      setLinkedTo("");
      setNotes("");
      setShowForm(false);
    } else {
      setUploadError((result as { error?: string }).error ?? "Errore durante il salvataggio.");
    }
    setUploadStatus("idle");
  };

  const handleCancel = () => {
    setPendingFile(null);
    setCategory("OTHER");
    setLinkedTo("");
    setNotes("");
    setShowForm(false);
    setUploadError(null);
    setUploadStatus("idle");
  };

  const handleDelete = (id: string) => {
    startDeleteTransition(async () => {
      await deleteApartmentAttachmentById(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Allegati
            {attachments.length > 0 && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {attachments.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Manuali, garanzie, foto e documenti tecnici</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadStatus === "uploading" || uploadStatus === "saving"}
          className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50"
        >
          {uploadStatus === "uploading" ? (
            <>
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Caricamento...
            </>
          ) : (
            <>↑ Carica file</>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
          onChange={handleFileSelect}
        />
      </div>

      {/* Filter bar */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-6 pt-4 pb-0 flex-wrap">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${activeFilter === "ALL" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Tutti ({attachments.length})
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat === activeFilter ? "ALL" : cat)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${activeFilter === cat ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {CATEGORIES[cat] ?? cat} ({categoryCounts[cat]})
            </button>
          ))}
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
          ⚠️ {uploadError}
        </div>
      )}

      {/* Pending file form */}
      {showForm && pendingFile && (
        <div className="mx-6 mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-800">
            📎 {pendingFile.filename}
            <span className="ml-2 font-normal text-blue-500">{formatSize(pendingFile.size)} · caricato ✓</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
              >
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Collegato a <span className="text-gray-400 font-normal">(opzionale)</span>
              </label>
              <select
                value={linkedTo}
                onChange={(e) => setLinkedTo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">— Generale —</option>
                {items.length > 0 && (
                  <>
                    {["Impianto", "Elettrodomestico", "Domotica"].map((sectionLabel) => {
                      const sectionItems = items.filter((i) => i.label === sectionLabel);
                      if (sectionItems.length === 0) return null;
                      return (
                        <optgroup key={sectionLabel} label={sectionLabel + "i"}>
                          {sectionItems.map((item) => (
                            <option key={item.name} value={item.name}>{item.name}</option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </>
                )}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Note <span className="text-gray-400 font-normal">(opzionale)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Es. Manuale d'uso, anno 2023"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={uploadStatus === "saving"}
              className="flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {uploadStatus === "saving" && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              Salva allegato
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Attachments grid */}
      <div className="p-6">
        {filteredAttachments.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
            <span className="text-4xl mb-3">📂</span>
            <p className="text-sm font-medium">
              {activeFilter === "ALL" ? "Nessun allegato caricato" : `Nessun allegato nella categoria ${CATEGORIES[activeFilter] ?? activeFilter}`}
            </p>
            {activeFilter === "ALL" && (
              <p className="text-xs mt-1">Clicca &quot;Carica file&quot; per aggiungere manuali, garanzie e foto</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAttachments.map((att) => (
              <div
                key={att.id}
                className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5">{fileIcon(att.mimeType)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900" title={att.filename}>
                      {att.filename}
                    </p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[att.category] ?? CATEGORY_COLORS.OTHER}`}>
                        {CATEGORIES[att.category] ?? att.category}
                      </span>
                      {att.size && (
                        <span className="text-[10px] text-gray-400">{formatSize(att.size)}</span>
                      )}
                    </div>
                    {att.linkedTo && (
                      <p className="mt-1 text-[10px] text-gray-500 flex items-center gap-1 truncate" title={att.linkedTo}>
                        🔗 {att.linkedTo}
                      </p>
                    )}
                    {att.notes && (
                      <p className="mt-0.5 text-[10px] text-gray-400 truncate" title={att.notes}>
                        {att.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-[11px] font-medium text-gray-700 transition-colors hover:bg-white"
                    >
                      Apri
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(att.id)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-red-500 transition-colors hover:border-red-100 hover:bg-red-50"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
