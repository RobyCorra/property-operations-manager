"use client";

import { useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { uploadApartmentWizardAttachment } from "@/src/app/actions/upload";

type WizardTechnicalItem = {
  name: string;
  type: string;
  brand: string;
  model: string;
  location: string;
  notes: string;
};

type SmartHomeItem = WizardTechnicalItem & {
  category: string;
};

type WizardAttachment = {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  category: string;
  notes: string;
  extractedText: string;
};

type WizardData = {
  name: string;
  address: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  guestAccess: string;
  system: WizardTechnicalItem;
  addSystem: boolean;
  systems: WizardTechnicalItem[];
  appliance: WizardTechnicalItem;
  addAppliance: boolean;
  appliances: WizardTechnicalItem[];
  smartHome: SmartHomeItem;
  addSmartHome: boolean;
  smartHomeItems: SmartHomeItem[];
  recurringIssue: string;
  generalAttachments: WizardAttachment[];
};

type ApartmentCreateWizardProps = {
  action: (formData: FormData) => Promise<void>;
};

const totalSteps = 10;
const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:ring-2 focus:ring-violet-600/20";
const emptyItem: WizardTechnicalItem = {
  name: "",
  type: "",
  brand: "",
  model: "",
  location: "",
  notes: "",
};

const initialData: WizardData = {
  name: "",
  address: "",
  maxGuests: 1,
  bedrooms: 1,
  bathrooms: 1,
  squareMeters: 30,
  guestAccess: "",
  system: { ...emptyItem },
  addSystem: false,
  systems: [],
  appliance: { ...emptyItem },
  addAppliance: false,
  appliances: [],
  smartHome: { ...emptyItem, category: "" },
  addSmartHome: false,
  smartHomeItems: [],
  recurringIssue: "",
  generalAttachments: [],
};

const attachmentCategories = ["MANUAL", "WARRANTY", "PHOTO", "TECHNICAL_SHEET", "INSTALLER_INSTRUCTIONS", "OTHER"];

export default function ApartmentCreateWizard({ action }: ApartmentCreateWizardProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WizardData>(initialData);
  const [error, setError] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentCategory, setAttachmentCategory] = useState("OTHER");
  const [attachmentNotes, setAttachmentNotes] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [isPending, startTransition] = useTransition();
  const progress = Math.round((step / totalSteps) * 100);

  const canCreate = formData.name.trim() !== "" && formData.address.trim() !== "";
  const stepTitle = useMemo(() => `Step ${Math.min(step, totalSteps)} di ${totalSteps}`, [step]);

  const updateField = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const updateItem = (
    section: "system" | "appliance" | "smartHome",
    key: keyof SmartHomeItem,
    value: string
  ) => {
    setFormData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const isItemFilled = (item: WizardTechnicalItem) => (
    Object.values(item).some((value) => value.trim() !== "")
  );

  const saveTechnicalItem = (section: "systems" | "appliances" | "smartHomeItems") => {
    if (section === "systems") {
      if (!isItemFilled(formData.system)) {
        setError("Inserisci almeno un dato dell'impianto prima di salvarlo.");
        return;
      }

      setFormData((current) => ({
        ...current,
        systems: [...current.systems, current.system],
        system: { ...emptyItem },
        addSystem: false,
      }));
    }

    if (section === "appliances") {
      if (!isItemFilled(formData.appliance)) {
        setError("Inserisci almeno un dato dell'elettrodomestico prima di salvarlo.");
        return;
      }

      setFormData((current) => ({
        ...current,
        appliances: [...current.appliances, current.appliance],
        appliance: { ...emptyItem },
        addAppliance: false,
      }));
    }

    if (section === "smartHomeItems") {
      if (!isItemFilled(formData.smartHome)) {
        setError("Seleziona o inserisci almeno un dato del dispositivo smart prima di salvarlo.");
        return;
      }

      setFormData((current) => ({
        ...current,
        smartHomeItems: [...current.smartHomeItems, current.smartHome],
        smartHome: { ...emptyItem, category: "" },
        addSmartHome: false,
      }));
    }

    setError("");
  };

  const removeTechnicalItem = (section: "systems" | "appliances" | "smartHomeItems", index: number) => {
    setFormData((current) => ({
      ...current,
      [section]: current[section].filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((current) => ({
      ...current,
      generalAttachments: current.generalAttachments.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.name.trim()) {
      setError("Il nome appartamento e obbligatorio.");
      return;
    }

    if (step === 2 && !formData.address.trim()) {
      setError("L'indirizzo e obbligatorio.");
      return;
    }

    setError("");
    setStep((current) => Math.min(current + 1, totalSteps));
  };

  const previousStep = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const skipStep = () => {
    setError("");
    setStep((current) => Math.min(current + 1, totalSteps));
  };

  const appendTechnicalItems = (payload: FormData, prefix: string, items: WizardTechnicalItem[]) => {
    items.forEach((item, index) => {
      payload.set(`${prefix}.${index}.name`, item.name);
      payload.set(`${prefix}.${index}.type`, item.type);
      payload.set(`${prefix}.${index}.brand`, item.brand);
      payload.set(`${prefix}.${index}.model`, item.model);
      payload.set(`${prefix}.${index}.location`, item.location);
      payload.set(`${prefix}.${index}.notes`, item.notes);
      payload.set(`${prefix}.${index}.recurringIssues`, "");
    });
  };

  const appendAttachments = (payload: FormData, prefix: string, attachments: WizardAttachment[]) => {
    attachments.forEach((attachment, index) => {
      payload.set(`${prefix}.${index}.filename`, attachment.filename);
      payload.set(`${prefix}.${index}.url`, attachment.url);
      payload.set(`${prefix}.${index}.mimeType`, attachment.mimeType);
      payload.set(`${prefix}.${index}.size`, String(attachment.size));
      payload.set(`${prefix}.${index}.category`, attachment.category);
      payload.set(`${prefix}.${index}.notes`, attachment.notes);
      payload.set(`${prefix}.${index}.extractedText`, attachment.extractedText);
    });
  };

  const uploadAttachment = async () => {
    if (!attachmentFile) {
      setError("Seleziona un file da caricare.");
      return;
    }

    setUploadingAttachment(true);
    setError("");

    const payload = new FormData();
    payload.set("file", attachmentFile);
    payload.set("category", attachmentCategory);
    payload.set("notes", attachmentNotes);

    const result = await uploadApartmentWizardAttachment(payload);
    setUploadingAttachment(false);

    if (!result.success || !result.attachment) {
      setError(result.error || "Errore durante il caricamento allegato.");
      return;
    }

    setFormData((current) => ({
      ...current,
      generalAttachments: [...current.generalAttachments, result.attachment],
    }));
    setAttachmentFile(null);
    setAttachmentCategory("OTHER");
    setAttachmentNotes("");
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreate) {
      setError("Nome e indirizzo sono obbligatori per creare l'appartamento.");
      return;
    }

    const payload = new FormData();
    payload.set("name", formData.name.trim());
    payload.set("address", formData.address.trim());
    payload.set("latitude", "0");
    payload.set("longitude", "0");
    payload.set("squareMeters", String(formData.squareMeters || 30));
    payload.set("bedrooms", String(formData.bedrooms || 1));
    payload.set("bathrooms", String(formData.bathrooms || 1));
    payload.set("maxGuests", String(formData.maxGuests || 1));
    payload.set("icalUrl", "");
    payload.set("technicalProfile.aiNotes", "");

    if (formData.guestAccess) {
      payload.set("technicalProfile.guestAccess", formData.guestAccess);
    }

    appendTechnicalItems(payload, "technicalProfile.systems", formData.systems);
    appendTechnicalItems(payload, "technicalProfile.appliances", formData.appliances);
    appendTechnicalItems(
      payload,
      "technicalProfile.smartHome",
      formData.smartHomeItems.map((item) => ({ ...item, type: item.category || item.type }))
    );
    appendAttachments(payload, "technicalProfile.generalAttachments", formData.generalAttachments);

    if (formData.recurringIssue.trim()) {
      payload.set("technicalProfile.recurringIssues.0.title", "Problema ricorrente");
      payload.set("technicalProfile.recurringIssues.0.category", "OTHER");
      payload.set("technicalProfile.recurringIssues.0.relatedItem", "");
      payload.set("technicalProfile.recurringIssues.0.symptoms", formData.recurringIssue.trim());
      payload.set("technicalProfile.recurringIssues.0.solution", "");
      payload.set("technicalProfile.recurringIssues.0.whenToCall", "");
      payload.set("technicalProfile.recurringIssues.0.notesForAI", formData.recurringIssue.trim());
    }

    startTransition(() => {
      void action(payload);
    });
  };

  return (
    <form onSubmit={handleCreate} className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl md:p-8">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>{stepTitle}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="min-h-[330px]">
        {step === 0 && (
          <WizardIntro />
        )}

        {step === 1 && (
          <WizardStep title="Come si chiama l'appartamento?">
            <input className={inputClass} value={formData.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Trastevere 68 Stylish Apartment" />
          </WizardStep>
        )}

        {step === 2 && (
          <WizardStep title="Dove si trova?">
            <input className={inputClass} value={formData.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Via della Scala 68, Roma" />
            <p className="text-xs font-medium text-slate-400">Le coordinate saranno impostate temporaneamente a 0 e potrai completarle dopo.</p>
          </WizardStep>
        )}

        {step === 3 && (
          <WizardStep title="Quanti ospiti puo ospitare?">
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Ospiti" value={formData.maxGuests} onChange={(value) => updateField("maxGuests", value)} />
              <NumberField label="Camere" value={formData.bedrooms} onChange={(value) => updateField("bedrooms", value)} />
              <NumberField label="Bagni" value={formData.bathrooms} onChange={(value) => updateField("bathrooms", value)} />
              <NumberField label="Metri quadri" value={formData.squareMeters} onChange={(value) => updateField("squareMeters", value)} />
            </div>
          </WizardStep>
        )}

        {step === 4 && (
          <WizardStep title="Come entrano gli ospiti?">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {["Self check-in", "Con chiavi", "Concierge / persona sul posto", "Da completare dopo"].map((option) => (
                <button key={option} type="button" onClick={() => updateField("guestAccess", option)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-colors ${formData.guestAccess === option ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  {option}
                </button>
              ))}
            </div>
          </WizardStep>
        )}

        {step === 5 && (
          <MultiTechnicalItemStep
            title="Vuoi aggiungere un primo impianto?"
            listTitle="Impianti aggiunti"
            addAnotherLabel="Aggiungi altro impianto"
            saveLabel="Salva impianto"
            enabled={formData.addSystem}
            onToggle={(value) => updateField("addSystem", value)}
            item={formData.system}
            onChange={(key, value) => updateItem("system", key, value)}
            items={formData.systems}
            onSave={() => saveTechnicalItem("systems")}
            onAddAnother={() => updateField("addSystem", true)}
            onRemove={(index) => removeTechnicalItem("systems", index)}
            onContinue={nextStep}
            helper
          />
        )}

        {step === 6 && (
          <MultiTechnicalItemStep
            title="Vuoi aggiungere un elettrodomestico?"
            listTitle="Elettrodomestici aggiunti"
            addAnotherLabel="Aggiungi altro elettrodomestico"
            saveLabel="Salva elettrodomestico"
            enabled={formData.addAppliance}
            onToggle={(value) => updateField("addAppliance", value)}
            item={formData.appliance}
            onChange={(key, value) => updateItem("appliance", key, value)}
            items={formData.appliances}
            onSave={() => saveTechnicalItem("appliances")}
            onAddAnother={() => updateField("addAppliance", true)}
            onRemove={(index) => removeTechnicalItem("appliances", index)}
            onContinue={nextStep}
          />
        )}

        {step === 7 && (
          <WizardStep title="Hai dispositivi smart o domotici?">
            <AddedItemsList
              title="Dispositivi domotici aggiunti"
              items={formData.smartHomeItems}
              onRemove={(index) => removeTechnicalItem("smartHomeItems", index)}
            />
            <div className="grid grid-cols-2 gap-3">
              {["Serratura smart", "Termostato", "Sensori", "Router/Wi-Fi", "Altro", "Salta"].map((option) => (
                <button key={option} type="button" onClick={() => {
                  updateField("addSmartHome", option !== "Salta");
                  updateItem("smartHome", "category", option === "Salta" ? "" : option);
                  updateItem("smartHome", "name", option === "Salta" ? "" : option);
                }} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-colors ${formData.smartHome.category === option ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  {option}
                </button>
              ))}
            </div>
            {formData.addSmartHome && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField label="Marca" value={formData.smartHome.brand} onChange={(value) => updateItem("smartHome", "brand", value)} />
                  <TextField label="Modello" value={formData.smartHome.model} onChange={(value) => updateItem("smartHome", "model", value)} />
                  <TextField label="Posizione" value={formData.smartHome.location} onChange={(value) => updateItem("smartHome", "location", value)} />
                  <TextField label="Note" value={formData.smartHome.notes} onChange={(value) => updateItem("smartHome", "notes", value)} />
                </div>
                <button type="button" onClick={() => saveTechnicalItem("smartHomeItems")} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200">
                  Salva dispositivo
                </button>
              </>
            )}
            {formData.smartHomeItems.length > 0 && !formData.addSmartHome && (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-bold text-slate-700">Vuoi aggiungerne un altro?</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => updateField("addSmartHome", true)} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600">
                    Aggiungi altro
                  </button>
                  <button type="button" onClick={nextStep} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
                    Continua
                  </button>
                </div>
              </div>
            )}
          </WizardStep>
        )}

        {step === 8 && (
          <WizardStep title="Ci sono problemi noti o ricorrenti?">
            <textarea className={inputClass} rows={5} value={formData.recurringIssue} onChange={(event) => updateField("recurringIssue", event.target.value)} placeholder="Es. Il climatizzatore mostra errore E5 quando resta acceso molte ore..." />
          </WizardStep>
        )}

        {step === 9 && (
          <WizardStep title="Vuoi caricare documenti o foto utili?">
            <AttachmentUploadStep
              file={attachmentFile}
              category={attachmentCategory}
              notes={attachmentNotes}
              uploading={uploadingAttachment}
              attachments={formData.generalAttachments}
              onFileChange={setAttachmentFile}
              onCategoryChange={setAttachmentCategory}
              onNotesChange={setAttachmentNotes}
              onUpload={uploadAttachment}
              onRemove={removeAttachment}
            />
          </WizardStep>
        )}

        {step === 10 && (
          <WizardSummary formData={formData} />
        )}
      </div>

      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</p>}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={previousStep} disabled={step === 0 || isPending} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 disabled:opacity-40">
          Indietro
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          {step > 0 && step < totalSteps && (
            <button type="button" onClick={skipStep} disabled={isPending || step === 1 || step === 2} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 disabled:opacity-40">
              Salta
            </button>
          )}
          {step < totalSteps ? (
            <button type="button" onClick={nextStep} disabled={isPending} className="rounded-full bg-slate-900 px-7 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200">
              {step === 0 ? "Inizia" : "Avanti"}
            </button>
          ) : (
            <button type="submit" disabled={isPending || !canCreate} className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-7 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-violet-200 disabled:opacity-50">
              {isPending ? "Creazione..." : "Crea appartamento"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function WizardIntro() {
  return (
    <div className="flex min-h-[300px] flex-col justify-center space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-violet-50 text-3xl">🏠</div>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Configuriamo il tuo appartamento</h2>
      <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-slate-500">
        Ti guidero passo passo. Puoi saltare le informazioni e completarle dopo.
      </p>
    </div>
  );
}

function WizardStep({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <input className={inputClass} type="number" min="0" value={value} onChange={(event) => onChange(parseInt(event.target.value, 10) || 0)} />
    </label>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function AddedItemsList({
  title,
  items,
  onRemove,
}: {
  title: string;
  items: WizardTechnicalItem[];
  onRemove: (index: number) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
            <p className="truncate text-sm font-bold text-slate-700">
              {item.name || item.type || "Elemento"} {item.brand} {item.model} {item.location}
            </p>
            <button type="button" onClick={() => onRemove(index)} className="shrink-0 text-[10px] font-black uppercase tracking-widest text-rose-500">
              Rimuovi
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiTechnicalItemStep({
  title,
  listTitle,
  addAnotherLabel,
  saveLabel,
  enabled,
  onToggle,
  item,
  onChange,
  items,
  onSave,
  onAddAnother,
  onRemove,
  onContinue,
  helper = false,
}: {
  title: string;
  listTitle: string;
  addAnotherLabel: string;
  saveLabel: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  item: WizardTechnicalItem;
  onChange: (key: keyof SmartHomeItem, value: string) => void;
  items: WizardTechnicalItem[];
  onSave: () => void;
  onAddAnother: () => void;
  onRemove: (index: number) => void;
  onContinue: () => void;
  helper?: boolean;
}) {
  return (
    <WizardStep title={title}>
      <AddedItemsList title={listTitle} items={items} onRemove={onRemove} />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onToggle(true)} className={`rounded-2xl border px-4 py-3 text-sm font-bold ${enabled ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-100 bg-white text-slate-600"}`}>
          Aggiungi
        </button>
        <button type="button" onClick={() => onToggle(false)} className={`rounded-2xl border px-4 py-3 text-sm font-bold ${!enabled ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-100 bg-white text-slate-600"}`}>
          Salta
        </button>
      </div>
      {enabled && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Nome" value={item.name} onChange={(value) => onChange("name", value)} />
            <TextField label="Tipo" value={item.type} onChange={(value) => onChange("type", value)} />
            <TextField label="Marca" value={item.brand} onChange={(value) => onChange("brand", value)} />
            <TextField label="Modello" value={item.model} onChange={(value) => onChange("model", value)} />
            <TextField label="Posizione" value={item.location} onChange={(value) => onChange("location", value)} />
            <TextField label="Note" value={item.notes} onChange={(value) => onChange("notes", value)} />
          </div>
          {helper && (
            <div className="rounded-3xl border border-violet-100 bg-violet-50 px-5 py-4 text-sm font-medium text-violet-700">
              🤖 Aiuto IA: inserisci marca e modello, in futuro potro cercare manuali e problemi comuni.
            </div>
          )}
          <button type="button" onClick={onSave} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200">
            {saveLabel}
          </button>
        </>
      )}
      {items.length > 0 && !enabled && (
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-bold text-slate-700">Vuoi aggiungerne un altro?</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onAddAnother} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600">
              {addAnotherLabel}
            </button>
            <button type="button" onClick={onContinue} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
              Continua
            </button>
          </div>
        </div>
      )}
    </WizardStep>
  );
}

function AttachmentUploadStep({
  file,
  category,
  notes,
  uploading,
  attachments,
  onFileChange,
  onCategoryChange,
  onNotesChange,
  onUpload,
  onRemove,
}: {
  file: File | null;
  category: string;
  notes: string;
  uploading: boolean;
  attachments: WizardAttachment[];
  onFileChange: (file: File | null) => void;
  onCategoryChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onUpload: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">File</span>
            <input
              className={inputClass}
              type="file"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoria</span>
            <select className={inputClass} value={category} onChange={(event) => onCategoryChange(event.target.value)}>
              {attachmentCategories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note opzionali</span>
            <textarea className={inputClass} rows={3} value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Es. Manuale climatizzatore soggiorno..." />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onUpload}
            disabled={uploading || !file}
            className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200 disabled:opacity-40"
          >
            {uploading ? "Caricamento..." : "Carica allegato"}
          </button>
        </div>
      </div>

      {attachments.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 text-sm font-medium text-slate-500">
          Nessun allegato caricato. Puoi saltare questo step e aggiungerli dopo nella Scheda Tecnica.
        </p>
      ) : (
        <div className="rounded-3xl border border-slate-100 bg-white p-4">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Allegati caricati</p>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div key={`${attachment.url}-${index}`} className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{attachment.filename}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {attachment.category} · {attachment.mimeType} · {Math.round(attachment.size / 1024)} KB
                  </p>
                  {attachment.notes && <p className="mt-1 text-xs font-medium text-slate-500">{attachment.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <a href={attachment.url} target="_blank" rel="noreferrer" className="rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm">
                    Apri
                  </a>
                  <button type="button" onClick={() => onRemove(index)} className="rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 shadow-sm">
                    Rimuovi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WizardSummary({ formData }: { formData: WizardData }) {
  const rows = [
    ["Nome", formData.name || "Mancante"],
    ["Indirizzo", formData.address || "Mancante"],
    ["Ospiti", String(formData.maxGuests)],
    ["Camere", String(formData.bedrooms)],
    ["Bagni", String(formData.bathrooms)],
    ["Metri quadri", String(formData.squareMeters)],
    ["Accesso", formData.guestAccess || "Da completare dopo"],
    ["Impianti", formData.systems.length > 0 ? `${formData.systems.length} aggiunti` : "Nessuno"],
    ["Elettrodomestici", formData.appliances.length > 0 ? `${formData.appliances.length} aggiunti` : "Nessuno"],
    ["Domotica", formData.smartHomeItems.length > 0 ? `${formData.smartHomeItems.length} aggiunti` : "Nessuna"],
    ["Problemi ricorrenti", formData.recurringIssue || "Nessuno"],
    ["Allegati", formData.generalAttachments.length > 0 ? `${formData.generalAttachments.length} caricati` : "Nessuno"],
  ];

  return (
    <WizardStep title="Riepilogo">
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <span className="max-w-[60%] text-right text-sm font-bold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </WizardStep>
  );
}
