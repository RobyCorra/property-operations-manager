"use client";

import Link from "next/link";
import { useState } from "react";
import type { Apartment } from "@prisma/client";
import {
  createApartmentAttachment,
  deleteApartmentAttachment,
  updateApartmentAttachment,
} from "@/src/app/actions/apartment";

type TechnicalProduct = {
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  purchaseDate: string;
  warrantyUntil: string;
  maintenanceNotes: string;
  recurringIssues: string;
  manualUrl: string;
  notesForAI: string;
};

type TechnicalProfile = {
  building?: {
    floor?: string;
    hasElevator?: boolean;
    accessNotes?: string;
  };
  systems?: {
    heatingType?: string;
    coolingType?: string;
    hotWaterType?: string;
    electricalPanelLocation?: string;
    waterShutoffLocation?: string;
    gasShutoffLocation?: string;
    wifiRouterLocation?: string;
  };
  appliances?: Record<string, boolean | undefined>;
  smartHome?: Record<string, boolean | undefined>;
  recurringIssues?: Record<string, boolean | undefined>;
  products?: Partial<TechnicalProduct>[];
  aiNotes?: string;
};

type ApartmentAttachmentFormData = {
  id: string;
  apartmentId: string;
  filename: string;
  url: string | null;
  mimeType: string | null;
  size: number | null;
  category: string;
  extractedText: string | null;
  notes: string | null;
};

interface ApartmentFormProps {
  initialData?: Apartment & { apartmentAttachments?: ApartmentAttachmentFormData[] };
  action: (formData: FormData) => Promise<void>;
  title: string;
}

const inputClass = "w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent";

const checkboxClass = "h-4 w-4 rounded border-gray-300 text-black focus:ring-black";

const emptyProduct: TechnicalProduct = {
  name: "",
  category: "",
  brand: "",
  model: "",
  serialNumber: "",
  location: "",
  purchaseDate: "",
  warrantyUntil: "",
  maintenanceNotes: "",
  recurringIssues: "",
  manualUrl: "",
  notesForAI: "",
};

const productFields: { key: keyof TechnicalProduct; label: string; type?: string; multiline?: boolean }[] = [
  { key: "name", label: "Nome" },
  { key: "category", label: "Categoria" },
  { key: "brand", label: "Marca" },
  { key: "model", label: "Modello" },
  { key: "serialNumber", label: "Numero seriale" },
  { key: "location", label: "Posizione" },
  { key: "purchaseDate", label: "Data acquisto", type: "date" },
  { key: "warrantyUntil", label: "Garanzia fino a", type: "date" },
  { key: "maintenanceNotes", label: "Note manutenzione", multiline: true },
  { key: "recurringIssues", label: "Problemi ricorrenti", multiline: true },
  { key: "manualUrl", label: "Link manuale", type: "url" },
  { key: "notesForAI", label: "Note per IA", multiline: true },
];

const attachmentCategories = [
  "MANUAL",
  "WARRANTY",
  "PHOTO",
  "TECHNICAL_SHEET",
  "INSTALLER_INSTRUCTIONS",
  "OTHER",
];

function CheckboxField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className={checkboxClass} />
      {label}
    </label>
  );
}

