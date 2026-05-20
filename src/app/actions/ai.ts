
"use server";

import OpenAI from "openai";
import { prisma } from "@/src/lib/prisma";
import { formatDateKey, getApartmentOperationalStatus } from "@/src/lib/apartment-status";

type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

type AIContext = {
  role: "CLEANER" | "MAINTENANCE" | "MANAGER";
  type: string;
  apartmentId?: string | null;
  cleaningTaskId?: string | null;
  maintenanceTicketId?: string | null;
};

type ApartmentChecklistItemForAI = {
  order: number;
  label: string;
  required: boolean;
  type: string;
  formula: string | null;
};

type ApartmentBookingForAI = {
  apartmentId?: string;
  guestName: string | null;
  totalGuests: number;
  checkInDate: Date;
  checkOutDate: Date;
  status: string | null;
  source: string | null;
  externalId?: string | null;
  apartment?: {
    name: string;
  };
};

type ApartmentBookingWithApartmentForAI = ApartmentBookingForAI & {
  apartment: {
    name: string;
  };
};

type OperationalAttachmentForAI = {
  fileName: string;
  fileType: string | null;
  url: string;
  size?: number | null;
  category?: string | null;
  extractedText?: string | null;
  createdAt: Date;
};

type OperationalMessageForAI = {
  createdAt: Date;
  role: string;
  senderName: string;
  text: string | null;
  attachment?: OperationalAttachmentForAI | null;
};

type AIAssistantMessageForAI = {
  createdAt: Date;
  role: "USER" | "ASSISTANT";
  userRole: string;
  content: string;
};

type AssignedUserForAI = {
  name: string;
  role: string;
  email?: string;
} | null;

type CleaningTaskForAI = {
  id: string;
  apartmentId: string;
  date: Date;
  status: string;
  createdAt: Date;
  assignedTo: AssignedUserForAI;
  booking: {
    guestName: string | null;
    totalGuests: number;
    checkInDate: Date;
    checkOutDate: Date;
    source?: string | null;
    status?: string | null;
  } | null;
  notes: string | null;
  checklistProgress: unknown;
  messages: OperationalMessageForAI[];
  attachments: OperationalAttachmentForAI[];
  aiAssistantMessages?: AIAssistantMessageForAI[];
  apartment?: {
    id?: string;
    name: string;
    address?: string;
  };
};

type CleaningTaskWithAIMessagesForAI = CleaningTaskForAI & {
  aiAssistantMessages: AIAssistantMessageForAI[];
};

type CleaningTaskWithApartmentForAI = CleaningTaskForAI & {
  apartment: {
    id?: string;
    name: string;
    address?: string;
  };
};

type MaintenanceTicketForAI = {
  id: string;
  apartmentId: string;
  createdAt: Date;
  status: string;
  priority: string;
  title: string;
  description: string;
  assignedTo: AssignedUserForAI;
  scheduledStart: Date | null;
  scheduledEnd?: Date | null;
  startedAt?: Date | null;
  resolvedAt: Date | null;
  messages: OperationalMessageForAI[];
  attachments: OperationalAttachmentForAI[];
  aiAssistantMessages?: AIAssistantMessageForAI[];
  apartment?: {
    id?: string;
    name: string;
    address?: string;
  };
};

type MaintenanceTicketWithAIMessagesForAI = MaintenanceTicketForAI & {
  aiAssistantMessages: AIAssistantMessageForAI[];
};

type MaintenanceTicketWithApartmentForAI = MaintenanceTicketForAI & {
  apartment: {
    id?: string;
    name: string;
    address?: string;
  };
};

type ApartmentAttachmentForAI = {
  filename: string;
  url: string | null;
  mimeType: string | null;
  size: number | null;
  category: string;
  linkedTo: string | null;
  notes: string | null;
  extractedText: string | null;
  createdAt: Date;
};

type ManagerApartmentForAI = {
  id: string;
  name: string;
  address: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  technicalProfile: unknown;
  apartmentAttachments: ApartmentAttachmentForAI[];
};


type AIIntent =
  | "PULIZIE"
  | "MANUTENZIONE"
  | "PRENOTAZIONI"
  | "SCHEDA_TECNICA"
  | "ALLEGATI"
  | "GENERALE";

function classifyIntent(query: string): AIIntent {
  const q = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  if (/pulizia|pulizie|pulito|pulita|cleaner|pulitrice|checklist pulizia|spazzare|lavare|aspirare|detergente|disinfettare|riassettare|rassettare/.test(q)) {
    return "PULIZIE";
  }

  if (/ticket|manutenzione|guasto|rotto|rotta|rompere|riparazione|tecnico|tecnica|intervento|urgente|urgenza|segnalazione|perdita|perdite|infiltrazione|allagamento|corto circuito|blackout|blackout/.test(q)) {
    return "MANUTENZIONE";
  }

  if (/prenotazione|prenotazioni|check.in|check.out|ospite|ospiti|booking|arrivo|arrivi|partenza|partenze|disponibilit|calendario|agenda|soggiorno|notte|notti|airbnb|ical|evento|eventi/.test(q)) {
    return "PRENOTAZIONI";
  }

  if (/impianto|impianti|elettrodomestic|caldaia|condizionator|climatizzazion|domotica|quadro|contatore|gas|acqua calda|boiler|lavatrice|lavastoviglie|frigo|frigorifero|forno|microonde|router|wifi|wi-fi|citofono|videocitofono|serratura|termostato/.test(q)) {
    return "SCHEDA_TECNICA";
  }

  if (/allegato|allegati|documento|documenti|manuale|manuali|pdf|file|foto|immagine|fattura|contratto|certificato|libretto|garanzia|scheda tecnica/.test(q)) {
    return "ALLEGATI";
  }

  return "GENERALE";
}

const SYSTEM_PROMPTS: Record<AIIntent, string> = {
  PULIZIE: `
Sei un assistente specializzato nella gestione delle pulizie di appartamenti turistici.
Il tuo unico dominio sono le pulizie: stato task, checklist, assegnazioni, note, messaggi del personale.

REGOLA CRITICA — STATO vs ASSEGNAZIONE (non confonderli mai):
- "stato" indica la fase operativa: PENDING = pianificata (non ancora iniziata), IN_PROGRESS = in corso, COMPLETED = completata, AWAITING_REVIEW = in verifica, APPROVED = approvata.
  PENDING NON significa "non assegnata". Una pulizia PENDING può avere un cleaner assegnato.
- "assegnato" indica chi eseguirà la pulizia. Se il campo mostra "assegnato: non assegnato" → la pulizia è da assegnare. Se mostra un nome → è già assegnata.
- "da assegnare" = assegnato: non assegnato. NON guardare lo stato per determinare se una pulizia è assegnata.
- Esempio: "stato: PENDING | assegnato: Mario Rossi" → pianificata MA già assegnata a Mario Rossi.

Regole operative che DEVI rispettare:
- Non resettare checklistProgress se l'utente ha già fatto spunte
- Preserva sempre le spunte già completate
- Non creare pulizie duplicate per lo stesso appartamento e stessa data
- Le prenotazioni iCal/Airbnb sono read-only per le pulizie operative

Rispondi:
- Citando direttamente lo stato della pulizia, la data e il cleaner assegnato
- Segnalando se una pulizia è in ritardo rispetto al check-in
- Suggerendo di aprire ticket se trovi danni durante la pulizia
- Massimo 5 punti pratici, niente teoria
`.trim(),

  MANUTENZIONE: `
Sei un assistente specializzato nella gestione delle manutenzioni e dei ticket di intervento.
Il tuo unico dominio sono i ticket: stato, priorità, assegnazioni, messaggi tecnici, storico interventi.

Regole operative che DEVI rispettare:
- Ticket urgente OPEN o IN_PROGRESS blocca la disponibilità dell'appartamento
- Ticket futuro non urgente NON blocca la disponibilità
- Il bottone "Avvia intervento" cambia stato da OPEN a IN_PROGRESS senza rompere chat o allegati
- Segnala "Possibile problema ricorrente" se il problema attuale è simile allo storico

Rispondi:
- Citando titolo, stato e priorità del ticket rilevante
- Segnalando se ci sono ticket urgenti aperti
- Suggerendo assegnazione tecnico se mancante
- Massimo 5 punti pratici, niente teoria
`.trim(),

  PRENOTAZIONI: `
Sei un assistente specializzato nelle prenotazioni e nel calendario operativo di appartamenti turistici.
Il tuo dominio: prenotazioni, check-in, check-out, pulizie, ticket di manutenzione, disponibilità.

REGOLA FONDAMENTALE — "Che eventi ci sono oggi/domani?":
Il contesto contiene sezioni pre-computate:
  - "════ EVENTI OGGI (GG/MM/AAAA) ════" — usala per domande su OGGI
  - "════ EVENTI DOMANI (GG/MM/AAAA) ════" — usala per domande su DOMANI
Quando l'utente chiede "che eventi ci sono", "cosa ho oggi/domani", "agenda di oggi/domani":
  1. Identifica la data richiesta (oggi o domani)
  2. Leggi ESATTAMENTE dalla sezione corrispondente: CHECK-IN, CHECK-OUT, PULIZIE, TICKET PROGRAMMATI
  3. NON cercare o dedurre date da altre sezioni (PROSSIMI 7 GIORNI, SOGGIORNI IN CORSO, ecc.)
  4. Se non ci sono eventi di un tipo nella sezione, scrivi "Nessun check-in domani" ecc.
  5. NON rispondere "non ci sono eventi" senza aver letto entrambe le sottosezioni CHECK-IN e CHECK-OUT della sezione giusta.

Regole operative che DEVI rispettare:
- "domani" = data di oggi + 1 giorno. Usa la data nel contesto ("Oggi:" o "Data corrente:").
- Scorri TUTTO il contesto prima di rispondere. Se un check-in/out è presente nel contesto, citalo sempre.
- Le prenotazioni manuali sono la fonte operativa principale
- Le prenotazioni importate da iCal/Airbnb sono read-only
- Segnala conflitti di date se presenti nel contesto

Rispondi:
- Con date precise (check-in, check-out, numero ospiti)
- Segnalando check-in/check-out imminenti (oggi o nei prossimi 7 giorni)
- Indicando la fonte della prenotazione (manuale, Airbnb, iCal)
- Massimo 5 punti pratici, niente teoria
`.trim(),

  SCHEDA_TECNICA: `
Sei un assistente specializzato nella conoscenza tecnica degli appartamenti: impianti, elettrodomestici, domotica, problemi ricorrenti.
Il tuo unico dominio è la scheda tecnica: sistemi, apparecchi, posizioni, procedure, soluzioni note.

Rispondi:
- Citando nome, marca, modello e posizione dell'elemento tecnico richiesto
- Riportando la soluzione nota se presente nella sezione "Problemi ricorrenti"
- Indicando quando chiamare un tecnico se specificato nella scheda
- Se esiste un allegato (manuale, libretto) mostralo con link cliccabile Markdown: [Scarica il documento](url)
- Massimo 5 punti pratici, niente teoria
`.trim(),

  ALLEGATI: `
Sei un assistente specializzato nel recupero di documenti e allegati degli appartamenti.
Il tuo unico dominio sono gli allegati: manuali, PDF, foto, certificati, documenti tecnici.

Regole sui link che DEVI rispettare:
- Usa SEMPRE il valore "linkApribile" esatto dal contesto, non modificarlo mai
- Rendi ogni link cliccabile in Markdown: [Scarica il documento](linkApribile)
- Se il contesto include "markdownLink", copialo esattamente nella risposta
- Non inventare domini o URL
- Documenti in /uploads/ sono interni alla scheda appartamento

Rispondi:
- Elencando tutti gli allegati rilevanti con nome file e categoria
- Includendo sempre il link cliccabile per ogni documento
- Specificando se il testo è stato estratto o se il documento va aperto
- Massimo 5 punti pratici, niente teoria
`.trim(),

  GENERALE: `
Sei un assistente operativo per la gestione di appartamenti turistici a Roma.
Puoi rispondere su appartamenti, prenotazioni, pulizie, manutenzioni, calendario e stato operativo.
Quando nel contesto è presente la sezione "RICERCA WEB AGGIORNATA DA PERPLEXITY", puoi rispondere anche a domande esterne (eventi, meteo, ristoranti, notizie, normative, ecc.) usando quei dati.

REGOLA CRITICA — PULIZIE: stato ≠ assegnazione:
- "da assegnare" = campo "assegnato: non assegnato". NON guardare lo stato (PENDING/IN_PROGRESS ecc.).
- PENDING significa pianificata-non-iniziata, NON significa non assegnata.
- Una pulizia può essere PENDING e già assegnata a un cleaner.

Regole operative che DEVI rispettare:
- Appartamento NON pronto: pulizia pending/in_progress prima del check-in O ticket urgente OPEN/IN_PROGRESS
- Prenotazione futura non pronta = BLU
- Pulizia completata e nessun ticket urgente = VERDE
- Dopo le 15:00 del check-in = ROSSO (occupato)
- Ticket urgente immediato o scaduto blocca l'appartamento

Rispondi:
- Dando priorità a rischi operativi imminenti (oggi e prossimi 7 giorni)
- Segnalando appartamenti non pronti con motivazione
- Suggerendo le prossime azioni concrete
- Massimo 5 punti pratici, niente teoria
`.trim(),
};

