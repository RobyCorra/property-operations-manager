"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { ChevronRight } from "@/src/components/icons";
import { upload } from "@vercel/blob/client";
import { saveApartmentAttachmentFromBlob, deleteApartmentAttachmentById } from "@/src/app/actions/apartment";

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

type AccessMediaFile = {
  id: string;
  filename: string;
  url: string | null;
  mimeType: string | null;
  size: number | null;
};

type Apartment = {
  id: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  squareMeters?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  icalUrl?: string | null;
  technicalProfile?: unknown;
  accessInfo?: unknown;
};

type TechnicalAttachment = {
  filename: string;
  url: string;
  mimeType: string;
  size: number | null;
  category: string;
  notes: string;
  extractedText: string;
};

type TechnicalItem = {
  name: string;
  type: string;
  brand: string;
  model: string;
  location: string;
  notes: string;
  recurringIssues: string;
  attachments: TechnicalAttachment[];
};

type RecurringIssueItem = {
  title: string;
  category: string;
  relatedItem: string;
  symptoms: string;
  solution: string;
  whenToCall: string;
  notesForAI: string;
  attachments: TechnicalAttachment[];
};

type TechnicalProfile = {
  systems?: unknown;
  appliances?: unknown;
  smartHome?: unknown;
  recurringIssues?: unknown;
  generalAttachments?: unknown;
  aiNotes?: string;
};

type TechnicalSectionKey = "systems" | "appliances" | "smartHome";
type FormSectionKey = "main" | "calendar" | "technical" | "attachments" | "ai" | "access";
type SectionRowProps = {
  title: string;
  count: number;
  icon: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

type ItemCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  badge: {
    label: string;
    className: string;
  };
  children: ReactNode;
  defaultOpen?: boolean;
  variant?: "default" | "warning";
};

interface ApartmentFormProps {
  initialData?: Apartment;
  action: (formData: FormData) => Promise<void | { success: boolean; error?: string }>;
  title: string;
  initialAccessMedia?: AccessMediaFile[];
}

const inputClass = "w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent";
const cardClass = "space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4";
const attachmentCategories = ["MANUAL", "WARRANTY", "PHOTO", "TECHNICAL_SHEET", "INSTALLER_INSTRUCTIONS", "OTHER"];
const formSections: { key: FormSectionKey; label: string; icon: string }[] = [
  { key: "main", label: "Dati principali", icon: "🏠" },
  { key: "calendar", label: "Calendario / iCal", icon: "📅" },
  { key: "technical", label: "Scheda tecnica", icon: "🛠" },
  { key: "ai", label: "Note IA", icon: "🤖" },
  { key: "access", label: "Accesso", icon: "🔑" },
];

const emptyAttachment: TechnicalAttachment = {
  filename: "",
  url: "",
  mimeType: "",
  size: null,
  category: "OTHER",
  notes: "",
  extractedText: "",
};

const emptyTechnicalItem: TechnicalItem = {
  name: "",
  type: "",
  brand: "",
  model: "",
  location: "",
  notes: "",
  recurringIssues: "",
  attachments: [],
};

const emptyRecurringIssue: RecurringIssueItem = {
  title: "",
  category: "",
  relatedItem: "",
  symptoms: "",
  solution: "",
  whenToCall: "",
  notesForAI: "",
  attachments: [],
};

const legacyApplianceLabels: Record<string, string> = {
  washingMachine: "Lavatrice",
  dishwasher: "Lavastoviglie",
  oven: "Forno",
  microwave: "Microonde",
  fridge: "Frigorifero",
  coffeeMachine: "Macchina caffe",
  stove: "Piano cottura",
};

const legacySmartHomeLabels: Record<string, string> = {
  smartLock: "Serratura smart",
  smartThermostat: "Termostato smart",
  doorSensors: "Sensori porte",
  windowSensors: "Sensori finestre",
  energySensors: "Sensori energia",
  leakSensors: "Sensori perdite",
  noiseSensor: "Sensore rumore",
};

