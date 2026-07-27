"use client";

import { useMemo, useState, useTransition } from "react";
import { useLang } from "@/src/components/lang-context";
import type { FormEvent } from "react";

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

type WizardRecurringIssue = {
  title: string;
  symptoms: string;
  solution: string;
  whenToCall: string;
};


type WizardData = {
  name: string;
  apartmentCode: string;
  address: string;
  icalUrl: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  accessType: string;
  accessCode: string;
  accessNotes: string;
  system: WizardTechnicalItem;
  addSystem: boolean;
  systems: WizardTechnicalItem[];
  appliance: WizardTechnicalItem;
  addAppliance: boolean;
  appliances: WizardTechnicalItem[];
  smartHome: SmartHomeItem;
  addSmartHome: boolean;
  smartHomeItems: SmartHomeItem[];
  recurringIssue: WizardRecurringIssue;
  addRecurringIssue: boolean;
  recurringIssues: WizardRecurringIssue[];
  aiNotes: string;
};

type ApartmentCreateWizardProps = {
  action: (formData: FormData) => Promise<void | { success: boolean; error?: string }>;
};

const totalSteps = 10;

const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:ring-2 focus:ring-violet-600/20";
const selectClass = inputClass;

const emptyItem: WizardTechnicalItem = { name: "", type: "", brand: "", model: "", location: "", notes: "" };
const emptyIssue: WizardRecurringIssue = { title: "", symptoms: "", solution: "", whenToCall: "" };

const SYSTEM_TYPES = ["Caldaia", "Condizionatore / Split", "Boiler / Scaldabagno", "Impianto elettrico", "Contatore luce", "Contatore gas", "Contatore acqua", "Pannelli solari", "Riscaldamento a pavimento", "Ventilazione", "Altro"];
const APPLIANCE_TYPES = ["Frigorifero", "Congelatore", "Lavatrice", "Lavastoviglie", "Asciugatrice", "Forno", "Microonde", "Piano cottura", "Cappa", "Televisore", "Ferro da stiro", "Aspirapolvere", "Altro"];


const ACCESS_TYPES = ["Self check-in", "Con chiavi", "Concierge / persona sul posto", "Da completare dopo"];

const initialData: WizardData = {
  name: "",
  apartmentCode: "",
  address: "",
  icalUrl: "",
  maxGuests: 1,
  bedrooms: 1,
  bathrooms: 1,
  squareMeters: 30,
  accessType: "",
  accessCode: "",
  accessNotes: "",
  system: { ...emptyItem },
  addSystem: false,
  systems: [],
  appliance: { ...emptyItem },
  addAppliance: false,
  appliances: [],
  smartHome: { ...emptyItem, category: "" },
  addSmartHome: false,
  smartHomeItems: [],
  recurringIssue: { ...emptyIssue },
  addRecurringIssue: false,
  recurringIssues: [],
  aiNotes: "",
};