// ── Suffisso ACTION aggiunto ai system prompt quando il ruolo è MANAGER ──────
const AI_ACTION_SUFFIX = `

CAPACITÀ DI AZIONE (solo per manager):
Puoi creare nuove prenotazioni, modificare/cancellare prenotazioni/pulizie/ticket esistenti.
Quando l'utente chiede di creare o modificare qualcosa, rispondi normalmente E aggiungi in fondo alla risposta un blocco ACTION su UNA RIGA SOLA.

════ COME LEGGERE L'ID DAL CONTESTO ════
Ogni riga di pulizia o ticket nel contesto inizia con "id:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX".
Esempio riga ticket: "- id:3fa85f64-5717-4562-b3fc-2c963f66afa6 | 18/05/2026 | HIGH | OPEN | Perdita rubinetto | ..."
Devi copiare ESATTAMENTE quel valore UUID nel campo "id" dell'ACTION. MAI inventarlo o abbreviarlo.

════ ESEMPI ACTION ════

ACTION: {"type":"CREATE_BOOKING","apartmentName":"Trastevere 68","checkInDate":"2026-06-29T00:00:00.000Z","checkOutDate":"2026-06-30T00:00:00.000Z","totalGuests":4,"guestName":"Mario Rossi","description":"Creo prenotazione 29-30 giugno per 4 persone"}

ACTION: {"type":"CREATE_CLEANING","apartmentName":"Trastevere 68","date":"2026-06-15T00:00:00.000Z","assignedToName":"Mario Rossi","notes":"Pulizia straordinaria","description":"Aggiungo pulizia il 15 giugno assegnata a Mario Rossi"}

ACTION: {"type":"CREATE_TICKET","apartmentName":"Trastevere 68","title":"Perdita rubinetto bagno","ticketDescription":"Il rubinetto del bagno perde acqua","priority":"HIGH","scheduledStart":"2026-06-15T09:00:00.000Z","assignedToName":"Luigi Tecnico","description":"Apro ticket manutenzione per perdita rubinetto"}

ACTION: {"type":"UPDATE_BOOKING","apartmentName":"Trastevere 68","checkInDate":"2026-05-20T14:00:00.000Z","fields":{"totalGuests":4},"description":"Aggiorno la prenotazione del 20 maggio a 4 ospiti"}

ACTION: {"type":"UPDATE_CLEANING","id":"3fa85f64-5717-4562-b3fc-2c963f66afa6","fields":{"date":"2026-05-20T10:00:00.000Z","assignedToName":"Mario Rossi"},"description":"Sposto la pulizia al 20 maggio e la assegno a Mario Rossi"}

ACTION: {"type":"UPDATE_TICKET","id":"3fa85f64-5717-4562-b3fc-2c963f66afa6","fields":{"scheduledStart":"2026-05-19T09:30:00+02:00"},"description":"Sposto il ticket a domani 19 maggio alle 9:30 ora di Roma"}

ACTION: {"type":"UPDATE_TICKET","id":"3fa85f64-5717-4562-b3fc-2c963f66afa6","fields":{"status":"CANCELLED"},"description":"Cancello il ticket di manutenzione"}

ACTION: {"type":"BULK_ASSIGN_CLEANINGS_BY_FILTER","apartmentIds":["<apartmentId1>","<apartmentId2>"],"dateFrom":"2026-05-01","dateTo":"2026-05-31","assignedToId":"<userId>","description":"Assegno tutte le pulizie di maggio di Trastevere 156 e 68 a Mario"}

ACTION: {"type":"PURGE_CANCELLED","description":"Elimino dal database tutte le prenotazioni e pulizie con stato CANCELLED"}

════ REGOLE OBBLIGATORIE ════
ID:
- Per UPDATE_CLEANING e UPDATE_TICKET: copia l'UUID ESATTO dalla riga "id:..." nel contesto. Non inventarlo mai.
- Se non trovi l'id nel contesto, chiedi all'utente di specificarlo.

DATE E ORARI:
- Usa il formato ISO 8601 CON offset fuso orario di Roma: estate (marzo–ottobre) +02:00, inverno (novembre–febbraio) +01:00.
- Esempio corretto: "2026-05-19T09:30:00+02:00" = ore 9:30 ora di Roma in estate. NON usare il suffisso Z (UTC) per orari locali.
- "domani" = data di oggi + 1 giorno. Usa la data indicata nel contesto ("Oggi:" o "Data corrente:").
- Non esistono restrizioni sulle date. Non inventare limiti tipo "deve essere futura" o "minimo 24 ore".

CAMPI:
- Nei fields di UPDATE_* includi SOLO i campi che l'utente vuole cambiare. Ometti tutto il resto.
- NON cambiare mai il campo "status" di un ticket o pulizia a meno che l'utente non lo chieda esplicitamente con parole come "cancella", "riapri", "chiudi", "cambia stato".
- UPDATE_TICKET supporta: title, description, priority, scheduledStart, notes, status (solo se richiesto), assignedToName (nome del tecnico dalla sezione PERSONALE DISPONIBILE).
- UPDATE_CLEANING supporta: date, notes, assignedToName.
- Per cancellare un ticket usa UPDATE_TICKET con fields: {"status": "CANCELLED"}.
- Per prenotazioni iCal/Airbnb (source != "MANUAL") puoi modificare SOLO totalGuests e notes.

NOMI:
- apartmentName: nome esatto dell'appartamento (es. "Trastevere 68").
- assignedToName: nome dalla sezione PERSONALE DISPONIBILE, non l'id.

COMPORTAMENTO:
- NON scrivere "ho creato/modificato/cancellato" — l'ACTION è una PROPOSTA che richiede conferma. Usa "Propongo di...".
- Non aggiungere ACTION se l'utente chiede solo informazioni.
- Il blocco ACTION deve stare su UNA RIGA SOLA alla fine della risposta.

ACCESSO APPARTAMENTO — REGOLA ASSOLUTA:
- I dati di accesso (password Wi-Fi, codice porta, codice cassetta chiavi, codice portone/citofono, piano, orari check-in/out, parcheggio) si trovano in DUE formati nel contesto:
  a) Sezione dedicata "ACCESSO APPARTAMENTO" (contesto appartamento specifico)
  b) Campo inline "accesso: ..." per ogni appartamento nel contesto generale (es. "accesso: Password Wi-Fi: abc123 | Codice cassetta chiavi: 1971")
- Cerca in ENTRAMBI i formati prima di rispondere. Se trovi il dato in uno qualsiasi dei due, usalo.
- Non inventare dati non presenti nel contesto.

REGOLA FONDAMENTALE — PRIMA DI RISPONDERE "NON CI SONO DATI":
- Scorri TUTTO il contesto disponibile, incluse tutte le sezioni e tutti i campi inline di ogni appartamento.
- Se hai il minimo dubbio, cita il dato trovato specificando dove l'hai trovato (es. "Nel campo accesso di Trastevere 156 trovo: ...").
- Rispondi "non ci sono dati" SOLO dopo aver verificato ogni sezione del contesto e non aver trovato nulla.

FORMATO ACTION — REGOLA ASSOLUTA:
- L'ACTION va scritta ESATTAMENTE così: ACTION: {…}  su una riga sola, senza nulla prima o dopo.
- NON usare mai blocchi markdown (backtick, \`\`\`json, \`\`\`, o qualsiasi altro wrapper).
- NON mettere il JSON in un blocco di codice.
- SBAGLIATO: \`\`\`json\\n{"type":...}\\n\`\`\`
- CORRETTO:   ACTION: {"type":...}
- Se usi i backtick, il sistema non riconosce l'azione e il bottone di conferma non appare.
`;

const HISTORY_DAYS = 90;
const MAX_HISTORY_TEXT_LENGTH = 5000;
const MAX_TECHNICAL_KNOWLEDGE_TEXT_LENGTH = 5000;
const MAX_MANAGER_CONTEXT_TEXT_LENGTH = 28000;
const MAX_APARTMENT_AI_CONTEXT_TEXT_LENGTH = 45000;
const MAX_SECTION_TEXT_LENGTH = 5000;

function isInternalOperationalQuestion(question: string) {
  const q = question.toLowerCase();

  // Termini sempre interni
  if (
    q.includes("manuale") ||
    q.includes("documento") ||
    q.includes("allegato") ||
    q.includes("scheda tecnica") ||
    q.includes("impianto") ||
    q.includes("climatizzazione") ||
    q.includes("condizionatore") ||
    q.includes("elettrodomestico") ||
    q.includes("appartamento") ||
    q.includes("trastevere") ||
    // operativi calendario
    q.includes("check-in") ||
    q.includes("check in") ||
    q.includes("checkin") ||
    q.includes("check-out") ||
    q.includes("check out") ||
    q.includes("checkout") ||
    q.includes("arrivo") ||
    q.includes("arrivi") ||
    q.includes("partenza") ||
    q.includes("partenze") ||
    q.includes("prenotazione") ||
    q.includes("prenotazioni") ||
    q.includes("pulizia") ||
    q.includes("pulizie") ||
    q.includes("ticket") ||
    q.includes("manutenzione") ||
    q.includes("calendario") ||
    q.includes("agenda") ||
    q.includes("occupato") ||
    q.includes("libero") ||
    q.includes("disponibile")
  ) return true;

  // "eventi" o "evento" senza nome di città esplicito = calendario operativo interno
  if (q.includes("eventi") || q.includes("evento")) {
    const cityPattern = /\b(roma|milano|napoli|torino|firenze|venezia|bologna|genova|palermo|bari|in città|in centro|nel quartiere|della città|vicino|esterno|fuori)\b/;
    if (!cityPattern.test(q)) return true;
  }

  return false;
}

function shouldUseWebSearch(question: string) {
  if (isInternalOperationalQuestion(question)) {
    return false;
  }

  const q = question.toLowerCase();
  const webSearchTriggers = [
    // trigger espliciti
    "cerca online",
    "cerca sul web",
    "cerca su internet",
    "fai una ricerca",
    "ricerca aggiornata",
    "aggiornato",
    "aggiornata",
    "ultime notizie",
    "normativa",
    "prezzo attuale",
    "prodotto",
    "software",
    "mercato",
    "comparazione",
    "preventivi",
    "recensioni",
    "alternative",
    "competitor",
    "best practice aggiornate",
    // domande su eventi / attività esterne
    "eventi",
    "cosa fare",
    "cosa succede",
    "cosa c'è",
    "cosa si fa",
    "in programma",
    "concerti",
    "mostre",
    "ristorante",
    "ristoranti",
    "meteo",
    "previsioni",
    "temperatura",
    "trasporti",
    "sciopero",
    "musei",
    "aperture",
    // "cerca X" generico — una sola parola "cerca" seguita da qualsiasi cosa
    // Lo gestiamo con regex separata sotto
  ];

  if (webSearchTriggers.some((trigger) => q.includes(trigger))) return true;

  // "cerca ..." generico: la parola "cerca" da sola come verbo (non "ricercatore", ecc.)
  if (/\bcerca\b/.test(q)) return true;

  return false;
}

function stringArrayFromUnknown(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function sourceUrlsFromUnknown(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object" && "url" in item) {
        const url = (item as { url?: unknown }).url;
        return typeof url === "string" ? url : "";
      }

      return "";
    })
    .map((url) => url.trim())
    .filter((url) => url.startsWith("http"));
}

function collectPerplexitySources(response: unknown) {
  if (!response || typeof response !== "object") {
    return [];
  }

  const root = response as {
    citations?: unknown;
    search_results?: unknown;
    choices?: {
      citations?: unknown;
      message?: {
        citations?: unknown;
      } | null;
    }[] | null;
  };
  const choice = root.choices?.[0];
  const urls = [
    ...stringArrayFromUnknown(root.citations),
    ...sourceUrlsFromUnknown(root.citations),
    ...stringArrayFromUnknown(choice?.citations),
    ...sourceUrlsFromUnknown(choice?.citations),
    ...stringArrayFromUnknown(choice?.message?.citations),
    ...sourceUrlsFromUnknown(choice?.message?.citations),
    ...sourceUrlsFromUnknown(root.search_results),
  ];

  return Array.from(new Set(urls)).slice(0, 8);
}

function formatLinksAsMarkdown(text: string) {
  if (!text) return text;

  const urlRegex = /(https?:\/\/[^\s)]+)/g;

  return text.replace(urlRegex, (url) => {
    const cleanUrl = url.replace(/[.,;:!?]+$/, "");
    const trailing = url.slice(cleanUrl.length);
    const label = /(?:youtube\.com|youtu\.be)/i.test(cleanUrl)
      ? "🎥 [Guarda video]"
      : "[Apri link]";

    return `${label}(${cleanUrl})${trailing}`;
  });
}