const legacyIssueLabels: Record<string, string> = {
  slowDrains: "Scarichi lenti",
  badSmells: "Cattivi odori",
  hotWaterIssues: "Problemi acqua calda",
  acIssues: "Problemi aria condizionata",
  electricalIssues: "Problemi elettrici",
  humidityMold: "Umidita/muffa",
  lockIssues: "Problemi serratura",
  wifiIssues: "Problemi Wi-Fi",
};

function SectionRow({ title, count, icon, children, defaultOpen = false, className = "" }: SectionRowProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl ${className}`}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-lg shadow-sm ring-1 ring-white/40">{icon}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-gray-900">{title}</span>
            <span className="mt-0.5 block text-xs font-medium text-gray-500">{count} elementi</span>
          </span>
        </span>
        <ChevronRight className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-white/20 px-5 py-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function ItemCard({ title, subtitle, icon, badge, children, defaultOpen = false, variant = "default" }: ItemCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <article className={`rounded-2xl border p-4 shadow-sm backdrop-blur transition-all duration-200 hover:shadow-md ${
      variant === "warning" ? "border-yellow-200/70 bg-yellow-50/70" : "border-white/20 bg-white/60"
    }`}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-violet-500/30"
      >
        <span className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-lg shadow-sm ring-1 ring-white/50">{icon}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-gray-900">{title}</span>
            <span className="mt-1 block truncate text-xs font-medium text-gray-500">{subtitle}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
          <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </article>
  );
}

function ItemDetail({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/50 p-4 shadow-inner">
      {children}
    </div>
  );
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeAttachments(value: unknown): TechnicalAttachment[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const attachment = asRecord(item);
      return {
        filename: stringValue(attachment.filename),
        url: stringValue(attachment.url),
        mimeType: stringValue(attachment.mimeType),
        size: typeof attachment.size === "number" ? attachment.size : null,
        category: stringValue(attachment.category) || "OTHER",
        notes: stringValue(attachment.notes),
        extractedText: stringValue(attachment.extractedText),
      };
    });
}

function normalizeTechnicalItems(value: unknown, legacyLabels?: Record<string, string>): TechnicalItem[] {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item && typeof item === "object" && !Array.isArray(item))
      .map((item) => {
        const record = asRecord(item);
        return {
          ...emptyTechnicalItem,
          name: stringValue(record.name),
          type: stringValue(record.type),
          brand: stringValue(record.brand),
          model: stringValue(record.model),
          location: stringValue(record.location),
          notes: stringValue(record.notes),
          recurringIssues: stringValue(record.recurringIssues),
          attachments: normalizeAttachments(record.attachments),
        };
      });
  }

  const record = asRecord(value);
  if (Object.keys(record).length === 0) return [];

  if (legacyLabels) {
    return Object.entries(record)
      .filter(([, enabled]) => enabled === true)
      .map(([key]) => ({
        ...emptyTechnicalItem,
        name: legacyLabels[key] ?? key,
        type: key,
      }));
  }

  const legacySystemFields: { key: string; label: string }[] = [
    { key: "heatingType", label: "Riscaldamento" },
    { key: "coolingType", label: "Raffrescamento" },
    { key: "hotWaterType", label: "Acqua calda" },
    { key: "electricalPanelLocation", label: "Quadro elettrico" },
    { key: "waterShutoffLocation", label: "Chiusura acqua" },
    { key: "gasShutoffLocation", label: "Chiusura gas" },
    { key: "wifiRouterLocation", label: "Router Wi-Fi" },
  ];

  return legacySystemFields
    .map(({ key, label }) => ({ key, label, value: stringValue(record[key]) }))
    .filter(({ value }) => value !== "")
    .map(({ key, label, value }) => ({
      ...emptyTechnicalItem,
      name: label,
      type: key,
      location: value,
      notes: value,
    }));
}

function normalizeRecurringIssues(value: unknown): RecurringIssueItem[] {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item && typeof item === "object" && !Array.isArray(item))
      .map((item) => {
        const record = asRecord(item);
        return {
          ...emptyRecurringIssue,
          title: stringValue(record.title),
          category: stringValue(record.category),
          relatedItem: stringValue(record.relatedItem),
          symptoms: stringValue(record.symptoms),
          solution: stringValue(record.solution),
          whenToCall: stringValue(record.whenToCall),
          notesForAI: stringValue(record.notesForAI),
          attachments: normalizeAttachments(record.attachments),
        };
      });
  }

  return Object.entries(asRecord(value))
    .filter(([, enabled]) => enabled === true)
    .map(([key]) => ({
      ...emptyRecurringIssue,
      title: legacyIssueLabels[key] ?? key,
      category: key,
    }));
}

function AttachmentFields({
  baseName,
  attachment,
  onChange,
}: {
  baseName: string;
  attachment: TechnicalAttachment;
  onChange: (key: keyof TechnicalAttachment, value: string) => void;
}) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus("uploading");
    try {
      const blob = await upload(
        `uploads/apartment/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload" }
      );
      onChange("url", blob.url);
      onChange("filename", file.name);
      onChange("mimeType", file.type || "application/octet-stream");
      onChange("size", String(file.size));
      setUploadStatus("done");
    } catch {
      setUploadStatus("error");
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-4">
      <input type="hidden" name={`${baseName}.filename`} value={attachment.filename} />
      <input type="hidden" name={`${baseName}.url`} value={attachment.url} />
      <input type="hidden" name={`${baseName}.mimeType`} value={attachment.mimeType} />
      <input type="hidden" name={`${baseName}.size`} value={attachment.size ?? ""} />
      <input type="hidden" name={`${baseName}.extractedText`} value={attachment.extractedText} />
      {attachment.url && (
        <div className="flex flex-col gap-2 rounded-lg bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">{attachment.filename || "Allegato"}</p>
            <p className="text-xs text-gray-500">{attachment.mimeType || "Link"}{attachment.size ? ` - ${Math.round(attachment.size / 1024)} KB` : ""}</p>
          </div>
          <a href={attachment.url} target="_blank" rel="noreferrer" className="self-start rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-white">
            Apri
          </a>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
          <input type="file" onChange={handleFileChange} className={inputClass} disabled={uploadStatus === "uploading"} />
          {uploadStatus === "uploading" && <p className="mt-1 text-xs text-blue-600">Caricamento in corso...</p>}
          {uploadStatus === "done" && <p className="mt-1 text-xs text-green-600">File caricato ✓ — clicca &quot;Carica allegato&quot; per salvare</p>}
          {uploadStatus === "error" && <p className="mt-1 text-xs text-red-600">Errore caricamento. Riprova.</p>}
        </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select
          name={`${baseName}.category`}
          value={attachment.category}
          onChange={(event) => onChange("category", event.target.value)}
          className={inputClass}
        >
          {attachmentCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
        <Field label="Note" name={`${baseName}.notes`} value={attachment.notes} multiline onChange={(value) => onChange("notes", value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Drive</label>
          <input type="url" name={`${baseName}.driveUrl`} defaultValue={attachment.url.startsWith("http") ? attachment.url : ""} className={inputClass} />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          Carica allegato
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  multiline = false,
  className = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea name={name} value={value} rows={2} onChange={(event) => onChange(event.target.value)} className={inputClass} />
      ) : (
        <input type={type} name={name} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />
      )}
    </div>
  );
}

function TechnicalItemsSection({
  title,
  addLabel,
  prefix,
  items,
  setItems,
}: {
  title: string;
  addLabel: string;
  prefix: TechnicalSectionKey;
  items: TechnicalItem[];
  setItems: Dispatch<SetStateAction<TechnicalItem[]>>;
}) {
  const updateItem = (index: number, key: keyof TechnicalItem, value: string) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  };

  const updateAttachment = (itemIndex: number, attachmentIndex: number, key: keyof TechnicalAttachment, value: string) => {
    setItems((current) => current.map((item, index) => {
      if (index !== itemIndex) return item;
      return {
        ...item,
        attachments: item.attachments.map((attachment, currentAttachmentIndex) => (
          currentAttachmentIndex === attachmentIndex ? { ...attachment, [key]: value } : attachment
        )),
      };
    }));
  };

  const sectionIcon: Record<TechnicalSectionKey, string> = {
    systems: "🛠",
    appliances: "🔌",
    smartHome: "🏠",
  };

  return (
    <SectionRow title={title} count={items.length} icon={sectionIcon[prefix]}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <button type="button" onClick={() => setItems((current) => [...current, { ...emptyTechnicalItem }])} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            {addLabel}
          </button>
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">Nessun elemento inserito.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, itemIndex) => (
              <ItemCard
                key={itemIndex}
                title={item.name || `${title} ${itemIndex + 1}`}
                subtitle={[item.brand || item.model, item.location].filter(Boolean).join(" • ") || item.type || "Dettagli tecnici"}
                icon={sectionIcon[prefix]}
                badge={item.recurringIssues ? {
                  label: "Attenzione",
                  className: "bg-yellow-100 text-yellow-800",
                } : {
                  label: "OK",
                  className: "bg-emerald-100 text-emerald-700",
                }}
              >
                <ItemDetail>
                  <div className={cardClass}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">{item.name || `${title} ${itemIndex + 1}`}</p>
                    <button type="button" onClick={() => setItems((current) => current.filter((_, index) => index !== itemIndex))} className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                      Elimina
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome" name={`technicalProfile.${prefix}.${itemIndex}.name`} value={item.name} onChange={(value) => updateItem(itemIndex, "name", value)} />
                    <Field label="Tipo" name={`technicalProfile.${prefix}.${itemIndex}.type`} value={item.type} onChange={(value) => updateItem(itemIndex, "type", value)} />
                    <Field label="Marca" name={`technicalProfile.${prefix}.${itemIndex}.brand`} value={item.brand} onChange={(value) => updateItem(itemIndex, "brand", value)} />
                    <Field label="Modello" name={`technicalProfile.${prefix}.${itemIndex}.model`} value={item.model} onChange={(value) => updateItem(itemIndex, "model", value)} />
                    <Field label="Posizione" name={`technicalProfile.${prefix}.${itemIndex}.location`} value={item.location} onChange={(value) => updateItem(itemIndex, "location", value)} />
                    <Field label="Problemi ricorrenti" name={`technicalProfile.${prefix}.${itemIndex}.recurringIssues`} value={item.recurringIssues} onChange={(value) => updateItem(itemIndex, "recurringIssues", value)} />
                    <Field label="Note" name={`technicalProfile.${prefix}.${itemIndex}.notes`} value={item.notes} multiline onChange={(value) => updateItem(itemIndex, "notes", value)} className="md:col-span-2" />
                  </div>
                  </div>
                </ItemDetail>
              </ItemCard>
            ))}
          </div>
        )}
      </div>
    </SectionRow>
  );
}

