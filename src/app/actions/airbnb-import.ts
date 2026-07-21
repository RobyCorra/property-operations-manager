"use server";

import { getCurrentOrg } from "@/src/lib/tenant";
import { checkAndConsumePerplexity } from "@/src/lib/ai-limits";

/** Valori accettati dal wizard per il tipo di accesso. */
const ACCESS_MAP: Record<string, string> = {
  self_checkin: "Self check-in",
  keys: "Con chiavi",
  concierge: "Concierge / persona sul posto",
};

/** Elettrodomestici riconosciuti dal wizard (gli altri diventano "Altro"). */
const APPLIANCE_TYPES = [
  "Frigorifero", "Congelatore", "Lavatrice", "Lavastoviglie", "Asciugatrice",
  "Forno", "Microonde", "Piano cottura", "Cappa", "Televisore",
  "Ferro da stiro", "Aspirapolvere",
];

export type AirbnbImportItem = { name: string; type: string };
export type AirbnbImportResult = {
  name: string;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  accessType: string;
  appliances: AirbnbImportItem[];
  smartHome: AirbnbImportItem[];
};

export type AirbnbImportSuccess = { ok: true; data: AirbnbImportResult; found: string[]; missing: string[] };
export type ExtractResponse = AirbnbImportSuccess | { ok: false; error: string };

function normalizeAppliance(raw: string): string {
  const match = APPLIANCE_TYPES.find((t) => t.toLowerCase() === raw.trim().toLowerCase());
  return match ?? "Altro";
}

/** Estrae il JSON anche se il modello lo avvolge in ```json ... ``` o testo. */
function parseJsonLoose(content: string): Record<string, unknown> | null {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function toPositiveIntOrNull(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Legge un annuncio Airbnb tramite Perplexity (browsing reale) e restituisce
 * i campi che il wizard di onboarding sa pre-compilare. Indirizzo esatto e
 * metri quadri non sono estraibili: restano manuali.
 */
export async function extractAirbnbListing(url: string): Promise<ExtractResponse> {
  const trimmed = (url || "").trim();
  if (!/airbnb\.[a-z.]+\/.+/i.test(trimmed)) {
    return { ok: false, error: "Inserisci un URL di un annuncio Airbnb valido." };
  }
  if (!process.env.PERPLEXITY_API_KEY) {
    return { ok: false, error: "Ricerca web non configurata. Inserisci i dati manualmente." };
  }

  const orgId = await getCurrentOrg();
  if (orgId) {
    const gate = await checkAndConsumePerplexity(orgId);
    if (!gate.allowed) return { ok: false, error: gate.reason || "Limite ricerche web raggiunto." };
  }

  const prompt = `Analizza questo annuncio Airbnb: ${trimmed}

Restituisci SOLO un oggetto JSON, senza testo prima o dopo, con questa forma esatta:
{
  "name": "titolo dell'annuncio",
  "maxGuests": numero massimo ospiti o null,
  "bedrooms": numero camere da letto o null,
  "bathrooms": numero bagni o null,
  "accessType": "self_checkin" | "keys" | "concierge" | "unknown",
  "appliances": ["Lavatrice", "Asciugatrice", ...],
  "smartHome": ["Serratura smart", "Termostato smart", ...]
}

Regole:
- "appliances": elettrodomestici citati tra i servizi o nella descrizione.
- "smartHome": solo dispositivi smart/domotici realmente menzionati; array vuoto se nessuno.
- Usa null per i numeri che non trovi. Non inventare dati.`;

  let content = "";
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.PERPLEXITY_MODEL || "sonar-pro",
        messages: [
          { role: "system", content: "Sei un estrattore di dati. Rispondi esclusivamente con JSON valido." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error("Perplexity import error:", response.status, body);
      if (response.status === 401 || response.status === 403) {
        return { ok: false, error: "Chiave Perplexity non valida o assente nell'ambiente. Contatta l'amministratore." };
      }
      return { ok: false, error: `La ricerca web ha risposto con errore ${response.status}. Inserisci i dati manualmente.` };
    }
    const data = await response.json();
    content = data?.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Perplexity import fetch failed:", error);
    return { ok: false, error: "Errore di connessione alla ricerca web. Inserisci i dati manualmente." };
  }

  const parsed = parseJsonLoose(content);
  if (!parsed) {
    return { ok: false, error: "Non sono riuscito a leggere l'annuncio. Inserisci i dati manualmente." };
  }

  const appliances = Array.isArray(parsed.appliances)
    ? (parsed.appliances as unknown[])
        .map((a) => String(a).trim())
        .filter(Boolean)
        .map((label) => ({ name: label, type: normalizeAppliance(label) }))
    : [];

  const smartHome = Array.isArray(parsed.smartHome)
    ? (parsed.smartHome as unknown[])
        .map((a) => String(a).trim())
        .filter(Boolean)
        .map((label) => ({ name: label, type: "Altro" }))
    : [];

  const accessKey = String(parsed.accessType ?? "unknown");
  const result: AirbnbImportResult = {
    name: typeof parsed.name === "string" ? parsed.name.trim() : "",
    maxGuests: toPositiveIntOrNull(parsed.maxGuests),
    bedrooms: toPositiveIntOrNull(parsed.bedrooms),
    bathrooms: toPositiveIntOrNull(parsed.bathrooms),
    accessType: ACCESS_MAP[accessKey] ?? "",
    appliances,
    smartHome,
  };

  // Se non è stato estratto nulla di utile, è più onesto segnalarlo che
  // mostrare un wizard vuoto che sembra "non funzionante".
  const gotSomething =
    result.name || result.maxGuests || result.bedrooms || result.bathrooms ||
    result.accessType || result.appliances.length || result.smartHome.length;
  if (!gotSomething) {
    return { ok: false, error: "Non ho trovato dati leggibili in questo annuncio. Controlla l'URL o inserisci i dati manualmente." };
  }

  const found: string[] = [];
  const missing: string[] = [];
  (result.name ? found : missing).push("Nome");
  (result.maxGuests ? found : missing).push("Ospiti");
  (result.bedrooms ? found : missing).push("Camere");
  (result.bathrooms ? found : missing).push("Bagni");
  (result.accessType ? found : missing).push("Accesso");
  if (result.appliances.length) found.push(`Elettrodomestici (${result.appliances.length})`);
  if (result.smartHome.length) found.push(`Dispositivi smart (${result.smartHome.length})`);
  missing.push("Indirizzo", "Metri quadri");

  return { ok: true, data: result, found, missing };
}