async function askPerplexitySearch(query: string) {
  if (!process.env.PERPLEXITY_API_KEY) {
    return null;
  }

  try {
    const perplexity = new OpenAI({
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseURL: "https://api.perplexity.ai",
    });

    const response = await perplexity.chat.completions.create({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: "Rispondi in italiano. Cerca informazioni aggiornate, operative e verificabili. Includi fonti quando disponibili.",
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      return null;
    }

    const sources = collectPerplexitySources(response);
    const sourcesText = sources.length > 0
      ? `\n\nFonti/citations:\n${sources.map((url) => `- ${url}`).join("\n")}`
      : "";

    return `${content}${sourcesText}`;
  } catch (error) {
    console.error("[PERPLEXITY ERROR] Ricerca web non disponibile, continuo senza Perplexity.", error);
    return null;
  }
}

/**
 * Chiavi di accesso appartamento che vengono già presentate con label italiane
 * nella sezione ACCESSO APPARTAMENTO tramite formatAccessInfo.
 * Vanno escluse dal JSON grezzo del technicalProfile per evitare che la AI
 * veda "safeCode" / "buildingCode" ecc. e li chiami con nomi inglesi.
 */
const TECH_PROFILE_ACCESS_KEYS = new Set([
  "doorCode", "safeCode", "buildingCode", "floor",
  "wifiNetwork", "wifiPassword", "directions", "checkInNotes", "parking",
]);

/** Restituisce technicalProfile senza i campi di accesso (già gestiti da formatAccessInfo). */
function stripAccessKeysFromTechProfile(technicalProfile: unknown): unknown {
  if (!technicalProfile || typeof technicalProfile !== "object" || Array.isArray(technicalProfile)) {
    return technicalProfile;
  }
  return Object.fromEntries(
    Object.entries(technicalProfile as Record<string, unknown>).filter(([k]) => !TECH_PROFILE_ACCESS_KEYS.has(k))
  );
}

function compactTechnicalProfile(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(compactTechnicalProfile).filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compactTechnicalProfile(item)] as const)
      .filter(([, item]) => item !== undefined);

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

function formatTechnicalProfile(technicalProfile: unknown) {
  const compactProfile = compactTechnicalProfile(technicalProfile);

  if (!compactProfile) {
    return "Nessuna scheda tecnica disponibile.";
  }

  // Rimuovi i campi di accesso dal JSON grezzo: sono già presentati con label italiane
  // nella sezione ACCESSO APPARTAMENTO tramite formatAccessInfo — tenerli qui con chiavi
  // inglesi ("safeCode", "buildingCode" …) confonde la AI.
  const filtered = stripAccessKeysFromTechProfile(compactProfile);

  const profileText = JSON.stringify(filtered, null, 2);

  if (profileText.length <= 4000) {
    return profileText;
  }

  return `${profileText.slice(0, 4000)}\n...scheda tecnica abbreviata per lunghezza.`;
}

function formatDate(value: Date) {
  // Usa timezone Europe/Rome per mostrare la data operativa corretta
  return value.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit" });
}

/**
 * Formatta il campo accessInfo dell'appartamento con label italiane esplicite.
 * Fonte autorevole: i campi strutturati di accessInfo (scheda appartamento).
 * accessInstructions è testo libero legacy — incluso solo se accessInfo è vuoto,
 * per evitare che dati obsoleti nel testo libero confliggano con quelli strutturati.
 */
/**
 * Cerca un campo di accesso prima in accessInfo, poi come fallback in technicalProfile
 * (alcuni dati vecchi potrebbero essere stati salvati lì per errore).
 */
function accessField(key: string, accessInfo: Record<string, unknown>, technicalProfile: unknown): unknown {
  if (accessInfo[key]) return accessInfo[key];
  if (technicalProfile && typeof technicalProfile === "object" && !Array.isArray(technicalProfile)) {
    return (technicalProfile as Record<string, unknown>)[key] || null;
  }
  return null;
}

function formatAccessInfo(accessInfo: unknown, accessInstructions?: string | null, technicalProfile?: unknown): string {
  const lines: string[] = [];

  const a: Record<string, unknown> =
    accessInfo && typeof accessInfo === "object" && !Array.isArray(accessInfo)
      ? (accessInfo as Record<string, unknown>)
      : {};

  const f = (key: string) => accessField(key, a, technicalProfile);

  const doorCode     = f("doorCode");
  const safeCode     = f("safeCode");
  const buildingCode = f("buildingCode");
  const floor        = f("floor");
  const wifiNetwork  = f("wifiNetwork");
  const wifiPassword = f("wifiPassword");
  const directions   = f("directions");
  const checkInNotes = f("checkInNotes");
  const parking      = f("parking");

  if (doorCode)     lines.push(`- Codice porta / smart lock: ${doorCode}`);
  if (safeCode)     lines.push(`- Codice cassetta chiavi: ${safeCode}`);
  if (buildingCode) lines.push(`- Codice portone / citofono: ${buildingCode}`);
  if (floor)        lines.push(`- Piano / interno: ${floor}`);
  if (wifiNetwork)  lines.push(`- Rete Wi-Fi (nome rete): ${wifiNetwork}`);
  if (wifiPassword) lines.push(`- Password Wi-Fi: ${wifiPassword}`);
  if (directions)   lines.push(`- Come raggiungere l'appartamento: ${directions}`);
  if (checkInNotes) lines.push(`- Note check-in / check-out (orari): ${checkInNotes}`);
  if (parking)      lines.push(`- Parcheggio: ${parking}`);

  // accessInstructions (testo libero legacy) incluso SOLO se non ci sono campi strutturati
  if (lines.length === 0 && accessInstructions) {
    lines.push(`- Istruzioni accesso: ${truncateText(accessInstructions, 400)}`);
  }

  return lines.length > 0 ? lines.join("\n") : "- Nessuna informazione di accesso registrata.";
}

/**
 * Restituisce un tag testuale che indica la situazione della prenotazione rispetto ad oggi.
 * Usato nelle righe di contesto per aiutare l'AI a distinguere check-in, soggiorni in corso e check-out.
 */
function bookingTag(checkInDate: Date, checkOutDate: Date, now: Date = new Date()): string {
  const todayKey = formatDate(now);
  const inKey    = formatDate(checkInDate);
  const outKey   = formatDate(checkOutDate);
  if (inKey === todayKey) return "[CHECK-IN OGGI]";
  if (outKey === todayKey) return "[CHECK-OUT OGGI]";
  if (checkInDate < now && checkOutDate > now) return "[SOGGIORNO IN CORSO]";
  if (checkInDate > now) return "[FUTURO]";
  return "[PASSATO]";
}

function truncateText(value: string | null | undefined, maxLength = 180) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}...`;
}

function formatOperationalHistory({
  maintenanceTickets,
  cleaningTasks,
  aiAssistantMessages,
}: {
  maintenanceTickets: {
    createdAt: Date;
    status: string;
    priority: string;
    title: string;
    description: string;
  }[];
  cleaningTasks: {
    date: Date;
    status: string;
    notes: string | null;
  }[];
  aiAssistantMessages: {
    createdAt: Date;
    role: "USER" | "ASSISTANT";
    content: string;
  }[];
}) {
  const maintenanceLines = maintenanceTickets.map((ticket) => {
    const description = truncateText(ticket.description);
    const details = description ? `${ticket.title} - ${description}` : ticket.title;

    return `- ${formatDate(ticket.createdAt)} | ${ticket.status} | ${ticket.priority} | ${truncateText(details, 240)}`;
  });

  const cleaningLines = cleaningTasks.map((task) => {
    const notes = truncateText(task.notes);

    return `- ${formatDate(task.date)} | ${task.status}${notes ? ` | ${notes}` : ""}`;
  });

  const messageLines = aiAssistantMessages.map((message) => (
    `- ${formatDate(message.createdAt)} | ${message.role} | ${truncateText(message.content)}`
  ));

  const historyText = `
STORICO OPERATIVO APPARTAMENTO:
Periodo: ultimi ${HISTORY_DAYS} giorni

Manutenzioni recenti:
${maintenanceLines.length > 0 ? maintenanceLines.join("\n") : "- Nessuna manutenzione recente."}

Pulizie recenti:
${cleaningLines.length > 0 ? cleaningLines.join("\n") : "- Nessuna pulizia recente."}

Conversazioni IA recenti:
${messageLines.length > 0 ? messageLines.join("\n") : "- Nessuna conversazione IA recente."}
`.trim();

  if (historyText.length <= MAX_HISTORY_TEXT_LENGTH) {
    return historyText;
  }

  return `${historyText.slice(0, MAX_HISTORY_TEXT_LENGTH)}\n...storico operativo abbreviato per lunghezza.`;
}

function arraySection(technicalProfile: unknown, key: string) {
  if (!technicalProfile || typeof technicalProfile !== "object" || Array.isArray(technicalProfile)) {
    return [];
  }

  const section = (technicalProfile as Record<string, unknown>)[key];

  return Array.isArray(section)
    ? section.filter((item) => item && typeof item === "object" && !Array.isArray(item)) as Record<string, unknown>[]
    : [];
}

function stringField(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatInternalFileUrl(url: string | null | undefined) {
  if (!url) return "n/d";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const uploadsIndex = url.indexOf("/uploads/");

  if (uploadsIndex >= 0) {
    const uploadsPath = url.slice(uploadsIndex);
    return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${uploadsPath}`;
  }

  return url;
}

function formatInternalMarkdownLink(linkApribile: string) {
  return linkApribile === "n/d"
    ? "n/d"
    : `[Scarica il documento](${linkApribile})`;
}

function formatAttachmentLines(attachments: unknown, maxExtractedText = 300) {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .filter((attachment) => attachment && typeof attachment === "object" && !Array.isArray(attachment))
    .map((attachment) => {
      const item = attachment as Record<string, unknown>;
      const linkApribile = formatInternalFileUrl(stringField(item.url));
      return `allegato: ${stringField(item.filename) || "n/d"} | Documento interno caricato nella scheda appartamento | category: ${stringField(item.category) || "n/d"} | collegato a: ${stringField(item.linkedTo) || "n/d"} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | notes: ${truncateText(stringField(item.notes), 180) || "n/d"} | extractedText: ${truncateText(stringField(item.extractedText), maxExtractedText) || "n/d"}`;
    });
}

function formatTechnicalSection(title: string, items: Record<string, unknown>[]) {
  const lines = items.map((item) => {
    const parts = [
      `nome: ${stringField(item.name) || "n/d"}`,
      `tipo: ${stringField(item.type) || "n/d"}`,
      `marca: ${stringField(item.brand) || "n/d"}`,
      `modello: ${stringField(item.model) || "n/d"}`,
      `posizione: ${stringField(item.location) || "n/d"}`,
      `note: ${truncateText(stringField(item.notes), 220) || "n/d"}`,
      `problemi ricorrenti: ${truncateText(stringField(item.recurringIssues), 220) || "n/d"}`,
      ...formatAttachmentLines(item.attachments),
    ];

    return `- ${parts.join(" | ")}`;
  });

  return `${title}\n${lines.length > 0 ? lines.join("\n") : "- Nessun elemento registrato."}`;
}

function formatRecurringIssuesSection(items: Record<string, unknown>[]) {
  const lines = items.map((item) => {
    const parts = [
      `titolo: ${stringField(item.title) || "n/d"}`,
      `categoria: ${stringField(item.category) || "n/d"}`,
      `elemento collegato: ${stringField(item.relatedItem) || "n/d"}`,
      `sintomi: ${truncateText(stringField(item.symptoms), 220) || "n/d"}`,
      `soluzione: ${truncateText(stringField(item.solution), 220) || "n/d"}`,
      `quando chiamare tecnico: ${truncateText(stringField(item.whenToCall), 180) || "n/d"}`,
      `note IA: ${truncateText(stringField(item.notesForAI), 220) || "n/d"}`,
      ...formatAttachmentLines(item.attachments),
    ];

    return `- ${parts.join(" | ")}`;
  });

  return `SEZIONE PROBLEMI RICORRENTI\n${lines.length > 0 ? lines.join("\n") : "- Nessun problema ricorrente registrato."}`;
}

function formatGeneralAttachmentsSection({
  technicalProfile,
  apartmentAttachments,
}: {
  technicalProfile: unknown;
  apartmentAttachments: {
    filename: string;
    url: string | null;
    category: string;
    linkedTo: string | null;
    notes: string | null;
    extractedText: string | null;
  }[];
}) {
  const generalAttachmentLines = formatAttachmentLines(arraySection(technicalProfile, "generalAttachments"), 400).map((line) => `- ${line}`);
  const persistedAttachmentLines = apartmentAttachments.map((attachment) => {
    const linkApribile = formatInternalFileUrl(attachment.url);
    return `- allegato tecnico: ${attachment.filename} | Documento interno caricato nella scheda appartamento | category: ${attachment.category} | collegato a: ${attachment.linkedTo || "n/d"} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | notes: ${truncateText(attachment.notes, 180) || "n/d"} | extractedText: ${truncateText(attachment.extractedText, 400) || "n/d"}`;
  });

  return `SEZIONE ALLEGATI GENERALI\n${[...generalAttachmentLines, ...persistedAttachmentLines].length > 0 ? [...generalAttachmentLines, ...persistedAttachmentLines].join("\n") : "- Nessun allegato generale registrato."}`;
}