function RecurringIssuesSection({
  issues,
  setIssues,
}: {
  issues: RecurringIssueItem[];
  setIssues: Dispatch<SetStateAction<RecurringIssueItem[]>>;
}) {
  const updateIssue = (index: number, key: keyof RecurringIssueItem, value: string) => {
    setIssues((current) => current.map((issue, issueIndex) => issueIndex === index ? { ...issue, [key]: value } : issue));
  };

  const updateAttachment = (issueIndex: number, attachmentIndex: number, key: keyof TechnicalAttachment, value: string) => {
    setIssues((current) => current.map((issue, index) => {
      if (index !== issueIndex) return issue;
      return {
        ...issue,
        attachments: issue.attachments.map((attachment, currentAttachmentIndex) => (
          currentAttachmentIndex === attachmentIndex ? { ...attachment, [key]: value } : attachment
        )),
      };
    }));
  };

  return (
    <SectionRow title="Problemi ricorrenti" count={issues.length} icon="⚠️">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button type="button" onClick={() => setIssues((current) => [...current, { ...emptyRecurringIssue }])} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            + Aggiungi problema
          </button>
        </div>
        {issues.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">Nessun problema inserito.</p>
        ) : (
          <div className="space-y-4">
            {issues.map((issue, issueIndex) => (
              <ItemCard
                key={issueIndex}
                title={issue.title || `Problema ${issueIndex + 1}`}
                subtitle={issue.symptoms || issue.relatedItem || "Descrizione non inserita"}
                icon="⚠️"
                variant="warning"
                badge={issue.whenToCall ? {
                  label: "Prioritario",
                  className: "bg-red-100 text-red-700",
                } : {
                  label: "Warning",
                  className: "bg-yellow-100 text-yellow-800",
                }}
              >
                <ItemDetail>
                  <div className={cardClass}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">{issue.title || `Problema ${issueIndex + 1}`}</p>
                    <button type="button" onClick={() => setIssues((current) => current.filter((_, index) => index !== issueIndex))} className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                      Elimina
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Titolo" name={`technicalProfile.recurringIssues.${issueIndex}.title`} value={issue.title} onChange={(value) => updateIssue(issueIndex, "title", value)} />
                    <Field label="Categoria" name={`technicalProfile.recurringIssues.${issueIndex}.category`} value={issue.category} onChange={(value) => updateIssue(issueIndex, "category", value)} />
                    <Field label="Elemento collegato" name={`technicalProfile.recurringIssues.${issueIndex}.relatedItem`} value={issue.relatedItem} onChange={(value) => updateIssue(issueIndex, "relatedItem", value)} />
                    <Field label="Quando chiamare tecnico" name={`technicalProfile.recurringIssues.${issueIndex}.whenToCall`} value={issue.whenToCall} onChange={(value) => updateIssue(issueIndex, "whenToCall", value)} />
                    <Field label="Sintomi" name={`technicalProfile.recurringIssues.${issueIndex}.symptoms`} value={issue.symptoms} multiline onChange={(value) => updateIssue(issueIndex, "symptoms", value)} />
                    <Field label="Soluzione" name={`technicalProfile.recurringIssues.${issueIndex}.solution`} value={issue.solution} multiline onChange={(value) => updateIssue(issueIndex, "solution", value)} />
                    <Field label="Note IA" name={`technicalProfile.recurringIssues.${issueIndex}.notesForAI`} value={issue.notesForAI} multiline onChange={(value) => updateIssue(issueIndex, "notesForAI", value)} className="md:col-span-2" />
                  </div>
                  </div>
                </ItemDetail>
              </ItemCard>
            ))}
          </div>
        )}
      </div>
    </SectionRow>
  );
}