export default function ApartmentForm({ initialData, action, title }: ApartmentFormProps) {
  const technicalProfile = (initialData?.technicalProfile as TechnicalProfile | null) ?? {};
  const [products, setProducts] = useState<TechnicalProduct[]>(
    Array.isArray(technicalProfile.products)
      ? technicalProfile.products.map((product) => ({ ...emptyProduct, ...product }))
      : []
  );

  function updateProduct(index: number, key: keyof TechnicalProduct, value: string) {
    setProducts((currentProducts) => currentProducts.map((product, productIndex) => (
      productIndex === index ? { ...product, [key]: value } : product
    )));
  }

  function addProduct() {
    setProducts((currentProducts) => [...currentProducts, { ...emptyProduct }]);
  }

  function removeProduct(index: number) {
    setProducts((currentProducts) => currentProducts.filter((_, productIndex) => productIndex !== index));
  }

  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
      <form action={action} className="space-y-6">
        {initialData && <input type="hidden" name="id" value={initialData.id} />}
        
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Informazioni Base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Proprietà *</label>
              <input 
                required 
                type="text" 
                id="name" 
                name="name" 
                defaultValue={initialData?.name}
                placeholder="Es. Domus Colosseo" 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Fisico *</label>
              <input 
                required 
                type="text" 
                id="address" 
                name="address" 
                defaultValue={initialData?.address}
                placeholder="Via Roma 10, Roma" 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Geolocalizzazione</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitudine *</label>
              <input 
                required 
                type="number" 
                step="any" 
                id="latitude" 
                name="latitude" 
                defaultValue={initialData?.latitude}
                placeholder="Es. 41.8902" 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitudine *</label>
              <input 
                required 
                type="number" 
                step="any" 
                id="longitude" 
                name="longitude" 
                defaultValue={initialData?.longitude}
                placeholder="Es. 12.4922" 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Caratteristiche</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="squareMeters" className="block text-sm font-medium text-gray-700 mb-1">Superficie (m²)</label>
              <input 
                required 
                type="number" 
                min="0" 
                id="squareMeters" 
                name="squareMeters" 
                defaultValue={initialData?.squareMeters ?? 50} 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Stanze</label>
              <input 
                required 
                type="number" 
                min="0" 
                id="bedrooms" 
                name="bedrooms" 
                defaultValue={initialData?.bedrooms ?? 1} 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">Bagni</label>
              <input 
                required 
                type="number" 
                min="0" 
                id="bathrooms" 
                name="bathrooms" 
                defaultValue={initialData?.bathrooms ?? 1} 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
            <div>
              <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-1">Ospiti Max</label>
              <input 
                required 
                type="number" 
                min="1" 
                id="maxGuests" 
                name="maxGuests" 
                defaultValue={initialData?.maxGuests ?? 2} 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Accesso</h2>
          <div>
            <label htmlFor="accessInstructions" className="block text-sm font-medium text-gray-700 mb-1">Istruzioni di Accesso</label>
            <textarea 
              id="accessInstructions" 
              name="accessInstructions" 
              defaultValue={initialData?.accessInstructions ?? ""}
              placeholder="Es. Codice tastierino, posizione chiavi, note per il citofono..." 
              rows={3}
              className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
            />
            <p className="text-xs text-gray-400 mt-1">Queste istruzioni saranno visibili al personale di pulizia e manutenzione.</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Scheda Tecnica Appartamento</h2>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-800">Dati edificio/accesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="technicalProfile.building.floor" className="block text-sm font-medium text-gray-700 mb-1">Piano</label>
                <input
                  type="text"
                  id="technicalProfile.building.floor"
                  name="technicalProfile.building.floor"
                  defaultValue={technicalProfile.building?.floor ?? ""}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end">
                <CheckboxField
                  name="technicalProfile.building.hasElevator"
                  label="Ascensore presente"
                  defaultChecked={technicalProfile.building?.hasElevator}
                />
              </div>
            </div>
            <div>
              <label htmlFor="technicalProfile.building.accessNotes" className="block text-sm font-medium text-gray-700 mb-1">Note accesso edificio</label>
              <textarea
                id="technicalProfile.building.accessNotes"
                name="technicalProfile.building.accessNotes"
                defaultValue={technicalProfile.building?.accessNotes ?? ""}
                rows={2}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-800">Impianti</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["technicalProfile.systems.heatingType", "Tipo riscaldamento", technicalProfile.systems?.heatingType],
                ["technicalProfile.systems.coolingType", "Tipo raffrescamento", technicalProfile.systems?.coolingType],
                ["technicalProfile.systems.hotWaterType", "Tipo acqua calda", technicalProfile.systems?.hotWaterType],
                ["technicalProfile.systems.electricalPanelLocation", "Posizione quadro elettrico", technicalProfile.systems?.electricalPanelLocation],
                ["technicalProfile.systems.waterShutoffLocation", "Posizione chiusura acqua", technicalProfile.systems?.waterShutoffLocation],
                ["technicalProfile.systems.gasShutoffLocation", "Posizione chiusura gas", technicalProfile.systems?.gasShutoffLocation],
                ["technicalProfile.systems.wifiRouterLocation", "Posizione router Wi-Fi", technicalProfile.systems?.wifiRouterLocation],
              ].map(([name, label, value]) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" id={name} name={name} defaultValue={value ?? ""} className={inputClass} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-800">Elettrodomestici</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <CheckboxField name="technicalProfile.appliances.washingMachine" label="Lavatrice" defaultChecked={technicalProfile.appliances?.washingMachine} />
              <CheckboxField name="technicalProfile.appliances.dishwasher" label="Lavastoviglie" defaultChecked={technicalProfile.appliances?.dishwasher} />
              <CheckboxField name="technicalProfile.appliances.oven" label="Forno" defaultChecked={technicalProfile.appliances?.oven} />
              <CheckboxField name="technicalProfile.appliances.microwave" label="Microonde" defaultChecked={technicalProfile.appliances?.microwave} />
              <CheckboxField name="technicalProfile.appliances.fridge" label="Frigorifero" defaultChecked={technicalProfile.appliances?.fridge} />
              <CheckboxField name="technicalProfile.appliances.coffeeMachine" label="Macchina caffe" defaultChecked={technicalProfile.appliances?.coffeeMachine} />
              <CheckboxField name="technicalProfile.appliances.stove" label="Piano cottura" defaultChecked={technicalProfile.appliances?.stove} />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-800">Domotica</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <CheckboxField name="technicalProfile.smartHome.smartLock" label="Serratura smart" defaultChecked={technicalProfile.smartHome?.smartLock} />
              <CheckboxField name="technicalProfile.smartHome.smartThermostat" label="Termostato smart" defaultChecked={technicalProfile.smartHome?.smartThermostat} />
              <CheckboxField name="technicalProfile.smartHome.doorSensors" label="Sensori porte" defaultChecked={technicalProfile.smartHome?.doorSensors} />
              <CheckboxField name="technicalProfile.smartHome.windowSensors" label="Sensori finestre" defaultChecked={technicalProfile.smartHome?.windowSensors} />
              <CheckboxField name="technicalProfile.smartHome.energySensors" label="Sensori energia" defaultChecked={technicalProfile.smartHome?.energySensors} />
              <CheckboxField name="technicalProfile.smartHome.leakSensors" label="Sensori perdite" defaultChecked={technicalProfile.smartHome?.leakSensors} />
              <CheckboxField name="technicalProfile.smartHome.noiseSensor" label="Sensore rumore" defaultChecked={technicalProfile.smartHome?.noiseSensor} />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-800">Problemi ricorrenti</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <CheckboxField name="technicalProfile.recurringIssues.slowDrains" label="Scarichi lenti" defaultChecked={technicalProfile.recurringIssues?.slowDrains} />
              <CheckboxField name="technicalProfile.recurringIssues.badSmells" label="Cattivi odori" defaultChecked={technicalProfile.recurringIssues?.badSmells} />
              <CheckboxField name="technicalProfile.recurringIssues.hotWaterIssues" label="Problemi acqua calda" defaultChecked={technicalProfile.recurringIssues?.hotWaterIssues} />
              <CheckboxField name="technicalProfile.recurringIssues.acIssues" label="Problemi aria condizionata" defaultChecked={technicalProfile.recurringIssues?.acIssues} />
              <CheckboxField name="technicalProfile.recurringIssues.electricalIssues" label="Problemi elettrici" defaultChecked={technicalProfile.recurringIssues?.electricalIssues} />
              <CheckboxField name="technicalProfile.recurringIssues.humidityMold" label="Umidita/muffa" defaultChecked={technicalProfile.recurringIssues?.humidityMold} />
              <CheckboxField name="technicalProfile.recurringIssues.lockIssues" label="Problemi serratura" defaultChecked={technicalProfile.recurringIssues?.lockIssues} />
              <CheckboxField name="technicalProfile.recurringIssues.wifiIssues" label="Problemi Wi-Fi" defaultChecked={technicalProfile.recurringIssues?.wifiIssues} />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Prodotti presenti</h3>
              <button
                type="button"
                onClick={addProduct}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Aggiungi prodotto
              </button>
            </div>

            {products.length === 0 ? (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">Nessun prodotto inserito.</p>
            ) : (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div key={index} className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-800">Prodotto {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        Rimuovi
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productFields.map((field) => (
                        <div key={field.key} className={field.multiline ? "md:col-span-2" : ""}>
                          <label htmlFor={`technicalProfile.products.${index}.${field.key}`} className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                          </label>
                          {field.multiline ? (
                            <textarea
                              id={`technicalProfile.products.${index}.${field.key}`}
                              name={`technicalProfile.products.${index}.${field.key}`}
                              value={product[field.key]}
                              rows={2}
                              onChange={(event) => updateProduct(index, field.key, event.target.value)}
                              className={inputClass}
                            />
                          ) : (
                            <input
                              type={field.type ?? "text"}
                              id={`technicalProfile.products.${index}.${field.key}`}
                              name={`technicalProfile.products.${index}.${field.key}`}
                              value={product[field.key]}
                              onChange={(event) => updateProduct(index, field.key, event.target.value)}
                              className={inputClass}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-800">Note per IA</h3>
            <textarea
              id="technicalProfile.aiNotes"
              name="technicalProfile.aiNotes"
              defaultValue={technicalProfile.aiNotes ?? ""}
              rows={4}
              placeholder="Note operative utili per cleaner, manutentori e manager..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Sincronizzazione iCal</h2>
          <div>
            <label htmlFor="icalUrl" className="block text-sm font-medium text-gray-700 mb-1">Airbnb iCal URL</label>
            <input 
              type="url" 
              id="icalUrl" 
              name="icalUrl" 
              defaultValue={initialData?.icalUrl ?? ""}
              placeholder="https://www.airbnb.com/calendar/ical/..." 
              className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
            />
            <p className="text-xs text-gray-400 mt-1">Incolla qui l'URL iCal di Airbnb per sincronizzare automaticamente le prenotazioni.</p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 mt-8">
          <Link href="/dashboard/manager/apartments" className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Annulla
          </Link>
          <button type="submit" className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900">
            {initialData ? "Aggiorna Proprietà" : "Salva Proprietà"}
          </button>
        </div>
        
      </form>

      {initialData?.id && (
        <div className="mt-8 space-y-4 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Allegati tecnici</h2>

          <form action={createApartmentAttachment} className="space-y-4 rounded-xl border border-gray-100 p-4">
            <input type="hidden" name="apartmentId" value={initialData.id} />
            <h3 className="text-sm font-semibold text-gray-800">Aggiungi allegato</h3>
            <AttachmentFields />
            <div className="flex justify-end">
              <button type="submit" className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Aggiungi allegato
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {(initialData.apartmentAttachments ?? []).length === 0 ? (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">Nessun allegato tecnico inserito.</p>
            ) : (
              initialData.apartmentAttachments?.map((attachment) => (
                <form key={attachment.id} action={updateApartmentAttachment} className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <input type="hidden" name="id" value={attachment.id} />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">{attachment.filename}</h3>
                    <button
                      type="submit"
                      formAction={deleteApartmentAttachment}
                      className="self-start rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Elimina allegato
                    </button>
                  </div>
                  <AttachmentFields attachment={attachment} />
                  <div className="flex justify-end">
                    <button type="submit" className="rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-white">
                      Aggiorna allegato
                    </button>
                  </div>
                </form>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function AttachmentFields({ attachment }: { attachment?: ApartmentAttachmentFormData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor={attachment ? `filename-${attachment.id}` : "filename-new"} className="block text-sm font-medium text-gray-700 mb-1">Nome file *</label>
        <input
          required
          type="text"
          id={attachment ? `filename-${attachment.id}` : "filename-new"}
          name="filename"
          defaultValue={attachment?.filename ?? ""}
          placeholder="manuale_hisense.pdf"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={attachment ? `category-${attachment.id}` : "category-new"} className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select
          id={attachment ? `category-${attachment.id}` : "category-new"}
          name="category"
          defaultValue={attachment?.category ?? "OTHER"}
          className={inputClass}
        >
          {attachmentCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={attachment ? `url-${attachment.id}` : "url-new"} className="block text-sm font-medium text-gray-700 mb-1">URL</label>
        <input
          type="url"
          id={attachment ? `url-${attachment.id}` : "url-new"}
          name="url"
          defaultValue={attachment?.url ?? ""}
          placeholder="https://..."
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={attachment ? `mimeType-${attachment.id}` : "mimeType-new"} className="block text-sm font-medium text-gray-700 mb-1">MIME type</label>
        <input
          type="text"
          id={attachment ? `mimeType-${attachment.id}` : "mimeType-new"}
          name="mimeType"
          defaultValue={attachment?.mimeType ?? ""}
          placeholder="application/pdf"
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label htmlFor={attachment ? `notes-${attachment.id}` : "notes-new"} className="block text-sm font-medium text-gray-700 mb-1">Note allegato</label>
        <textarea
          id={attachment ? `notes-${attachment.id}` : "notes-new"}
          name="notes"
          defaultValue={attachment?.notes ?? ""}
          rows={2}
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label htmlFor={attachment ? `extractedText-${attachment.id}` : "extractedText-new"} className="block text-sm font-medium text-gray-700 mb-1">Testo estratto/manuale</label>
        <textarea
          id={attachment ? `extractedText-${attachment.id}` : "extractedText-new"}
          name="extractedText"
          defaultValue={attachment?.extractedText ?? ""}
          rows={3}
          className={inputClass}
        />
      </div>
    </div>
  );
}