export default function ApartmentCreateWizard({ action }: ApartmentCreateWizardProps) {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WizardData>(initialData);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const progress = Math.round((step / totalSteps) * 100);

  const canCreate = formData.name.trim() !== "" && formData.address.trim() !== "";
  const stepWord = t.awStepWord;
  const stepTitle = useMemo(() => `${stepWord} ${Math.min(step, totalSteps)} / ${totalSteps}`, [step, stepWord]);

  const updateField = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const updateItem = (section: "system" | "appliance" | "smartHome", key: keyof SmartHomeItem, value: string) => {
    setFormData((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
  };

  const updateIssueField = (key: keyof WizardRecurringIssue, value: string) => {
    setFormData((current) => ({ ...current, recurringIssue: { ...current.recurringIssue, [key]: value } }));
  };

  const isItemFilled = (item: WizardTechnicalItem) => Object.values(item).some((v) => v.trim() !== "");

  const saveTechnicalItem = (section: "systems" | "appliances" | "smartHomeItems") => {
    if (section === "systems") {
      if (!isItemFilled(formData.system)) { setError(t.awErrSystem); return; }
      setFormData((c) => ({ ...c, systems: [...c.systems, c.system], system: { ...emptyItem }, addSystem: false }));
    }
    if (section === "appliances") {
      if (!isItemFilled(formData.appliance)) { setError(t.awErrAppliance); return; }
      setFormData((c) => ({ ...c, appliances: [...c.appliances, c.appliance], appliance: { ...emptyItem }, addAppliance: false }));
    }
    if (section === "smartHomeItems") {
      if (!isItemFilled(formData.smartHome)) { setError(t.awErrSmart); return; }
      setFormData((c) => ({ ...c, smartHomeItems: [...c.smartHomeItems, c.smartHome], smartHome: { ...emptyItem, category: "" }, addSmartHome: false }));
    }
    setError("");
  };

  const saveRecurringIssue = () => {
    if (!formData.recurringIssue.title.trim() && !formData.recurringIssue.symptoms.trim()) {
      setError(t.awErrProblem);
      return;
    }
    setFormData((c) => ({
      ...c,
      recurringIssues: [...c.recurringIssues, c.recurringIssue],
      recurringIssue: { ...emptyIssue },
      addRecurringIssue: false,
    }));
    setError("");
  };

  const removeTechnicalItem = (section: "systems" | "appliances" | "smartHomeItems", index: number) => {
    setFormData((c) => ({ ...c, [section]: c[section].filter((_, i) => i !== index) }));
  };

  const removeRecurringIssue = (index: number) => {
    setFormData((c) => ({ ...c, recurringIssues: c.recurringIssues.filter((_, i) => i !== index) }));
  };

  const goToStep = (target: number) => { setError(""); setStep(target); };
  const nextStep = () => {
    if (step === 1 && !formData.name.trim()) { setError(t.awErrName); return; }
    if (step === 2 && !formData.address.trim()) { setError(t.awErrAddress); return; }
    setError("");
    setStep((c) => Math.min(c + 1, totalSteps));
  };
  const previousStep = () => { setError(""); setStep((c) => Math.max(c - 1, 0)); };
  const skipStep = () => { setError(""); setStep((c) => Math.min(c + 1, totalSteps)); };

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


  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate) { setError(t.awErrNameAddr); return; }

    const payload = new FormData();
    payload.set("name", formData.name.trim());
    if (formData.apartmentCode.trim()) payload.set("apartmentCode", formData.apartmentCode.trim());
    payload.set("address", formData.address.trim());
    payload.set("icalUrl", formData.icalUrl.trim());
    payload.set("latitude", "0");
    payload.set("longitude", "0");
    payload.set("squareMeters", String(formData.squareMeters || 30));
    payload.set("bedrooms", String(formData.bedrooms || 1));
    payload.set("bathrooms", String(formData.bathrooms || 1));
    payload.set("maxGuests", String(formData.maxGuests || 1));
    payload.set("technicalProfile.aiNotes", formData.aiNotes.trim());

    if (formData.accessType) payload.set("technicalProfile.guestAccess", formData.accessType);
    if (formData.accessCode.trim()) payload.set("accessInfo.doorCode", formData.accessCode.trim());
    if (formData.accessNotes.trim()) payload.set("accessInfo.checkInNotes", formData.accessNotes.trim());

    appendTechnicalItems(payload, "technicalProfile.systems", formData.systems);
    appendTechnicalItems(payload, "technicalProfile.appliances", formData.appliances);
    appendTechnicalItems(payload, "technicalProfile.smartHome", formData.smartHomeItems.map((item) => ({ ...item, type: item.category || item.type })));
    formData.recurringIssues.forEach((issue, index) => {
      payload.set(`technicalProfile.recurringIssues.${index}.title`, issue.title || "Problema ricorrente");
      payload.set(`technicalProfile.recurringIssues.${index}.category`, "OTHER");
      payload.set(`technicalProfile.recurringIssues.${index}.relatedItem`, "");
      payload.set(`technicalProfile.recurringIssues.${index}.symptoms`, issue.symptoms);
      payload.set(`technicalProfile.recurringIssues.${index}.solution`, issue.solution);
      payload.set(`technicalProfile.recurringIssues.${index}.whenToCall`, issue.whenToCall);
      payload.set(`technicalProfile.recurringIssues.${index}.notesForAI`, [issue.symptoms, issue.solution].filter(Boolean).join(" — "));
    });

    startTransition(() => {
      void action(payload).then((result) => {
        if (result?.success === false) setError(result.error || "Errore durante la creazione dell'appartamento.");
      });
    });
  };

  return (
    <form onSubmit={handleCreate} encType="multipart/form-data" className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl md:p-8">
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
        {step === 0 && <WizardIntro />}

        {step === 1 && (
          <WizardStep title={t.awStepName}>
            <input className={inputClass} value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Trastevere 68 Stylish Apartment" autoFocus />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.awShortCode}</label>
              <input className={inputClass} value={formData.apartmentCode} onChange={(e) => updateField("apartmentCode", e.target.value)} placeholder="Es. TRA68 — se vuoto viene generato automaticamente dal nome" />
              <p className="text-xs font-medium text-slate-400">{t.awShortCodeHint}</p>
            </div>
          </WizardStep>
        )}

        {step === 2 && (
          <WizardStep title={t.awStepAddress}>
            <input className={inputClass} value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Via della Scala 68, Roma" autoFocus />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.awIcalLabel}</label>
              <input className={inputClass} value={formData.icalUrl} onChange={(e) => updateField("icalUrl", e.target.value)} placeholder="webcal://..." />
              <p className="text-xs font-medium text-slate-400">{t.awIcalHint}</p>
            </div>
          </WizardStep>
        )}

        {step === 3 && (
          <WizardStep title={t.awStepGuests}>
            <div className="grid grid-cols-2 gap-4">
              <NumberField label={t.awGuests} value={formData.maxGuests} onChange={(v) => updateField("maxGuests", v)} />
              <NumberField label={t.awBedrooms} value={formData.bedrooms} onChange={(v) => updateField("bedrooms", v)} />
              <NumberField label={t.awBaths} value={formData.bathrooms} onChange={(v) => updateField("bathrooms", v)} />
              <NumberField label={t.awSqm} value={formData.squareMeters} onChange={(v) => updateField("squareMeters", v)} />
            </div>
          </WizardStep>
        )}

        {step === 4 && (
          <WizardStep title={t.awStepAccess}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ACCESS_TYPES.map((option) => (
                <button key={option} type="button" onClick={() => updateField("accessType", option)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-colors ${formData.accessType === option ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  {option}
                </button>
              ))}
            </div>
            {formData.accessType && formData.accessType !== "Da completare dopo" && (
              <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.awAccessCode}</label>
                  <input className={inputClass} value={formData.accessCode} onChange={(e) => updateField("accessCode", e.target.value)} placeholder="Es. 1234 o A-12B" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.awAccessInstructions}</label>
                  <textarea className={inputClass} rows={3} value={formData.accessNotes} onChange={(e) => updateField("accessNotes", e.target.value)} placeholder="Es. Cassetta chiavi al portone, codice 1234. Scala A, interno 3..." />
                </div>
              </div>
            )}
          </WizardStep>
        )}

        {step === 5 && (
          <MultiTechnicalItemStep
            title={t.awAddFirstSystem}
            listTitle={t.awSystemsAdded}
            addAnotherLabel={t.awAddAnotherSystem}
            saveLabel={t.awSaveSystem}
            enabled={formData.addSystem}
            onToggle={(v) => updateField("addSystem", v)}
            item={formData.system}
            onChange={(key, value) => updateItem("system", key, value)}
            items={formData.systems}
            onSave={() => saveTechnicalItem("systems")}
            onAddAnother={() => updateField("addSystem", true)}
            onRemove={(i) => removeTechnicalItem("systems", i)}
            onContinue={nextStep}
            typeOptions={SYSTEM_TYPES}
            helper
          />
        )}

        {step === 6 && (
          <MultiTechnicalItemStep
            title={t.awAddApplianceQ}
            listTitle={t.awAppliancesAdded}
            addAnotherLabel={t.awAddAnotherAppliance}
            saveLabel={t.awSaveAppliance}
            enabled={formData.addAppliance}
            onToggle={(v) => updateField("addAppliance", v)}
            item={formData.appliance}
            onChange={(key, value) => updateItem("appliance", key, value)}
            items={formData.appliances}
            onSave={() => saveTechnicalItem("appliances")}
            onAddAnother={() => updateField("addAppliance", true)}
            onRemove={(i) => removeTechnicalItem("appliances", i)}
            onContinue={nextStep}
            typeOptions={APPLIANCE_TYPES}
          />
        )}

        {step === 7 && (
          <WizardStep title={t.awStepSmart}>
            <AddedItemsList title={t.awSmartAdded} items={formData.smartHomeItems} onRemove={(i) => removeTechnicalItem("smartHomeItems", i)} />
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
                  <TextField label={t.awBrand} value={formData.smartHome.brand} onChange={(v) => updateItem("smartHome", "brand", v)} />
                  <TextField label={t.awModel} value={formData.smartHome.model} onChange={(v) => updateItem("smartHome", "model", v)} />
                  <TextField label={t.awLocation} value={formData.smartHome.location} onChange={(v) => updateItem("smartHome", "location", v)} />
                  <TextField label={t.awNotes} value={formData.smartHome.notes} onChange={(v) => updateItem("smartHome", "notes", v)} />
                </div>
                <button type="button" onClick={() => saveTechnicalItem("smartHomeItems")} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200">
                  {t.awSaveDevice}
                </button>
              </>
            )}
            {formData.smartHomeItems.length > 0 && !formData.addSmartHome && (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-bold text-slate-700">{t.awAddAnotherQ}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => updateField("addSmartHome", true)} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600">{t.awAddAnother}</button>
                  <button type="button" onClick={nextStep} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">{t.awContinue}</button>
                </div>
              </div>
            )}
          </WizardStep>
        )}

        {step === 8 && (
          <WizardStep title={t.awStepIssues}>
            {formData.recurringIssues.length > 0 && (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.awProblemsAdded}</p>
                <div className="space-y-2">
                  {formData.recurringIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                      <p className="truncate text-sm font-bold text-slate-700">{issue.title || issue.symptoms || "Problema"}</p>
                      <button type="button" onClick={() => removeRecurringIssue(index)} className="shrink-0 text-[10px] font-black uppercase tracking-widest text-rose-500">{t.awRemove}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => updateField("addRecurringIssue", true)}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${formData.addRecurringIssue ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-100 bg-white text-slate-600"}`}>
                {t.awAdd}
              </button>
              <button type="button" onClick={() => updateField("addRecurringIssue", false)}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${!formData.addRecurringIssue ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-100 bg-white text-slate-600"}`}>
                {t.awSkip}
              </button>
            </div>
            {formData.addRecurringIssue && (
              <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <TextField label={t.awProblemTitle} value={formData.recurringIssue.title} onChange={(v) => updateIssueField("title", v)} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.awSymptoms}</label>
                  <textarea className={inputClass} rows={2} value={formData.recurringIssue.symptoms} onChange={(e) => updateIssueField("symptoms", e.target.value)} placeholder="Es. Il climatizzatore mostra errore E5 dopo ore di funzionamento..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.awKnownSolution}</label>
                  <textarea className={inputClass} rows={2} value={formData.recurringIssue.solution} onChange={(e) => updateIssueField("solution", e.target.value)} placeholder="Es. Spegnere e attendere 30 minuti, poi riavviare..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.awWhenToCall}</label>
                  <input className={inputClass} value={formData.recurringIssue.whenToCall} onChange={(e) => updateIssueField("whenToCall", e.target.value)} placeholder="Es. Se il problema persiste dopo il riavvio" />
                </div>
                <button type="button" onClick={saveRecurringIssue} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200">
                  {t.awSaveProblem}
                </button>
              </div>
            )}
            {formData.recurringIssues.length > 0 && !formData.addRecurringIssue && (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-bold text-slate-700">{t.awAddAnotherQ}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => updateField("addRecurringIssue", true)} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600">{t.awAddAnother}</button>
                  <button type="button" onClick={nextStep} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">{t.awContinue}</button>
                </div>
              </div>
            )}
          </WizardStep>
        )}

        {step === 9 && (
          <WizardStep title={t.awStepAiNotes}>
            <p className="text-sm font-medium text-slate-500">
              {t.awAiHint}
            </p>
            <textarea
              className={inputClass}
              rows={6}
              value={formData.aiNotes}
              onChange={(e) => updateField("aiNotes", e.target.value)}
              placeholder={`Es.\n- L'appartamento si chiama "Trastevere" ma è tecnicamente in zona Prati\n- Il portone richiede doppia pressione del citofono\n- Contattare sempre Maria per le emergenze al piano`}
            />
            <p className="text-xs font-medium text-slate-400">{t.awAiSkipHint}</p>
          </WizardStep>
        )}

        {step === 10 && (
          <WizardSummary formData={formData} onGoTo={goToStep} />
        )}
      </div>

      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</p>}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={previousStep} disabled={step === 0 || isPending} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 disabled:opacity-40">
          {t.awBack}
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          {step > 0 && step < totalSteps && (
            <button type="button" onClick={skipStep} disabled={isPending || step === 1 || step === 2} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 disabled:opacity-40">
              {t.awSkip}
            </button>
          )}
          {step < totalSteps ? (
            <button type="button" onClick={nextStep} disabled={isPending} className="rounded-full bg-slate-900 px-7 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200">
              {step === 0 ? t.awStart : t.awNext}
            </button>
          ) : (
            <button type="submit" disabled={isPending || !canCreate} className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-7 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-violet-200 disabled:opacity-50">
              {isPending ? t.awCreating : t.awCreate}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function WizardIntro() {
  const { t } = useLang();
  return (
    <div className="flex min-h-[300px] flex-col justify-center space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-violet-50 text-3xl">🏠</div>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{t.awConfigTitle}</h2>
      <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {t.awConfigSub}
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

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const { t } = useLang();
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <input className={inputClass} type="number" min="0" value={value} onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} />
    </label>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { t } = useLang();
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const { t } = useLang();
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t.awSelect}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  );
}

function AddedItemsList({ title, items, onRemove }: { title: string; items: WizardTechnicalItem[]; onRemove: (i: number) => void }) {
  const { t } = useLang();
  if (items.length === 0) return null;
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
            <p className="truncate text-sm font-bold text-slate-700">{item.name || item.type || "Elemento"} {item.brand} {item.model} {item.location}</p>
            <button type="button" onClick={() => onRemove(index)} className="shrink-0 text-[10px] font-black uppercase tracking-widest text-rose-500">{t.awRemove}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiTechnicalItemStep({
  title, listTitle, addAnotherLabel, saveLabel, enabled, onToggle, item, onChange, items, onSave, onAddAnother, onRemove, onContinue, typeOptions, helper = false,
}: {
  title: string; listTitle: string; addAnotherLabel: string; saveLabel: string;
  enabled: boolean; onToggle: (v: boolean) => void;
  item: WizardTechnicalItem; onChange: (key: keyof SmartHomeItem, value: string) => void;
  items: WizardTechnicalItem[]; onSave: () => void; onAddAnother: () => void;
  onRemove: (i: number) => void; onContinue: () => void;
  typeOptions: string[]; helper?: boolean;
}) {
  const { t } = useLang();
  return (
    <WizardStep title={title}>
      <AddedItemsList title={listTitle} items={items} onRemove={onRemove} />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onToggle(true)} className={`rounded-2xl border px-4 py-3 text-sm font-bold ${enabled ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-100 bg-white text-slate-600"}`}>{t.awAdd}</button>
        <button type="button" onClick={() => onToggle(false)} className={`rounded-2xl border px-4 py-3 text-sm font-bold ${!enabled ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-100 bg-white text-slate-600"}`}>{t.awSkip}</button>
      </div>
      {enabled && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label={t.awName} value={item.name} onChange={(v) => onChange("name", v)} />
            <SelectField label={t.awType} value={item.type} onChange={(v) => onChange("type", v)} options={typeOptions} />
            <TextField label={t.awBrand} value={item.brand} onChange={(v) => onChange("brand", v)} />
            <TextField label={t.awModel} value={item.model} onChange={(v) => onChange("model", v)} />
            <TextField label={t.awLocation} value={item.location} onChange={(v) => onChange("location", v)} />
            <TextField label={t.awNotes} value={item.notes} onChange={(v) => onChange("notes", v)} />
          </div>
          {helper && (
            <div className="rounded-3xl border border-violet-100 bg-violet-50 px-5 py-4 text-sm font-medium text-violet-700">
              {t.awSmartHint}
            </div>
          )}
          <button type="button" onClick={onSave} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200">{saveLabel}</button>
        </>
      )}
      {items.length > 0 && !enabled && (
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-bold text-slate-700">{t.awAddAnotherQ}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onAddAnother} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600">{addAnotherLabel}</button>
            <button type="button" onClick={onContinue} className="rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">{t.awContinue}</button>
          </div>
        </div>
      )}
    </WizardStep>
  );
}