function AttachmentList({
  baseName,
  attachments,
  onAdd,
  onRemove,
  onChange,
}: {
  baseName: string;
  attachments: TechnicalAttachment[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, key: keyof TechnicalAttachment, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Allegati</h4>
        <button type="button" onClick={onAdd} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-white">
          + Aggiungi allegato
        </button>
      </div>
      {attachments.length === 0 ? (
        <p className="rounded-lg bg-white px-4 py-3 text-sm text-gray-500">Nessun allegato inserito.</p>
      ) : (
        attachments.map((attachment, attachmentIndex) => (
          <div key={attachmentIndex} className="space-y-3">
            <div className="flex justify-end">
              <button type="button" onClick={() => onRemove(attachmentIndex)} className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                Elimina allegato
              </button>
            </div>
            <AttachmentFields
              baseName={`${baseName}.${attachmentIndex}`}
              attachment={attachment}
              onChange={(key, value) => onChange(attachmentIndex, key, value)}
            />
          </div>
        ))
      )}
    </div>
  );
}

function AccessCodeField({ label, name, value, onChange, mono, secret }: { label: string; name: string; value: string; onChange: (v: string) => void; mono: boolean; secret: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={secret && !visible ? "password" : "text"}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          autoComplete="off"
          className={`w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black${mono ? " font-mono tracking-wider" : ""}${secret ? " pr-10" : ""}`}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title={visible ? "Nascondi" : "Mostra"}
          >
            {visible ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ApartmentForm({ initialData, action, title, initialAccessMedia = [] }: ApartmentFormProps) {
  const technicalProfile = (initialData?.technicalProfile as TechnicalProfile | null) ?? {};
  const rawAccessInfo = (initialData?.accessInfo as AccessInfo | null) ?? {};
  const [activeSection, setActiveSection] = useState<FormSectionKey>("main");
  const [formError, setFormError] = useState("");
  const [systems, setSystems] = useState<TechnicalItem[]>(normalizeTechnicalItems(technicalProfile.systems));
  const [appliances, setAppliances] = useState<TechnicalItem[]>(normalizeTechnicalItems(technicalProfile.appliances, legacyApplianceLabels));
  const [smartHome, setSmartHome] = useState<TechnicalItem[]>(normalizeTechnicalItems(technicalProfile.smartHome, legacySmartHomeLabels));
  const [recurringIssues, setRecurringIssues] = useState<RecurringIssueItem[]>(normalizeRecurringIssues(technicalProfile.recurringIssues));
  const [generalAttachments, setGeneralAttachments] = useState<TechnicalAttachment[]>(normalizeAttachments(technicalProfile.generalAttachments));

  // Access section state
  const [accessInfo, setAccessInfo] = useState<AccessInfo>(rawAccessInfo);
  const [accessMedia, setAccessMedia] = useState<AccessMediaFile[]>(initialAccessMedia);
  const [accessOpen, setAccessOpen] = useState({ codes: true, instructions: true, media: true });
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [, startDeleteMedia] = useTransition();
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const setAccess = (key: keyof AccessInfo) => (value: string) =>
    setAccessInfo((prev) => ({ ...prev, [key]: value }));

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !initialData?.id) return;
    setMediaError(null);
    setMediaUploading(true);
    try {
      const blob = await upload(
        `uploads/apartment/${initialData.id}/access/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload" }
      );
      const fd = new FormData();
      fd.append("apartmentId", initialData.id);
      fd.append("url", blob.url);
      fd.append("filename", file.name);
      fd.append("mimeType", file.type);
      fd.append("size", String(file.size));
      fd.append("category", "ACCESS");
      const result = await saveApartmentAttachmentFromBlob(fd);
      if (result.success && result.attachment) {
        setAccessMedia((prev) => [result.attachment as AccessMediaFile, ...prev]);
      } else {
        setMediaError("Errore durante il salvataggio.");
      }
    } catch {
      setMediaError("Errore durante il caricamento. Riprova.");
    }
    setMediaUploading(false);
    e.target.value = "";
  };

  const handleDeleteMedia = (id: string) => {
    startDeleteMedia(async () => {
      await deleteApartmentAttachmentById(id);
      setAccessMedia((prev) => prev.filter((m) => m.id !== id));
    });
  };

  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <form
        action={async (formData) => {
          setFormError("");
          const result = await action(formData);

          if (result?.success === false) {
            setFormError(result.error || "Errore durante il salvataggio.");
          }
        }}
        encType="multipart/form-data"
        className="relative"
      >
        {initialData && <input type="hidden" name="id" value={initialData.id} />}

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
          <aside className="border-b border-gray-100 bg-gray-50/60 p-4 lg:border-b-0 lg:border-r">
            <div className="flex gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
              {formSections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    activeSection === section.key
                      ? "bg-black text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0 p-6 pb-28 md:p-8 md:pb-28">
            <div hidden={activeSection !== "main"} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Informazioni Base</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Proprietà *</label>
                    <input required type="text" id="name" name="name" defaultValue={initialData?.name} placeholder="Es. Domus Colosseo" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Fisico *</label>
                    <input required type="text" id="address" name="address" defaultValue={initialData?.address} placeholder="Via Roma 10, Roma" className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Geolocalizzazione</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitudine *</label>
                    <input required type="number" step="any" id="latitude" name="latitude" defaultValue={initialData?.latitude} placeholder="Es. 41.8902" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitudine *</label>
                    <input required type="number" step="any" id="longitude" name="longitude" defaultValue={initialData?.longitude} placeholder="Es. 12.4922" className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Caratteristiche</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="squareMeters" className="block text-sm font-medium text-gray-700 mb-1">Superficie (m2)</label>
                    <input required type="number" min="0" id="squareMeters" name="squareMeters" defaultValue={initialData?.squareMeters ?? 50} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Stanze</label>
                    <input required type="number" min="0" id="bedrooms" name="bedrooms" defaultValue={initialData?.bedrooms ?? 1} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">Bagni</label>
                    <input required type="number" min="0" id="bathrooms" name="bathrooms" defaultValue={initialData?.bathrooms ?? 1} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-1">Ospiti Max</label>
                    <input required type="number" min="1" id="maxGuests" name="maxGuests" defaultValue={initialData?.maxGuests ?? 2} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            <div hidden={activeSection !== "calendar"} className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Sincronizzazione iCal</h2>
              <div>
                <label htmlFor="icalUrl" className="block text-sm font-medium text-gray-700 mb-1">Airbnb iCal URL</label>
                <input type="url" id="icalUrl" name="icalUrl" defaultValue={initialData?.icalUrl ?? ""} placeholder="https://www.airbnb.com/calendar/ical/..." className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">Incolla qui l'URL iCal di Airbnb per sincronizzare automaticamente le prenotazioni.</p>
              </div>
            </div>

            <div hidden={activeSection !== "technical"} className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Scheda Tecnica Appartamento</h2>
              <TechnicalItemsSection title="Impianti" addLabel="+ Aggiungi impianto" prefix="systems" items={systems} setItems={setSystems} />
              <TechnicalItemsSection title="Elettrodomestici" addLabel="+ Aggiungi elettrodomestico" prefix="appliances" items={appliances} setItems={setAppliances} />
              <TechnicalItemsSection title="Domotica" addLabel="+ Aggiungi dispositivo domotico" prefix="smartHome" items={smartHome} setItems={setSmartHome} />
              <RecurringIssuesSection issues={recurringIssues} setIssues={setRecurringIssues} />
            </div>

            <div hidden={activeSection !== "attachments"} className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Allegati</h2>
              <div className="space-y-4 rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-800">Allegati generali</h3>
                <AttachmentList
                  baseName="technicalProfile.generalAttachments"
                  attachments={generalAttachments}
                  onAdd={() => setGeneralAttachments((current) => [...current, { ...emptyAttachment }])}
                  onRemove={(index) => setGeneralAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                  onChange={(index, key, value) => setGeneralAttachments((current) => current.map((attachment, currentIndex) => currentIndex === index ? { ...attachment, [key]: value } : attachment))}
                />
              </div>
            </div>

            <div hidden={activeSection !== "ai"} className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Note IA</h2>
              <div className="space-y-4 rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-800">Note per IA</h3>
                <textarea id="technicalProfile.aiNotes" name="technicalProfile.aiNotes" defaultValue={technicalProfile.aiNotes ?? ""} rows={4} placeholder="Note operative utili per cleaner, manutentori e manager..." className={inputClass} />
              </div>
            </div>

            {/* ── ACCESSO ── */}
            <div hidden={activeSection !== "access"} className="space-y-3">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Accesso appartamento</h2>

              {/* Codici */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <button type="button" onClick={() => setAccessOpen((s) => ({ ...s, codes: !s.codes }))} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/60 hover:bg-gray-100/60 transition-colors text-left">
                  <div className="flex items-center gap-2"><span>🔐</span><span className="text-sm font-medium text-gray-800">Codici di accesso</span></div>
                  <span className="text-gray-400 text-xs">{accessOpen.codes ? "▲" : "▼"}</span>
                </button>
                {accessOpen.codes && (
                  <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100">
                    {([
                      { key: "doorCode" as const, label: "Codice porta / smart lock", mono: true, secret: true },
                      { key: "safeCode" as const, label: "Codice cassetta chiavi", mono: true, secret: true },
                      { key: "buildingCode" as const, label: "Codice portone / citofono", mono: true, secret: true },
                      { key: "floor" as const, label: "Piano / interno", mono: false, secret: false },
                      { key: "wifiNetwork" as const, label: "Rete Wi-Fi", mono: true, secret: false },
                      { key: "wifiPassword" as const, label: "Password Wi-Fi", mono: true, secret: true },
                    ] as const).map(({ key, label, mono, secret }) => (
                      <AccessCodeField key={key} label={label} name={`accessInfo.${key}`} value={accessInfo[key] ?? ""} onChange={setAccess(key)} mono={mono} secret={secret} />
                    ))}
                  </div>
                )}
              </div>

              {/* Istruzioni */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <button type="button" onClick={() => setAccessOpen((s) => ({ ...s, instructions: !s.instructions }))} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/60 hover:bg-gray-100/60 transition-colors text-left">
                  <div className="flex items-center gap-2"><span>📋</span><span className="text-sm font-medium text-gray-800">Istruzioni</span></div>
                  <span className="text-gray-400 text-xs">{accessOpen.instructions ? "▲" : "▼"}</span>
                </button>
                {accessOpen.instructions && (
                  <div className="px-4 py-4 space-y-4 border-t border-gray-100">
                    {([
                      { key: "directions" as const, label: "Come raggiungere l'appartamento", placeholder: "Es. Dall'ingresso principale girare a destra..." },
                      { key: "checkInNotes" as const, label: "Note check-in / check-out", placeholder: "Es. Check-in dalle 15:00, chiavi nella cassetta all'uscita..." },
                      { key: "parking" as const, label: "Parcheggio", placeholder: "Es. ZTL attiva, parcheggio P1 a 200m..." },
                    ] as const).map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                        <textarea name={`accessInfo.${key}`} rows={2} value={accessInfo[key] ?? ""} onChange={(e) => setAccess(key)(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black resize-none" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Foto e video */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <button type="button" onClick={() => setAccessOpen((s) => ({ ...s, media: !s.media }))} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/60 hover:bg-gray-100/60 transition-colors text-left">
                  <div className="flex items-center gap-2">
                    <span>📸</span>
                    <span className="text-sm font-medium text-gray-800">Foto e video accesso</span>
                    {accessMedia.length > 0 && <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-semibold">{accessMedia.length} file</span>}
                  </div>
                  <span className="text-gray-400 text-xs">{accessOpen.media ? "▲" : "▼"}</span>
                </button>
                {accessOpen.media && (
                  <div className="px-4 py-4 border-t border-gray-100 space-y-3">
                    {mediaError && <p className="text-xs text-red-600">⚠️ {mediaError}</p>}
                    {accessMedia.length === 0 ? (
                      <div onClick={() => mediaInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                        <span className="text-3xl mb-1">📸</span>
                        <p className="text-xs font-medium text-gray-500">Carica foto o video dell'accesso</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Cassetta chiavi, portone, video istruzioni...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {accessMedia.map((file) => (
                          <div key={file.id} className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex flex-col">
                            <a href={file.url ?? "#"} target="_blank" rel="noreferrer" className="block aspect-video relative">
                              {file.mimeType?.startsWith("video/") ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">▶</div>
                                </div>
                              ) : (
                                <img src={file.url ?? ""} alt={file.filename} className="absolute inset-0 w-full h-full object-cover" />
                              )}
                            </a>
                            <div className="px-2 py-1 bg-white border-t border-gray-100 flex items-center justify-between gap-1">
                              <p className="text-[9px] text-gray-500 truncate">{file.filename}</p>
                              <button type="button" onClick={() => handleDeleteMedia(file.id)} className="shrink-0 w-4 h-4 rounded-full bg-red-100 text-red-500 text-[9px] flex items-center justify-center hover:bg-red-200">✕</button>
                            </div>
                          </div>
                        ))}
                        <div onClick={() => mediaInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 aspect-video cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                          <span className="text-xl text-gray-300">+</span>
                        </div>
                      </div>
                    )}
                    <button type="button" onClick={() => mediaInputRef.current?.click()} disabled={mediaUploading} className="flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                      {mediaUploading ? <><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Caricamento...</> : "↑ Carica foto/video"}
                    </button>
                    <input ref={mediaInputRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm" onChange={handleMediaUpload} />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-gray-100 bg-white/90 px-6 py-4 backdrop-blur md:px-8">
          <Link href="/dashboard/manager/apartments" className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Annulla
          </Link>
          {formError && (
            <p className="mr-auto max-w-md rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
              {formError}
            </p>
          )}
          <button type="submit" className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900">
            {initialData ? "Aggiorna Proprietà" : "Salva Proprietà"}
          </button>
        </div>
      </form>
    </section>
  );
}