function formatStructuredTechnicalKnowledge({
  technicalProfile,
  apartmentAttachments,
}: {
  technicalProfile: unknown;
  apartmentAttachments: {
    filename: string;
    url: string | null;
    category: string;
    linkedTo: string | null;
    notes: string | null;
    extractedText: string | null;
  }[];
}) {
  const detailsText = [
    formatTechnicalSection("SEZIONE IMPIANTI", arraySection(technicalProfile, "systems")),
    formatTechnicalSection("SEZIONE ELETTRODOMESTICI", arraySection(technicalProfile, "appliances")),
    formatTechnicalSection("SEZIONE DOMOTICA", arraySection(technicalProfile, "smartHome")),
    formatRecurringIssuesSection(arraySection(technicalProfile, "recurringIssues")),
    formatGeneralAttachmentsSection({ technicalProfile, apartmentAttachments }),
  ].join("\n\n");

  if (detailsText.length <= MAX_TECHNICAL_KNOWLEDGE_TEXT_LENGTH) {
    return detailsText;
  }

  return `${detailsText.slice(0, MAX_TECHNICAL_KNOWLEDGE_TEXT_LENGTH)}\n...scheda tecnica strutturata abbreviata per lunghezza.`;
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "n/d";
  // Usa timezone Europe/Rome per mostrare data e ora operativa corretta
  return value.toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

function compactJsonText(value: unknown, maxLength = 600) {
  const compactValue = compactTechnicalProfile(value);

  if (!compactValue) {
    return "n/d";
  }

  return truncateText(JSON.stringify(compactValue), maxLength);
}

function formatLegacyProductsSection(technicalProfile: unknown) {
  const products = arraySection(technicalProfile, "products");

  if (products.length === 0) {
    return "- Prodotti legacy: nessun prodotto registrato.";
  }

  return products
    .map((product) => {
      const parts = [
        `nome: ${stringField(product.name) || "n/d"}`,
        `tipo: ${stringField(product.type) || "n/d"}`,
        `marca: ${stringField(product.brand) || "n/d"}`,
        `modello: ${stringField(product.model) || "n/d"}`,
        `posizione: ${stringField(product.location) || "n/d"}`,
        `note: ${truncateText(stringField(product.notes), 160) || "n/d"}`,
      ];

      return `- prodotto: ${parts.join(" | ")}`;
    })
    .join("\n");
}

function formatManagerMessages(
  messages: {
    createdAt: Date;
    role: string;
    senderName: string;
    text: string | null;
  }[]
) {
  if (messages.length === 0) {
    return "nessun messaggio";
  }

  return messages
    .slice(0, 10)
    .map((message) => (
      `${formatDateTime(message.createdAt)} ${message.senderName} (${message.role}): ${truncateText(message.text, 140) || "n/d"}`
    ))
    .join(" || ");
}

function formatOperationalAttachmentLines(
  attachments: {
    fileName: string;
    fileType: string | null;
    url: string;
    size?: number | null;
    category?: string | null;
    extractedText?: string | null;
    createdAt: Date;
  }[]
) {
  if (attachments.length === 0) {
    return "nessun allegato";
  }

  let extractedTextBudget = 8000;

  return attachments
    .map((attachment) => {
      const linkApribile = formatInternalFileUrl(attachment.url);
      const text = attachment.extractedText && extractedTextBudget > 0
        ? truncateText(attachment.extractedText, Math.min(2000, extractedTextBudget))
        : "";
      extractedTextBudget -= text.length;

      return `${attachment.fileName} | tipo: ${attachment.fileType || "n/d"} | categoria: ${attachment.category || "n/d"} | dimensione: ${attachment.size ?? "n/d"} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | data: ${formatDate(attachment.createdAt)} | testo estratto: ${text || "Allegato presente, testo non estratto o non leggibile direttamente."}`;
    })
    .join(" || ");
}

function limitText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n...contesto abbreviato per limiti di sicurezza.`;
}

function limitSection(value: string, maxLength = MAX_SECTION_TEXT_LENGTH) {
  return limitText(value, maxLength);
}

function formatNullable(value: unknown, maxLength = 300) {
  if (value instanceof Date) {
    return formatDateTime(value);
  }

  if (value === null || value === undefined || value === "") {
    return "n/d";
  }

  if (typeof value === "object") {
    return compactJsonText(value, maxLength);
  }

  return truncateText(String(value), maxLength) || "n/d";
}

function formatRecordFields(record: Record<string, unknown>, excludedKeys: string[] = []) {
  const excluded = new Set(excludedKeys);
  const lines = Object.entries(record)
    .filter(([key]) => !excluded.has(key))
    .map(([key, value]) => `- ${key}: ${formatNullable(value, 700)}`);

  return lines.length > 0 ? lines.join("\n") : "- Nessun dato disponibile.";
}

function formatApartmentDocumentLines(
  attachments: {
    filename: string;
    url: string | null;
    mimeType: string | null;
    size: number | null;
    category: string;
    notes: string | null;
    extractedText: string | null;
    createdAt: Date;
  }[]
) {
  if (attachments.length === 0) {
    return "- Nessun documento appartamento registrato.";
  }

  return attachments
    .map((attachment) => {
      const linkApribile = formatInternalFileUrl(attachment.url);
      const hasExtractedText = Boolean(attachment.extractedText?.trim());
      const extractedText = hasExtractedText
        ? truncateText(attachment.extractedText, 2000)
        : "Allegato presente, testo non estratto o non leggibile direttamente.";

      return [
        `- filename: ${attachment.filename}`,
        `category: ${attachment.category}`,
        `notes: ${truncateText(attachment.notes, 220) || "n/d"}`,
        `mimeType: ${attachment.mimeType || "n/d"}`,
        `createdAt: ${formatDateTime(attachment.createdAt)}`,
        `extractedText disponibile: ${hasExtractedText ? "si" : "no"}`,
        `linkApribile: ${linkApribile}`,
        `markdownLink: ${formatInternalMarkdownLink(linkApribile)}`,
        `extractedText: ${extractedText}`,
      ].join(" | ");
    })
    .join("\n");
}

function formatOperationalDocuments(
  attachments: {
    fileName: string;
    fileType: string | null;
    url: string;
    size?: number | null;
    category?: string | null;
    extractedText?: string | null;
    createdAt: Date;
  }[]
) {
  if (attachments.length === 0) {
    return "nessun allegato";
  }

  let extractedTextBudget = 8000;

  return attachments
    .map((attachment) => {
      const linkApribile = formatInternalFileUrl(attachment.url);
      const text = attachment.extractedText && extractedTextBudget > 0
        ? truncateText(attachment.extractedText, Math.min(2000, extractedTextBudget))
        : "";
      extractedTextBudget -= text.length;

      return `${attachment.fileName} | tipo: ${attachment.fileType || "n/d"} | categoria: ${attachment.category || "n/d"} | dimensione: ${attachment.size ?? "n/d"} | data: ${formatDate(attachment.createdAt)} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | testo estratto: ${text || "Allegato presente, testo non estratto o non leggibile direttamente"}`;
    })
    .join(" || ");
}

function formatAIMessages(
  messages: {
    createdAt: Date;
    role: "USER" | "ASSISTANT";
    userRole: string;
    content: string;
  }[]
) {
  if (messages.length === 0) {
    return "nessuna richiesta IA";
  }

  return messages
    .map((message) => (
      `${formatDateTime(message.createdAt)} ${message.role} (${message.userRole}): ${truncateText(message.content, 220) || "n/d"}`
    ))
    .join(" || ");
}

function attachmentArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) as Record<string, unknown>[]
    : [];
}

function technicalItemName(item: Record<string, unknown>, fallback: string) {
  return stringField(item.name) || stringField(item.title) || fallback;
}

function formatDetailedTechnicalAttachments(attachments: unknown) {
  const attachmentItems = attachmentArray(attachments);

  if (attachmentItems.length === 0) {
    return "   - nessun allegato";
  }

  return attachmentItems
    .map((attachment) => {
      const filename = stringField(attachment.filename) || "n/d";
      const url = stringField(attachment.url);
      const linkApribile = formatInternalFileUrl(url);
      const googleDriveLink = url.startsWith("http") ? url : "n/d";

      return [
        `   - Nome file: ${filename}`,
        `     Categoria: ${stringField(attachment.category) || "n/d"}`,
        `     Tipo file: ${stringField(attachment.mimeType) || "n/d"}`,
        `     Link: ${linkApribile}`,
        `     Markdown link: ${formatInternalMarkdownLink(linkApribile)}`,
        `     Link Google Drive: ${googleDriveLink}`,
        `     Note: ${truncateText(stringField(attachment.notes), 500) || "n/d"}`,
        `     Testo estratto: ${truncateText(stringField(attachment.extractedText), 1200) || "Allegato presente, testo non estratto o non leggibile direttamente."}`,
      ].join("\n");
    })
    .join("\n");
}

function formatDetailedTechnicalItems(title: string, items: Record<string, unknown>[]) {
  if (items.length === 0) {
    return `${title}\n- Nessun elemento registrato.`;
  }

  const lines = items.map((item, index) => (
    `${index + 1}. ${technicalItemName(item, `Elemento ${index + 1}`)}
   Tipo: ${stringField(item.type) || "n/d"}
   Marca: ${stringField(item.brand) || "n/d"}
   Modello: ${stringField(item.model) || "n/d"}
   Posizione: ${stringField(item.location) || "n/d"}
   Problemi ricorrenti: ${stringField(item.recurringIssues) || "n/d"}
   Note: ${stringField(item.notes) || "n/d"}
   Allegati:
${formatDetailedTechnicalAttachments(item.attachments)}`
  ));

  return `${title}\n${lines.join("\n\n")}`;
}

function formatDetailedProductsSection(items: Record<string, unknown>[]) {
  if (items.length === 0) {
    return "PRODOTTI PRESENTI IN CASA\n- Nessun prodotto registrato.";
  }

  const lines = items.map((item, index) => (
    `${index + 1}. ${technicalItemName(item, `Prodotto ${index + 1}`)}
   Tipo: ${stringField(item.type) || "n/d"}
   Categoria: ${stringField(item.category) || "n/d"}
   Marca: ${stringField(item.brand) || "n/d"}
   Modello: ${stringField(item.model) || "n/d"}
   Posizione: ${stringField(item.location) || "n/d"}
   Note: ${stringField(item.notes) || "n/d"}
   Allegati:
${formatDetailedTechnicalAttachments(item.attachments)}`
  ));

  return `PRODOTTI PRESENTI IN CASA\n${lines.join("\n\n")}`;
}

function formatDetailedRecurringIssues(items: Record<string, unknown>[]) {
  if (items.length === 0) {
    return "PROBLEMI RICORRENTI\n- Nessun problema ricorrente registrato.";
  }

  const lines = items.map((item, index) => (
    `${index + 1}. ${technicalItemName(item, `Problema ${index + 1}`)}
   Categoria: ${stringField(item.category) || "n/d"}
   Elemento collegato: ${stringField(item.relatedItem) || "n/d"}
   Sintomi: ${stringField(item.symptoms) || "n/d"}
   Soluzione: ${stringField(item.solution) || "n/d"}
   Quando chiamare tecnico: ${stringField(item.whenToCall) || "n/d"}
   Note IA: ${stringField(item.notesForAI) || "n/d"}
   Allegati:
${formatDetailedTechnicalAttachments(item.attachments)}`
  ));

  return `PROBLEMI RICORRENTI\n${lines.join("\n\n")}`;
}

function formatDetailedGeneralAttachments(technicalProfile: unknown) {
  const attachments = arraySection(technicalProfile, "generalAttachments");

  return `ALLEGATI GENERALI TECNICI\n${formatDetailedTechnicalAttachments(attachments)}`;
}

function formatTechnicalProfileExtraFields(technicalProfile: unknown) {
  if (!technicalProfile || typeof technicalProfile !== "object" || Array.isArray(technicalProfile)) {
    return "- Nessun altro campo tecnico registrato.";
  }

  // Sezioni standard escluse (hanno già la loro sezione dedicata)
  const structuralKeys = new Set([
    "systems", "appliances", "smartHome", "products", "recurringIssues", "generalAttachments", "aiNotes",
  ]);

  // Campi di accesso: mappati con label italiane invece di chiavi inglesi grezze
  const accessKeyLabels: Record<string, string> = {
    doorCode:     "Codice porta / smart lock",
    safeCode:     "Codice cassetta chiavi",
    buildingCode: "Codice portone / citofono",
    floor:        "Piano / interno",
    wifiNetwork:  "Rete Wi-Fi (nome rete)",
    wifiPassword: "Password Wi-Fi",
    directions:   "Come raggiungere l'appartamento",
    checkInNotes: "Note check-in / check-out (orari)",
    parking:      "Parcheggio",
  };

  const lines = Object.entries(technicalProfile as Record<string, unknown>)
    .filter(([key]) => !structuralKeys.has(key))
    .map(([key, value]) => {
      const label = accessKeyLabels[key] ?? key;
      return `- ${label}: ${formatNullable(value, 1200)}`;
    });

  return lines.length > 0 ? lines.join("\n") : "- Nessun altro campo tecnico registrato.";
}

function formatCompleteTechnicalProfileForAI(technicalProfile: unknown) {
  const systems = arraySection(technicalProfile, "systems");
  const appliances = arraySection(technicalProfile, "appliances");
  const smartHome = arraySection(technicalProfile, "smartHome");
  const products = arraySection(technicalProfile, "products");
  const recurringIssues = arraySection(technicalProfile, "recurringIssues");

  return [
    "SCHEDA TECNICA COMPLETA",
    "ALTRI CAMPI TECNICI",
    formatTechnicalProfileExtraFields(technicalProfile),
    formatDetailedTechnicalItems("IMPIANTI", systems),
    formatDetailedTechnicalItems("ELETTRODOMESTICI", appliances),
    formatDetailedTechnicalItems("DOMOTICA", smartHome),
    formatDetailedProductsSection(products),
    formatDetailedRecurringIssues(recurringIssues),
    formatDetailedGeneralAttachments(technicalProfile),
  ].join("\n\n");
}

function countTechnicalAttachments(items: Record<string, unknown>[]) {
  return items.reduce((total, item) => total + attachmentArray(item.attachments).length, 0);
}

type ApartmentMatchCandidate = {
  id: string;
  name: string;
  apartmentCode: string | null;
  address: string;
};

async function findApartmentsForAINameMatch(): Promise<ApartmentMatchCandidate[]> {
  try {
    return await prisma.apartment.findMany({
      select: { id: true, name: true, apartmentCode: true, address: true },
    });
  } catch (error) {
    console.error("[AI APARTMENT MATCH ERROR]", error);

    return prisma.$queryRaw<ApartmentMatchCandidate[]>`
      SELECT id, name, "apartmentCode", address
      FROM "Apartment"
    `;
  }
}

async function resolveApartmentIdFromAIContext(context: AIContext, userMessage: string) {
  if (context.apartmentId) {
    return context.apartmentId;
  }

  if (context.cleaningTaskId) {
    const task = await prisma.cleaningTask.findUnique({
      where: { id: context.cleaningTaskId },
      select: { apartmentId: true },
    });

    if (task?.apartmentId) {
      return task.apartmentId;
    }
  }

  if (context.maintenanceTicketId) {
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: context.maintenanceTicketId },
      select: { apartmentId: true },
    });

    if (ticket?.apartmentId) {
      return ticket.apartmentId;
    }
  }

  const apartmentsForNameMatch = await findApartmentsForAINameMatch();
  const normalizeApartmentMatchText = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const normalizedMessage = normalizeApartmentMatchText(userMessage);
  const matchedApartments = apartmentsForNameMatch.filter((apt) =>
    (apt.apartmentCode && normalizedMessage.includes(normalizeApartmentMatchText(apt.apartmentCode))) ||
    (apt.name && normalizedMessage.includes(normalizeApartmentMatchText(apt.name))) ||
    (apt.address && normalizedMessage.includes(normalizeApartmentMatchText(apt.address)))
  );
  const matchedApartment = matchedApartments.length === 1 ? matchedApartments[0] : null;

  console.log("[AI APARTMENT CODE MATCH]", {
    query: userMessage.slice(0, 200),
    matchedApartmentCode: matchedApartment?.apartmentCode ?? null,
    matchedApartmentName: matchedApartment?.name ?? null,
    matchedApartmentId: matchedApartment?.id ?? null,
  });

  console.log("[AI APARTMENT NAME MATCH]", {
    query: userMessage.slice(0, 200),
    matchedApartmentName: matchedApartment?.name ?? null,
    matchedApartmentId: matchedApartment?.id ?? null,
    ambiguous: matchedApartments.length > 1,
    ambiguousApartmentNames: matchedApartments.length > 1
      ? matchedApartments.map((apt) => apt.name)
      : [],
  });

  if (matchedApartment) {
    return matchedApartment.id;
  }

  return null;
}

async function buildCleaningContext(apartmentId: string) {
  const now = new Date();
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: {
      id: true, name: true, address: true, maxGuests: true, bedrooms: true, bathrooms: true,
      checklistItems: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], take: 100 },
      bookings: {
        where: { checkOutDate: { gte: addDays(now, -1) }, checkInDate: { lte: addDays(now, 30) }, status: { not: "CANCELLED" } },
        orderBy: { checkInDate: "asc" },
        take: 20,
        select: { guestName: true, totalGuests: true, checkInDate: true, checkOutDate: true, status: true, source: true },
      },
      cleaningTasks: {
        where: { date: { gte: addDays(now, -30) }, status: { not: "CANCELLED" } },
        orderBy: { date: "asc" },
        take: 60,
        include: {
          assignedTo: { select: { name: true, role: true, email: true } },
          booking: { select: { guestName: true, totalGuests: true, checkInDate: true, checkOutDate: true, source: true, status: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 20, select: { createdAt: true, role: true, senderName: true, text: true } },
          attachments: { orderBy: { createdAt: "desc" }, take: 10, select: { fileName: true, fileType: true, url: true, category: true, extractedText: true, createdAt: true } },
        },
      },
    },
  });

  if (!apartment) return "CONTESTO PULIZIE\n- Appartamento non trovato.";

  const bookingLines = apartment.bookings.map((b) =>
    `- ${bookingTag(b.checkInDate, b.checkOutDate)} ${formatDate(b.checkInDate)} → ${formatDate(b.checkOutDate)} | ospite: ${b.guestName || "n/d"} | ospiti: ${b.totalGuests} | stato: ${b.status || "n/d"} | fonte: ${b.source || "n/d"}`
  );

  const checklistLines = apartment.checklistItems.map((item) =>
    `- ${item.order}. ${item.label} | obbligatorio: ${item.required ? "si" : "no"} | tipo: ${item.type}`
  );

  const cleaningLines = apartment.cleaningTasks.map((task) => {
    const msgs = task.messages.map((m) =>
      `${formatDateTime(m.createdAt)} ${m.senderName} (${m.role}): ${truncateText(m.text, 200) || "n/d"}`
    );
    return `- id:${task.id} | ${formatDate(task.date)} | stato: ${task.status} | assegnato: ${task.assignedTo?.name || "non assegnato"} (${task.assignedTo?.role || "n/d"}) | booking: ${task.booking?.guestName || "n/d"} ${task.booking ? `${formatDate(task.booking.checkInDate)} → ${formatDate(task.booking.checkOutDate)}` : ""} | note: ${truncateText(task.notes, 300) || "n/d"} | checklist: ${compactJsonText(task.checklistProgress, 800)} | allegati: ${formatOperationalAttachmentLines(task.attachments)} | messaggi: ${msgs.length > 0 ? msgs.join(" || ") : "nessuno"}`;
  });

  return limitText(`CONTESTO PULIZIE — ${apartment.name} (${apartment.address})
Capacità: ${apartment.maxGuests} ospiti, ${apartment.bedrooms} camere, ${apartment.bathrooms} bagni
PRENOTAZIONI PROSSIME 30 GIORNI
${bookingLines.length > 0 ? bookingLines.join("\n") : "- Nessuna prenotazione imminente."}

CHECKLIST MASTER
${checklistLines.length > 0 ? checklistLines.join("\n") : "- Nessuna checklist configurata."}

STORICO PULIZIE
${cleaningLines.length > 0 ? cleaningLines.join("\n") : "- Nessuna pulizia registrata."}`, 18000);
}

async function buildMaintenanceContext(apartmentId: string) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: {
      id: true, name: true, address: true,
      maintenanceTickets: {
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          assignedTo: { select: { name: true, role: true, email: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 20, select: { createdAt: true, role: true, senderName: true, text: true } },
          attachments: { orderBy: { createdAt: "desc" }, take: 10, select: { fileName: true, fileType: true, url: true, category: true, extractedText: true, createdAt: true } },
        },
      },
    },
  });

  if (!apartment) return "CONTESTO MANUTENZIONE\n- Appartamento non trovato.";

  const ticketLines = apartment.maintenanceTickets.map((t) => {
    const msgs = t.messages.map((m) =>
      `${formatDateTime(m.createdAt)} ${m.senderName} (${m.role}): ${truncateText(m.text, 200) || "n/d"}`
    );
    return `- id:${t.id} | ${formatDate(t.createdAt)} | ${t.priority} | ${t.status} | ${t.title} | descrizione: ${truncateText(t.description, 400) || "n/d"} | tecnico: ${t.assignedTo?.name || "non assegnato"} (${t.assignedTo?.role || "n/d"}) | programmato: ${formatDateTime(t.scheduledStart)} | risolto: ${formatDateTime(t.resolvedAt)} | allegati: ${formatOperationalAttachmentLines(t.attachments)} | messaggi: ${msgs.length > 0 ? msgs.join(" || ") : "nessuno"}`;
  });

  return limitText(`CONTESTO MANUTENZIONE — ${apartment.name} (${apartment.address})

TICKET MANUTENZIONE
${ticketLines.length > 0 ? ticketLines.join("\n") : "- Nessun ticket registrato."}`, 18000);
}

async function buildBookingsContext(apartmentId: string) {
  const now = new Date();
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: {
      id: true, name: true, address: true, maxGuests: true,
      bookings: { where: { status: { not: "CANCELLED" } }, orderBy: { checkInDate: "desc" }, take: 60 },
      cleaningTasks: {
        where: { status: { not: "CANCELLED" }, OR: [{ status: { in: ["PENDING", "IN_PROGRESS"] } }, { date: { gte: addDays(now, -7) } }] },
        orderBy: { date: "asc" },
        take: 20,
        select: { date: true, status: true, assignedTo: { select: { name: true } } },
      },
    },
  });

  if (!apartment) return "CONTESTO PRENOTAZIONI\n- Appartamento non trovato.";

  const bookingLines = apartment.bookings.map((b) =>
    `- ${bookingTag(b.checkInDate, b.checkOutDate)} ${formatDate(b.checkInDate)} → ${formatDate(b.checkOutDate)} | ospite: ${b.guestName || "n/d"} | ospiti: ${b.totalGuests} | stato: ${b.status || "n/d"} | fonte: ${b.source || "manuale"} | externalId: ${b.externalId || "n/d"}`
  );

  const cleaningLines = apartment.cleaningTasks.map((t) =>
    `- ${formatDate(t.date)} | ${t.status} | assegnato: ${t.assignedTo?.name || "non assegnato"}`
  );

  return limitText(`CONTESTO PRENOTAZIONI — ${apartment.name} (${apartment.address})
Capacità: ${apartment.maxGuests} ospiti max

PRENOTAZIONI
${bookingLines.length > 0 ? bookingLines.join("\n") : "- Nessuna prenotazione."}

PULIZIE PROGRAMMATE (stato sintetico)
${cleaningLines.length > 0 ? cleaningLines.join("\n") : "- Nessuna pulizia programmata."}`, 14000);
}

async function buildTechnicalContext(apartmentId: string) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: {
      id: true, name: true, address: true, maxGuests: true, bedrooms: true, bathrooms: true, squareMeters: true,
      technicalProfile: true,
      accessInfo: true,
      accessInstructions: true,
      apartmentAttachments: {
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { filename: true, url: true, category: true, linkedTo: true, notes: true, extractedText: true, mimeType: true, size: true, createdAt: true },
      },
    },
  });

  if (!apartment) return "CONTESTO SCHEDA TECNICA\n- Appartamento non trovato.";

  return limitText(`CONTESTO SCHEDA TECNICA — ${apartment.name} (${apartment.address})
Dati base: ${apartment.maxGuests} ospiti, ${apartment.bedrooms} camere, ${apartment.bathrooms} bagni, ${apartment.squareMeters} mq

ACCESSO APPARTAMENTO
${formatAccessInfo((apartment as any).accessInfo, apartment.accessInstructions, apartment.technicalProfile)}

${formatCompleteTechnicalProfileForAI(apartment.technicalProfile)}

ALLEGATI APPARTAMENTO
${formatApartmentDocumentLines(apartment.apartmentAttachments)}`, 20000);
}

async function buildAttachmentsContext(apartmentId: string) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: {
      id: true, name: true, address: true,
      technicalProfile: true,
      apartmentAttachments: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { filename: true, url: true, category: true, linkedTo: true, notes: true, extractedText: true, mimeType: true, size: true, createdAt: true },
      },
    },
  });

  if (!apartment) return "CONTESTO ALLEGATI\n- Appartamento non trovato.";

  const generalAttachments = formatDetailedGeneralAttachments(apartment.technicalProfile);

  return limitText(`CONTESTO ALLEGATI — ${apartment.name} (${apartment.address})

ALLEGATI APPARTAMENTO (scheda operativa)
${formatApartmentDocumentLines(apartment.apartmentAttachments)}

${generalAttachments}`, 20000);
}

async function buildContextForIntent(intent: AIIntent, apartmentId: string): Promise<string> {
  switch (intent) {
    case "PULIZIE":       return buildCleaningContext(apartmentId);
    case "MANUTENZIONE":  return buildMaintenanceContext(apartmentId);
    case "PRENOTAZIONI":  return buildBookingsContext(apartmentId);
    case "SCHEDA_TECNICA": return buildTechnicalContext(apartmentId);
    case "ALLEGATI":      return buildAttachmentsContext(apartmentId);
    default:              return buildApartmentAIContext(apartmentId);
  }
}

export async function buildApartmentAIContext(apartmentId: string) {
  const now = new Date();

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    include: {
      apartmentAttachments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          filename: true,
          url: true,
          category: true,
          linkedTo: true,
          notes: true,
          extractedText: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      },
      checklistItems: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        take: 100,
      },
      bookings: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { checkInDate: "desc" },
        take: 60,
      },
      cleaningTasks: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { date: "desc" },
        take: 50,
        include: {
          assignedTo: { select: { name: true, role: true, email: true } },
          booking: { select: { guestName: true, totalGuests: true, checkInDate: true, checkOutDate: true, source: true, status: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 30,
            select: {
              createdAt: true,
              role: true,
              senderName: true,
              text: true,
              attachment: { select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true } },
            },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
            take: 20,
            select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true },
          },
          aiAssistantMessages: {
            orderBy: { createdAt: "desc" },
            take: 30,
            select: { createdAt: true, role: true, userRole: true, content: true },
          },
        },
      },
      maintenanceTickets: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          assignedTo: { select: { name: true, role: true, email: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 30,
            select: {
              createdAt: true,
              role: true,
              senderName: true,
              text: true,
              attachment: { select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true } },
            },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
            take: 20,
            select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true },
          },
          aiAssistantMessages: {
            orderBy: { createdAt: "desc" },
            take: 30,
            select: { createdAt: true, role: true, userRole: true, content: true },
          },
        },
      },
      aiAssistantMessages: {
        orderBy: { createdAt: "desc" },
        take: 80,
        select: { createdAt: true, role: true, userRole: true, content: true },
      },
    },
  });

  if (!apartment) {
    console.log("[DEBUG AI CONTEXT] apartmentId ricevuto:", apartmentId, "appartamento non trovato");
    return "CONTESTO COMPLETO APPARTAMENTO\n- Appartamento non trovato nei dati disponibili.";
  }

  const status = getApartmentOperationalStatus(
    now,
    apartment.bookings,
    apartment.cleaningTasks,
    apartment.maintenanceTickets,
    { now, apartmentId }
  );

  const apartmentRecord = apartment as unknown as Record<string, unknown>;
  const apartmentBaseText = formatRecordFields(apartmentRecord, [
    "technicalProfile",
    "bookings",
    "checklistItems",
    "cleaningTasks",
    "maintenanceTickets",
    "notifications",
    "aiAssistantMessages",
    "apartmentAttachments",
  ]);

  const checklistLines = apartment.checklistItems.map((item: ApartmentChecklistItemForAI) => (
    `- ${item.order}. ${item.label} | obbligatorio: ${item.required ? "si" : "no"} | tipo: ${item.type} | formula: ${item.formula || "n/d"}`
  ));

  const bookingLines = apartment.bookings.map((booking: ApartmentBookingForAI) => (
    `- ${bookingTag(booking.checkInDate, booking.checkOutDate)} ${formatDate(booking.checkInDate)} -> ${formatDate(booking.checkOutDate)} | ospite: ${booking.guestName || "n/d"} | ospiti: ${booking.totalGuests} | stato: ${booking.status || "n/d"} | fonte: ${booking.source || "manuale"} | externalId: ${booking.externalId || "n/d"}`
  ));

  const cleaningLines = apartment.cleaningTasks.map((task: CleaningTaskWithAIMessagesForAI) => {
    const messageLines = task.messages.map((message: OperationalMessageForAI) => {
      const attachment = message.attachment
        ? ` | allegato messaggio: ${formatOperationalDocuments([message.attachment])}`
        : "";

      return `${formatDateTime(message.createdAt)} ${message.senderName} (${message.role}): ${truncateText(message.text, 220) || "n/d"}${attachment}`;
    });

    return `- id:${task.id} | ${formatDate(task.date)} | stato: ${task.status} | creata: ${formatDateTime(task.createdAt)} | assegnato: ${task.assignedTo?.name || "non assegnato"} (${task.assignedTo?.role || "n/d"}) | booking: ${task.booking?.guestName || "n/d"} ${task.booking ? `${formatDate(task.booking.checkInDate)} -> ${formatDate(task.booking.checkOutDate)} fonte ${task.booking.source || "n/d"}` : ""} | note: ${truncateText(task.notes, 300) || "n/d"} | checklistProgress: ${compactJsonText(task.checklistProgress, 1200)} | allegati: ${formatOperationalDocuments(task.attachments)} | messaggi: ${messageLines.length > 0 ? messageLines.join(" || ") : "nessun messaggio"} | richieste IA: ${formatAIMessages(task.aiAssistantMessages)}`;
  });

  const ticketLines = apartment.maintenanceTickets.map((ticket: MaintenanceTicketWithAIMessagesForAI) => {
    const messageLines = ticket.messages.map((message: OperationalMessageForAI) => {
      const attachment = message.attachment
        ? ` | allegato messaggio: ${formatOperationalDocuments([message.attachment])}`
        : "";

      return `${formatDateTime(message.createdAt)} ${message.senderName} (${message.role}): ${truncateText(message.text, 220) || "n/d"}${attachment}`;
    });

    return `- id:${ticket.id} | ${formatDate(ticket.createdAt)} | titolo: ${ticket.title} | stato: ${ticket.status} | priorita: ${ticket.priority} | descrizione problema: ${truncateText(ticket.description, 450) || "n/d"} | assegnato: ${ticket.assignedTo?.name || "non assegnato"} (${ticket.assignedTo?.role || "n/d"}) | programmato: ${formatDateTime(ticket.scheduledStart)} -> ${formatDateTime(ticket.scheduledEnd)} | avviato: ${formatDateTime(ticket.startedAt)} | risolto/soluzione: ${formatDateTime(ticket.resolvedAt)} | allegati: ${formatOperationalDocuments(ticket.attachments)} | messaggi/chat: ${messageLines.length > 0 ? messageLines.join(" || ") : "nessun messaggio"} | richieste IA: ${formatAIMessages(ticket.aiAssistantMessages)}`;
  });

  const operationalSummaryText = formatOperationalHistory({
    maintenanceTickets: apartment.maintenanceTickets.map((ticket: MaintenanceTicketForAI) => ({
      createdAt: ticket.createdAt,
      status: ticket.status,
      priority: ticket.priority,
      title: ticket.title,
      description: ticket.description,
    })),
    cleaningTasks: apartment.cleaningTasks.map((task: CleaningTaskForAI) => ({
      date: task.date,
      status: task.status,
      notes: task.notes,
    })),
    aiAssistantMessages: apartment.aiAssistantMessages.map((message: AIAssistantMessageForAI) => ({
      createdAt: message.createdAt,
      role: message.role,
      content: message.content,
    })),
  });
  const technicalSystems = arraySection(apartment.technicalProfile, "systems");
  const technicalAppliances = arraySection(apartment.technicalProfile, "appliances");
  const technicalSmartHome = arraySection(apartment.technicalProfile, "smartHome");
  const technicalProducts = arraySection(apartment.technicalProfile, "products");
  const technicalRecurringIssues = arraySection(apartment.technicalProfile, "recurringIssues");
  const technicalGeneralAttachments = arraySection(apartment.technicalProfile, "generalAttachments");

  const cleaningAICount = apartment.cleaningTasks.reduce((total: number, task: CleaningTaskWithAIMessagesForAI) => total + task.aiAssistantMessages.length, 0);
  const maintenanceAICount = apartment.maintenanceTickets.reduce((total: number, ticket: MaintenanceTicketWithAIMessagesForAI) => total + ticket.aiAssistantMessages.length, 0);
  const cleaningAttachmentCount = apartment.cleaningTasks.reduce((total: number, task: CleaningTaskForAI) => total + task.attachments.length, 0);
  const maintenanceAttachmentCount = apartment.maintenanceTickets.reduce((total: number, ticket: MaintenanceTicketForAI) => total + ticket.attachments.length, 0);
  const technicalAttachmentCount = technicalGeneralAttachments.length
    + countTechnicalAttachments(technicalSystems)
    + countTechnicalAttachments(technicalAppliances)
    + countTechnicalAttachments(technicalSmartHome)
    + countTechnicalAttachments(technicalProducts)
    + countTechnicalAttachments(technicalRecurringIssues);
  const totalAttachmentCount = apartment.apartmentAttachments.length + cleaningAttachmentCount + maintenanceAttachmentCount + technicalAttachmentCount;
  const totalAICount = apartment.aiAssistantMessages.length + cleaningAICount + maintenanceAICount;

  console.log("[DEBUG AI CONTEXT] apartmentId ricevuto:", apartmentId);
  console.log("[DEBUG AI CONTEXT] pulizie caricate:", apartment.cleaningTasks.length);
  console.log("[DEBUG AI CONTEXT] ticket caricati:", apartment.maintenanceTickets.length);
  console.log("[DEBUG AI CONTEXT] messaggi IA caricati:", totalAICount);
  console.log("[DEBUG AI CONTEXT] allegati caricati:", totalAttachmentCount);
  console.log("[DEBUG AI CONTEXT] numero impianti trovati:", technicalSystems.length);
  console.log("[DEBUG AI CONTEXT] nomi impianti:", technicalSystems.map((item, index) => technicalItemName(item, `Elemento ${index + 1}`)));
  console.log("[DEBUG AI CONTEXT] numero elettrodomestici trovati:", technicalAppliances.length);
  console.log("[DEBUG AI CONTEXT] nomi elettrodomestici:", technicalAppliances.map((item, index) => technicalItemName(item, `Elemento ${index + 1}`)));
  console.log("[DEBUG AI CONTEXT] numero domotica trovata:", technicalSmartHome.length);
  console.log("[DEBUG AI CONTEXT] nomi domotica:", technicalSmartHome.map((item, index) => technicalItemName(item, `Elemento ${index + 1}`)));
  console.log("[DEBUG AI CONTEXT] numero allegati totali trovati:", totalAttachmentCount);
  console.log("[DEBUG AI CONTEXT] apartment attachments caricati:", apartment.apartmentAttachments.length);
  console.log("[DEBUG AI CONTEXT] apartment attachment filenames:", apartment.apartmentAttachments.map((attachment: ApartmentAttachmentForAI) => attachment.filename));
  console.log("[DEBUG AI CONTEXT] apartment attachment extraction:", apartment.apartmentAttachments.map((attachment: ApartmentAttachmentForAI) => ({
    filename: attachment.filename,
    hasExtractedText: Boolean(attachment.extractedText?.trim()),
    extractedTextLength: attachment.extractedText?.length ?? 0,
  })));

  const contextText = `
DATI COMPLETI APPARTAMENTO
Stato operativo calcolato: ${status.label} (${status.reason})
${apartmentBaseText}

${formatCompleteTechnicalProfileForAI(apartment.technicalProfile)}

ALLEGATI APPARTAMENTO:
${limitSection(formatApartmentDocumentLines(apartment.apartmentAttachments), 12000)}

CHECKLIST / NOTE OPERATIVE MASTER
${checklistLines.length > 0 ? checklistLines.join("\n") : "- Nessuna checklist master registrata."}

PRENOTAZIONI COLLEGATE
${limitSection(bookingLines.length > 0 ? bookingLines.join("\n") : "- Nessuna prenotazione caricata.", 3500)}

SINTESI OPERATIVA
${operationalSummaryText}

STORICO PULIZIE
${limitSection(cleaningLines.length > 0 ? cleaningLines.join("\n") : "- Nessuna pulizia caricata.", 6500)}

MESSAGGI E RICHIESTE IA PULIZIE
${limitSection(apartment.cleaningTasks.flatMap((task: CleaningTaskWithAIMessagesForAI) => task.aiAssistantMessages.map((message: AIAssistantMessageForAI) => `- Pulizia ${formatDate(task.date)} | ${formatDateTime(message.createdAt)} ${message.role} (${message.userRole}): ${truncateText(message.content, 260) || "n/d"}`)).join("\n") || "- Nessuna richiesta IA collegata alle pulizie.", 3500)}

STORICO MANUTENZIONI
${limitSection(ticketLines.length > 0 ? ticketLines.join("\n") : "- Nessuna manutenzione caricata.", 6500)}

MESSAGGI E RICHIESTE IA MANUTENZIONI
${limitSection(apartment.maintenanceTickets.flatMap((ticket: MaintenanceTicketWithAIMessagesForAI) => ticket.aiAssistantMessages.map((message: AIAssistantMessageForAI) => `- Ticket ${ticket.title} | ${formatDateTime(message.createdAt)} ${message.role} (${message.userRole}): ${truncateText(message.content, 260) || "n/d"}`)).join("\n") || "- Nessuna richiesta IA collegata alle manutenzioni.", 3500)}

STORICO CONVERSAZIONI IA APPARTAMENTO
${limitSection(apartment.aiAssistantMessages.map((message: AIAssistantMessageForAI) => `- ${formatDateTime(message.createdAt)} ${message.role} (${message.userRole}): ${truncateText(message.content, 300) || "n/d"}`).join("\n") || "- Nessuna conversazione IA diretta sull'appartamento.", 4000)}
`.trim();

  console.log("[DEBUG AI CONTEXT] context contiene ALLEGATI APPARTAMENTO:", contextText.includes("ALLEGATI APPARTAMENTO"));

  return limitText(contextText, MAX_APARTMENT_AI_CONTEXT_TEXT_LENGTH);
}

async function buildApartmentManagerContext(apartmentId: string, now: Date) {
  const historySince = addDays(now, -HISTORY_DAYS);
  const futureUntil = addDays(now, 30);

  const [apartment, personnel] = await Promise.all([
  prisma.apartment.findUnique({
    where: { id: apartmentId },
    include: {
      apartmentAttachments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          filename: true,
          url: true,
          category: true,
          linkedTo: true,
          notes: true,
          extractedText: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      },
      bookings: {
        where: {
          status: { not: "CANCELLED" },
          OR: [
            { checkInDate: { gte: historySince, lte: futureUntil } },
            { checkOutDate: { gte: historySince, lte: futureUntil } },
          ],
        },
        orderBy: { checkInDate: "asc" },
        take: 40,
      },
      cleaningTasks: {
        where: {
          status: { not: "CANCELLED" },
          OR: [
            { status: { in: ["PENDING", "IN_PROGRESS"] } },
            { date: { gte: historySince } },
          ],
        },
        orderBy: { date: "desc" },
        take: 30,
        include: {
          assignedTo: { select: { name: true, role: true } },
          booking: { select: { guestName: true, totalGuests: true, checkInDate: true, checkOutDate: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { createdAt: true, role: true, senderName: true, text: true },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true },
          },
        },
      },
      maintenanceTickets: {
        where: {
          OR: [
            { status: { in: ["OPEN", "IN_PROGRESS"] } },
            { createdAt: { gte: historySince } },
            { resolvedAt: { gte: historySince } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          assignedTo: { select: { name: true, role: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { createdAt: true, role: true, senderName: true, text: true },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true },
          },
        },
      },
    },
  }),
  prisma.user.findMany({
    where: { role: { in: ["CLEANER", "MAINTENANCE"] } },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  }),
  ]);

  if (!apartment) {
    return "CONTESTO OPERATIVO MANAGER\n- Appartamento non trovato nei dati disponibili.";
  }

  const status = getApartmentOperationalStatus(
    now,
    apartment.bookings,
    apartment.cleaningTasks,
    apartment.maintenanceTickets,
    { now, apartmentId }
  );

  const bookingLines = apartment.bookings.map((booking: ApartmentBookingForAI) => (
    `- ${bookingTag(booking.checkInDate, booking.checkOutDate, now)} ${formatDate(booking.checkInDate)} -> ${formatDate(booking.checkOutDate)} | ospite: ${booking.guestName || "n/d"} | ospiti: ${booking.totalGuests} | stato: ${booking.status || "n/d"} | fonte: ${booking.source || "n/d"}`
  ));

  const cleaningLines = apartment.cleaningTasks.map((task: CleaningTaskForAI) => (
    `- id:${task.id} | ${formatDate(task.date)} | stato: ${task.status} | assegnato: ${task.assignedTo?.name || "non assegnato"} | note: ${truncateText(task.notes, 180) || "n/d"} | checklist: ${compactJsonText(task.checklistProgress, 500)} | booking: ${task.booking?.guestName || "n/d"} | messaggi: ${formatManagerMessages(task.messages)} | allegati: ${formatOperationalAttachmentLines(task.attachments)}`
  ));

  const ticketLines = apartment.maintenanceTickets.map((ticket: MaintenanceTicketForAI) => (
    `- id:${ticket.id} | ${formatDate(ticket.createdAt)} | ${ticket.priority} | ${ticket.status} | ${ticket.title} | descrizione: ${truncateText(ticket.description, 220)} | tecnico: ${ticket.assignedTo?.name || "non assegnato"} | programmato: ${formatDateTime(ticket.scheduledStart)} | risolto: ${formatDateTime(ticket.resolvedAt)} | messaggi: ${formatManagerMessages(ticket.messages)} | allegati: ${formatOperationalAttachmentLines(ticket.attachments)}`
  ));

  const attachmentLines = apartment.apartmentAttachments.map((attachment: ApartmentAttachmentForAI) => {
    const linkApribile = formatInternalFileUrl(attachment.url);
    return `- ${attachment.filename} | Documento interno caricato nella scheda appartamento | categoria: ${attachment.category} | tipo: ${attachment.mimeType || "n/d"} | dimensione: ${attachment.size ?? "n/d"} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | note: ${truncateText(attachment.notes, 180) || "n/d"} | extractedText: ${truncateText(attachment.extractedText, 450) || "n/d"}`;
  });

  const contextText = `
CONTESTO OPERATIVO MANAGER
Modalita: dettaglio appartamento

APPARTAMENTO
- Nome: ${apartment.name}
- Indirizzo: ${apartment.address}
- Stato operativo: ${status.label} (${status.reason})
- Dati base: ${apartment.maxGuests} ospiti max, ${apartment.bedrooms} camere, ${apartment.bathrooms} bagni, ${apartment.squareMeters} mq

ACCESSO APPARTAMENTO
${formatAccessInfo((apartment as any).accessInfo, (apartment as any).accessInstructions, apartment.technicalProfile)}

SCHEDA TECNICA
${formatTechnicalProfile(apartment.technicalProfile)}

PRODOTTI LEGACY / PRESENTI IN CASA
${formatLegacyProductsSection(apartment.technicalProfile)}

${formatStructuredTechnicalKnowledge({
  technicalProfile: apartment.technicalProfile,
  apartmentAttachments: apartment.apartmentAttachments,
})}

PRENOTAZIONI COLLEGATE
${bookingLines.length > 0 ? bookingLines.join("\n") : "- Nessuna prenotazione nel periodo caricato."}

PULIZIE COLLEGATE
${cleaningLines.length > 0 ? cleaningLines.join("\n") : "- Nessuna pulizia nel periodo caricato."}

TICKET MANUTENZIONE COLLEGATI
${ticketLines.length > 0 ? ticketLines.join("\n") : "- Nessun ticket nel periodo caricato."}

DOCUMENTI / ALLEGATI APPARTAMENTO
${attachmentLines.length > 0 ? attachmentLines.join("\n") : "- Nessun documento appartamento registrato."}

PERSONALE DISPONIBILE (usa assignedToName per le azioni AI)
${personnel.map((u: { id: string; name: string; role: string }) => `- ${u.name} | ruolo: ${u.role}`).join("\n") || "- Nessun personale trovato."}
`.trim();

  return limitText(contextText, MAX_MANAGER_CONTEXT_TEXT_LENGTH);
}

async function buildGeneralManagerContext(now: Date) {
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const next7Days = addDays(todayStart, 7);
  const windowStart = addDays(todayStart, -30);
  const windowEnd = addDays(todayStart, 60);
  const recent14Days = addDays(todayStart, -14);

  const [apartments, bookings, cleanings, tickets, personnel] = await Promise.all([
    prisma.apartment.findMany({
      take: 50,
      orderBy: { name: "asc" },
      include: {
        apartmentAttachments: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            filename: true,
            url: true,
            category: true,
            linkedTo: true,
            notes: true,
            extractedText: true,
            mimeType: true,
            size: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.booking.findMany({
      where: {
        OR: [
          { checkInDate: { gte: windowStart, lte: windowEnd } },
          { checkOutDate: { gte: windowStart, lte: windowEnd } },
          {
            AND: [
              { checkInDate: { lte: now } },
              { checkOutDate: { gt: now } },
            ],
          },
        ],
        status: { not: "CANCELLED" },
      },
      orderBy: { checkInDate: "asc" },
      take: 80,
      include: { apartment: { select: { id: true, name: true, address: true } } },
    }),
    prisma.cleaningTask.findMany({
      where: {
        OR: [
          { status: { in: ["PENDING", "IN_PROGRESS", "AWAITING_REVIEW"] } },
          { date: { gte: recent14Days } },
        ],
      },
      orderBy: { date: "asc" },
      take: 150,
      include: {
        apartment: { select: { id: true, name: true, address: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
        booking: { select: { guestName: true, totalGuests: true, checkInDate: true, checkOutDate: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { createdAt: true, role: true, senderName: true, text: true },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true },
        },
      },
    }),
    prisma.maintenanceTicket.findMany({
      where: {
        OR: [
          { status: { in: ["OPEN", "IN_PROGRESS"] } },
          { priority: "URGENT" },
          { resolvedAt: { gte: recent14Days } },
          { createdAt: { gte: recent14Days } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        apartment: { select: { id: true, name: true, address: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { createdAt: true, role: true, senderName: true, text: true },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["CLEANER", "MAINTENANCE"] } },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const apartmentLines = apartments.map((apartment: ManagerApartmentForAI) => {
    const apartmentBookings = bookings.filter((booking: ApartmentBookingForAI) => booking.apartmentId === apartment.id);
    const apartmentCleanings = cleanings.filter((task: CleaningTaskForAI) => task.apartmentId === apartment.id);
    const apartmentTickets = tickets.filter((ticket: MaintenanceTicketForAI) => ticket.apartmentId === apartment.id);
    const status = getApartmentOperationalStatus(
      now,
      apartmentBookings,
      apartmentCleanings,
      apartmentTickets,
      { now, apartmentId: apartment.id }
    );
    const attachmentSummary = apartment.apartmentAttachments
      .map((attachment: ApartmentAttachmentForAI) => {
        const linkApribile = formatInternalFileUrl(attachment.url);
        return `${attachment.filename} (${attachment.category}) collegato a: ${attachment.linkedTo || "n/d"} Documento interno caricato nella scheda appartamento linkApribile: ${linkApribile} markdownLink: ${formatInternalMarkdownLink(linkApribile)} note: ${truncateText(attachment.notes, 80) || "n/d"} extractedText: ${truncateText(attachment.extractedText, 120) || "n/d"}`;
      })
      .join(" || ");

    // Usa formatAccessInfo con fallback su technicalProfile per label italiane corrette
    const accessSummary = formatAccessInfo(
      (apartment as any).accessInfo,
      (apartment as any).accessInstructions,
      apartment.technicalProfile,
    ).replace(/^- /gm, "").replace(/\n/g, " | ");

    return `- id:${apartment.id} | ${apartment.name} | ${apartment.address} | stato: ${status.label} (${status.reason}) | base: ${apartment.maxGuests} ospiti, ${apartment.bedrooms} camere, ${apartment.bathrooms} bagni, ${apartment.squareMeters} mq | accesso: ${accessSummary} | technicalProfile: ${compactJsonText(stripAccessKeysFromTechProfile(apartment.technicalProfile), 900)} | prodotti: ${truncateText(formatLegacyProductsSection(apartment.technicalProfile), 400)} | allegati: ${attachmentSummary || "nessun allegato"}`;
  });

  // Usa formatDate (Europe/Rome) come chiave stringa per tutti i filtri — evita mismatch UTC/locale
  const todayRomeKey    = formatDate(now);
  const tomorrowRomeKey = formatDate(tomorrowStart);

  const checkinsToday    = bookings.filter((b: ApartmentBookingForAI) => formatDate(b.checkInDate  as Date) === todayRomeKey);
  const checkoutsToday   = bookings.filter((b: ApartmentBookingForAI) => formatDate(b.checkOutDate as Date) === todayRomeKey);
  const checkinsTomorrow = bookings.filter((b: ApartmentBookingForAI) => formatDate(b.checkInDate  as Date) === tomorrowRomeKey);
  const checkoutsTomorrow= bookings.filter((b: ApartmentBookingForAI) => formatDate(b.checkOutDate as Date) === tomorrowRomeKey);

  // Prossimi 7 giorni: checkIn dal giorno dopodomani in poi (escluso oggi e domani già listati sopra)
  const upcomingCheckins  = bookings.filter((b: ApartmentBookingForAI) => {
    const k = formatDate(b.checkInDate as Date);
    return k !== todayRomeKey && k !== tomorrowRomeKey && (b.checkInDate as Date) >= tomorrowStart && (b.checkInDate as Date) < next7Days;
  });
  const upcomingCheckouts = bookings.filter((b: ApartmentBookingForAI) => {
    const k = formatDate(b.checkOutDate as Date);
    return k !== todayRomeKey && k !== tomorrowRomeKey && (b.checkOutDate as Date) >= tomorrowStart && (b.checkOutDate as Date) < next7Days;
  });

  // SOGGIORNI IN CORSO: checkIn PRIMA di oggi, checkOut nel futuro (ospiti già presenti)
  const activeBookings = bookings.filter((b: ApartmentBookingForAI) => (b.checkInDate as Date) < todayStart && (b.checkOutDate as Date) > now);

  // Pulizie e ticket di OGGI e DOMANI (pre-computati per evitare ragionamento date da parte dell'AI)
  const cleaningsToday    = cleanings.filter((t: CleaningTaskWithApartmentForAI) => formatDate(t.date as Date) === todayRomeKey);
  const cleaningsTomorrow = cleanings.filter((t: CleaningTaskWithApartmentForAI) => formatDate(t.date as Date) === tomorrowRomeKey);
  const ticketsToday      = tickets.filter((t: MaintenanceTicketWithApartmentForAI) => t.scheduledStart && formatDate(t.scheduledStart as Date) === todayRomeKey);
  const ticketsTomorrow   = tickets.filter((t: MaintenanceTicketWithApartmentForAI) => t.scheduledStart && formatDate(t.scheduledStart as Date) === tomorrowRomeKey);

  // bookingLine usa formatDate (timezone Roma) invece di toISOString() per evitare ambiguità UTC/locale
  const bookingLine = (booking: ApartmentBookingWithApartmentForAI) => (
    `- apt:"${booking.apartment.name}" | ospite: ${booking.guestName || "n/d"} | checkIn:${formatDate(booking.checkInDate as Date)} checkOut:${formatDate(booking.checkOutDate as Date)} | ospiti: ${booking.totalGuests} | stato: ${booking.status || "n/d"} | fonte: ${booking.source || "n/d"}`
  );

  const cleaningLines = cleanings.map((task: CleaningTaskWithApartmentForAI) => (
    `- id:${(task as any).id} | ${task.apartment.name} | ${formatDate(task.date)} | stato: ${task.status} | assegnato: ${task.assignedTo?.name || "non assegnato"}${(task.assignedTo as any)?.id ? ` (assignedToId:${(task.assignedTo as any).id})` : ""} | note: ${truncateText(task.notes, 160) || "n/d"} | booking: ${task.booking?.guestName || "n/d"} (${task.booking?.totalGuests ?? "n/d"} ospiti) | messaggi: ${formatManagerMessages(task.messages)}`
  ));

  const ticketLines = tickets.map((ticket: MaintenanceTicketWithApartmentForAI) => (
    `- id:${(ticket as any).id} | ${ticket.apartment.name} | ${formatDate(ticket.createdAt)} | ${ticket.priority} | ${ticket.status} | ${ticket.title} | descrizione: ${truncateText(ticket.description, 220)} | tecnico: ${ticket.assignedTo?.name || "non assegnato"}${(ticket.assignedTo as any)?.id ? ` (assignedToId:${(ticket.assignedTo as any).id})` : ""} | programmato: ${formatDateTime(ticket.scheduledStart)} | messaggi: ${formatManagerMessages(ticket.messages)}`
  ));

  const recentMessageLines = [
    ...cleanings.flatMap((task: CleaningTaskWithApartmentForAI) => task.messages.map((message: OperationalMessageForAI) => (
      `- Pulizia | ${task.apartment.name} | ${formatDateTime(message.createdAt)} | ${message.senderName} (${message.role}): ${truncateText(message.text, 160) || "n/d"}`
    ))),
    ...tickets.flatMap((ticket: MaintenanceTicketWithApartmentForAI) => ticket.messages.map((message: OperationalMessageForAI) => (
      `- Manutenzione | ${ticket.apartment.name} | ${ticket.title} | ${formatDateTime(message.createdAt)} | ${message.senderName} (${message.role}): ${truncateText(message.text, 160) || "n/d"}`
    ))),
  ]
    .slice(0, 40);

  const recurringIssueLines = apartments
    .flatMap((apartment: ManagerApartmentForAI) => arraySection(apartment.technicalProfile, "recurringIssues").map((issue: Record<string, unknown>) => (
      `- ${apartment.name} | ${stringField(issue.title) || "Problema ricorrente"} | sintomi: ${truncateText(stringField(issue.symptoms), 160) || "n/d"} | soluzione: ${truncateText(stringField(issue.solution), 160) || "n/d"} | note IA: ${truncateText(stringField(issue.notesForAI), 160) || "n/d"}`
    )))
    .slice(0, 30);

  const contextText = `
CONTESTO OPERATIVO MANAGER
Modalita: contesto generale
Periodo prenotazioni: ultimi 30 giorni / prossimi 60 giorni. Pulizie e ticket: aperti/in corso o ultimi 14 giorni. Limiti applicati per sicurezza.
Oggi: ${todayRomeKey} | Domani: ${tomorrowRomeKey}

════ EVENTI OGGI (${todayRomeKey}) ════
Usa questa sezione per rispondere a "che eventi ci sono oggi?", "cosa ho oggi?", "agenda di oggi".

CHECK-IN OGGI
${checkinsToday.length > 0 ? checkinsToday.map(bookingLine).join("\n") : "- Nessun check-in oggi."}

CHECK-OUT OGGI
${checkoutsToday.length > 0 ? checkoutsToday.map(bookingLine).join("\n") : "- Nessun check-out oggi."}

PULIZIE OGGI
${cleaningsToday.length > 0 ? cleaningsToday.map((t: CleaningTaskWithApartmentForAI) => `- id:${(t as any).id} | ${t.apartment.name} | stato: ${t.status} | assegnato: ${t.assignedTo?.name || "non assegnato"}`).join("\n") : "- Nessuna pulizia oggi."}

TICKET PROGRAMMATI OGGI
${ticketsToday.length > 0 ? ticketsToday.map((t: MaintenanceTicketWithApartmentForAI) => `- ${t.apartment.name} | ${t.title} | ${t.status} | tecnico: ${t.assignedTo?.name || "non assegnato"}`).join("\n") : "- Nessun ticket programmato oggi."}

SOGGIORNI IN CORSO OGGI (ospiti già presenti — checkIn avvenuto PRIMA di oggi)
${activeBookings.length > 0 ? activeBookings.map(bookingLine).join("\n") : "- Nessun soggiorno in corso da giorni precedenti."}

════ EVENTI DOMANI (${tomorrowRomeKey}) ════
Usa questa sezione per rispondere a "che eventi ci sono domani?", "cosa ho domani?", "agenda di domani".

CHECK-IN DOMANI
${checkinsTomorrow.length > 0 ? checkinsTomorrow.map(bookingLine).join("\n") : "- Nessun check-in domani."}

CHECK-OUT DOMANI
${checkoutsTomorrow.length > 0 ? checkoutsTomorrow.map(bookingLine).join("\n") : "- Nessun check-out domani."}

PULIZIE DOMANI
${cleaningsTomorrow.length > 0 ? cleaningsTomorrow.map((t: CleaningTaskWithApartmentForAI) => `- id:${(t as any).id} | ${t.apartment.name} | stato: ${t.status} | assegnato: ${t.assignedTo?.name || "non assegnato"}`).join("\n") : "- Nessuna pulizia domani."}

TICKET PROGRAMMATI DOMANI
${ticketsTomorrow.length > 0 ? ticketsTomorrow.map((t: MaintenanceTicketWithApartmentForAI) => `- ${t.apartment.name} | ${t.title} | ${t.status} | tecnico: ${t.assignedTo?.name || "non assegnato"}`).join("\n") : "- Nessun ticket programmato domani."}

════ PROSSIMI 7 GIORNI (dal ${tomorrowRomeKey} in poi) ════

PROSSIMI CHECK-IN 7 GIORNI (escluso domani)
${upcomingCheckins.length > 0 ? upcomingCheckins.map(bookingLine).join("\n") : "- Nessun check-in nei prossimi 7 giorni."}

PROSSIMI CHECK-OUT 7 GIORNI (escluso domani)
${upcomingCheckouts.length > 0 ? upcomingCheckouts.map(bookingLine).join("\n") : "- Nessun check-out nei prossimi 7 giorni."}

════ STATO APPARTAMENTI ════
STATO APPARTAMENTI
${apartmentLines.length > 0 ? apartmentLines.join("\n") : "- Nessun appartamento trovato."}

PULIZIE OPERATIVE
${cleaningLines.length > 0 ? cleaningLines.join("\n") : "- Nessuna pulizia operativa nel periodo caricato."}

MANUTENZIONI OPERATIVE
${ticketLines.length > 0 ? ticketLines.join("\n") : "- Nessuna manutenzione operativa nel periodo caricato."}

MESSAGGI OPERATIVI RECENTI
${recentMessageLines.length > 0 ? recentMessageLines.join("\n") : "- Nessun messaggio operativo recente nei dati caricati."}

PROBLEMI RICORRENTI DA SCHEDE TECNICHE
${recurringIssueLines.length > 0 ? recurringIssueLines.join("\n") : "- Nessun problema ricorrente registrato nelle schede tecniche caricate."}

PERSONALE DISPONIBILE (usa questi id per le azioni AI)
${personnel.map((u: { id: string; name: string; role: string }) => `- id:${u.id} | ${u.name} | ruolo: ${u.role}`).join("\n") || "- Nessun personale trovato."}
`.trim();

  return limitText(contextText, MAX_MANAGER_CONTEXT_TEXT_LENGTH);
}

async function buildManagerOperationalContext(context: AIContext, now: Date) {
  if (context.apartmentId) {
    return buildApartmentManagerContext(context.apartmentId, now);
  }

  return buildGeneralManagerContext(now);
}

export async function askAI(messages: AIMessage[], context: AIContext) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const userMessage = messages[messages.length - 1]?.content || "";

  // Intent classification — deve stare PRIMA di tutto il resto
  const intent = classifyIntent(userMessage);
  console.log("[AI INTENT]", { intent, query: userMessage.slice(0, 120) });

    const resolvedApartmentId = await resolveApartmentIdFromAIContext(context, userMessage);

  console.log("[DEBUG AI] apartmentId ricevuto:", context.apartmentId || "n/d");
  console.log("[DEBUG AI] apartmentId risolto:", resolvedApartmentId || "n/d");
  if (!resolvedApartmentId) {
    console.log("[DEBUG AI] apartmentId assente: la chat non puo caricare allegati specifici appartamento", {
      contextType: context.type,
      hasCleaningTaskId: Boolean(context.cleaningTaskId),
      hasMaintenanceTicketId: Boolean(context.maintenanceTicketId),
    });
  }

  // Perplexity solo per dominio GENERALE con trigger espliciti — mai per domini operativi interni
  const isRealWebSearchQuery = shouldUseWebSearch(userMessage);
  const shouldUsePerplexity =
    context.type === "MANAGER_DASHBOARD" && intent === "GENERALE" && isRealWebSearchQuery;
  let perplexityContext: string | null = null;
  let usedWeb = false;

  console.log("[PERPLEXITY FINAL DECISION]", {
    intent,
    isRealWebSearchQuery,
    shouldUsePerplexity,
    contextType: context.type,
  });

  if (shouldUsePerplexity) {
    perplexityContext = await askPerplexitySearch(userMessage);
    usedWeb = Boolean(perplexityContext);
  }

  console.log("[PERPLEXITY RESULT]", {
    used: Boolean(perplexityContext),
    length: perplexityContext?.length ?? 0,
  });
  const formattedPerplexityContext = perplexityContext
    ? formatLinksAsMarkdown(perplexityContext)
    : null;

  const now = new Date();
  const apartmentAIContextText = resolvedApartmentId
    ? await buildContextForIntent(intent, resolvedApartmentId)
    : "CONTESTO APPARTAMENTO\n- Nessun apartmentId disponibile o risolvibile dal contesto della chat.";
  const managerOperationalContextText = context.type === "MANAGER_DASHBOARD" && !resolvedApartmentId
    ? await buildManagerOperationalContext(context, now)
    : "";

  const intentPrompt = SYSTEM_PROMPTS[intent];
  const actionSuffix = context.role === "MANAGER" ? AI_ACTION_SUFFIX : "";

  const systemPrompt = `
${intentPrompt}${actionSuffix}

Utente: ${context.role} | Dominio rilevato: ${intent}

${managerOperationalContextText ? `CONTESTO OPERATIVO GENERALE\n${managerOperationalContextText}` : ""}

${formattedPerplexityContext ? `
================ RICERCA WEB AGGIORNATA DA PERPLEXITY ================
${formattedPerplexityContext}
================ FINE RICERCA WEB AGGIORNATA DA PERPLEXITY ================
` : ""}

${apartmentAIContextText}

REGOLE GENERALI SUI LINK (sempre valide):
- Usa SEMPRE il valore "linkApribile" esatto dal contesto, non modificarlo mai
- Rendi ogni link cliccabile in Markdown: [Scarica il documento](linkApribile)
- Se il contesto include "markdownLink", copialo esattamente nella risposta
- Non inventare URL, domini o placeholder
- Link YouTube: usa il formato 🎥 [Guarda video](URL)

RICERCA WEB — REGOLA ASSOLUTA:
- Se nel contesto è presente la sezione "RICERCA WEB AGGIORNATA DA PERPLEXITY", DEVI usarla per rispondere alla domanda dell'utente, anche se l'argomento non riguarda gli appartamenti (eventi, meteo, ristoranti, notizie, ecc.).
- In quel caso NON rispondere "Non trovo questa informazione nei dati disponibili" — la risposta è nei risultati web, usali.
- Se la sezione RICERCA WEB non è presente E il dato non è nei dati operativi, allora rispondi: "Non trovo questa informazione nei dati disponibili."
`;

  console.log("[AI FINAL CONTEXT CHECK] prompt contiene ALLEGATI APPARTAMENTO:", systemPrompt.includes("ALLEGATI APPARTAMENTO"));

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (lastUserMessage) {
    await prisma.aIAssistantMessage.create({
      data: {
        role: "USER",
        content: lastUserMessage.content,
        userRole: context.role,
        apartmentId: resolvedApartmentId || null,
        cleaningTaskId: context.cleaningTaskId || null,
        maintenanceTicketId: context.maintenanceTicketId || null,
      },
    });
  }

  console.log("[AI FINAL CONTEXT CHECK]", {
    hasRaffrescamento: systemPrompt.includes("Raffrescamento"),
    hasAcquaCalda: systemPrompt.includes("Acqua calda"),
    hasQuadroElettrico: systemPrompt.includes("Quadro elettrico"),
    hasChiusuraAcqua: systemPrompt.includes("Chiusura acqua"),
    hasChiusuraGas: systemPrompt.includes("Chiusura gas"),
    hasRouterWifi: systemPrompt.includes("Router Wi-Fi"),
    hasLavastoviglie: systemPrompt.includes("Lavastoviglie"),
    hasBox: systemPrompt.includes("Box"),
    systemPromptLength: systemPrompt.length,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,   // risposta deterministica: stessa domanda → stesso risultato
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const answer = response.choices[0].message.content || "";
  const finalAnswer = usedWeb
    ? `🔍 Fonte: ricerca web\n\n${answer}`
    : answer;

  await prisma.aIAssistantMessage.create({
    data: {
      role: "ASSISTANT",
      content: finalAnswer,
      userRole: context.role,
      apartmentId: resolvedApartmentId || null,
      cleaningTaskId: context.cleaningTaskId || null,
      maintenanceTicketId: context.maintenanceTicketId || null,
    },
  });

    return finalAnswer;
  } catch (error) {
    console.error("[AI ERROR]", error);
    return "Non sono riuscito a ricevere una risposta dalla IA. Riprova.";
  }
}