function WizardSummary({ formData, onGoTo }: { formData: WizardData; onGoTo: (step: number) => void }) {
  const { t } = useLang();
  const rows: [string, string, number][] = [
    ["Nome", formData.name || "Mancante", 1],
    ["Codice", formData.apartmentCode || "Auto-generato dal nome", 1],
    ["Indirizzo", formData.address || "Mancante", 2],
    ["Calendario iCal", formData.icalUrl || "Non impostato", 2],
    ["Ospiti", String(formData.maxGuests), 3],
    ["Camere", String(formData.bedrooms), 3],
    ["Bagni", String(formData.bathrooms), 3],
    ["Metri quadri", String(formData.squareMeters), 3],
    ["Accesso", [formData.accessType, formData.accessCode].filter(Boolean).join(" — ") || "Da completare dopo", 4],
    ["Impianti", formData.systems.length > 0 ? `${formData.systems.length} aggiunti` : "Nessuno", 5],
    ["Elettrodomestici", formData.appliances.length > 0 ? `${formData.appliances.length} aggiunti` : "Nessuno", 6],
    ["Domotica", formData.smartHomeItems.length > 0 ? `${formData.smartHomeItems.length} aggiunti` : "Nessuna", 7],
    ["Problemi ricorrenti", formData.recurringIssues.length > 0 ? `${formData.recurringIssues.length} aggiunti` : "Nessuno", 8],
    ["Note AI", formData.aiNotes || "Nessuna", 9],
  ];

  return (
    <WizardStep title={t.awStepSummary}>
      <div className="space-y-2">
        {rows.map(([label, value, targetStep]) => (
          <button key={label} type="button" onClick={() => onGoTo(targetStep)}
            className="flex w-full items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-left transition hover:bg-violet-50 hover:ring-1 hover:ring-violet-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <span className="max-w-[60%] text-right text-sm font-bold text-slate-800">{value}</span>
          </button>
        ))}
      </div>
      <p className="text-xs font-medium text-slate-400 text-center">{t.awClickRow}</p>
    </WizardStep>
  );
}
