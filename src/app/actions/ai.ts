
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


const HISTORY_DAYS = 90;
const MAX_HISTORY_TEXT_LENGTH = 5000;
const MAX_TECHNICAL_KNOWLEDGE_TEXT_LENGTH = 5000;
const MAX_MANAGER_CONTEXT_TEXT_LENGTH = 14000;
const MAX_APARTMENT_AI_CONTEXT_TEXT_LENGTH = 45000;
const MAX_SECTION_TEXT_LENGTH = 5000;

function isInternalOperationalQuestion(question: string) {
  const q = question.toLowerCase();

  return (
    q.includes("manuale") ||
    q.includes("documento") ||
    q.includes("allegato") ||
    q.includes("scheda tecnica") ||
    q.includes("impianto") ||
    q.includes("climatizzazione") ||
    q.includes("condizionatore") ||
    q.includes("elettrodomestico") ||
    q.includes("appartamento") ||
    q.includes("trastevere")
  );
}

function shouldUseWebSearch(question: string) {
  if (isInternalOperationalQuestion(question)) {
    return false;
  }

  const q = question.toLowerCase();
  const webSearchTriggers = [
    "cerca online",
    "cerca sul web",
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
  ];

  return webSearchTriggers.some((trigger) => q.includes(trigger));
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

  const profileText = JSON.stringify(compactProfile, null, 2);

  if (profileText.length <= 4000) {
    return profileText;
  }

  return `${profileText.slice(0, 4000)}\n...scheda tecnica abbreviata per lunghezza.`;
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
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
      return `allegato: ${stringField(item.filename) || "n/d"} | Documento interno caricato nella scheda appartamento | category: ${stringField(item.category) || "n/d"} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | notes: ${truncateText(stringField(item.notes), 180) || "n/d"} | extractedText: ${truncateText(stringField(item.extractedText), maxExtractedText) || "n/d"}`;
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
    notes: string | null;
    extractedText: string | null;
  }[];
}) {
  const generalAttachmentLines = formatAttachmentLines(arraySection(technicalProfile, "generalAttachments"), 400).map((line) => `- ${line}`);
  const persistedAttachmentLines = apartmentAttachments.map((attachment) => {
    const linkApribile = formatInternalFileUrl(attachment.url);
    return `- allegato tecnico: ${attachment.filename} | Documento interno caricato nella scheda appartamento | category: ${attachment.category} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | notes: ${truncateText(attachment.notes, 180) || "n/d"} | extractedText: ${truncateText(attachment.extractedText, 400) || "n/d"}`;
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
  return value ? value.toISOString().slice(0, 16).replace("T", " ") : "n/d";
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
    createdAt: Date;
  }[]
) {
  if (attachments.length === 0) {
    return "nessun allegato";
  }

  return attachments
    .map((attachment) => {
      const linkApribile = formatInternalFileUrl(attachment.url);
      return `${attachment.fileName} | Documento interno caricato nella scheda appartamento | tipo: ${attachment.fileType || "n/d"} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | data: ${formatDate(attachment.createdAt)}`;
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
      const extractedText = attachment.extractedText
        ? truncateText(attachment.extractedText, 900)
        : "Allegato presente, testo non estratto o non leggibile direttamente.";

      return `- ${attachment.filename} | tipo: ${attachment.mimeType || "n/d"} | categoria: ${attachment.category} | dimensione: ${attachment.size ?? "n/d"} | data: ${formatDate(attachment.createdAt)} | descrizione/note: ${truncateText(attachment.notes, 220) || "n/d"} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | testo estratto: ${extractedText}`;
    })
    .join("\n");
}

function formatOperationalDocuments(
  attachments: {
    fileName: string;
    fileType: string | null;
    url: string;
    createdAt: Date;
  }[]
) {
  if (attachments.length === 0) {
    return "nessun allegato";
  }

  return attachments
    .map((attachment) => {
      const linkApribile = formatInternalFileUrl(attachment.url);
      return `${attachment.fileName} | tipo: ${attachment.fileType || "n/d"} | data: ${formatDate(attachment.createdAt)} | linkApribile: ${linkApribile} | markdownLink: ${formatInternalMarkdownLink(linkApribile)} | testo estratto: Allegato presente, testo non estratto o non leggibile direttamente`;
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

  const excluded = new Set(["systems", "appliances", "smartHome", "products", "recurringIssues", "generalAttachments"]);
  const lines = Object.entries(technicalProfile as Record<string, unknown>)
    .filter(([key]) => !excluded.has(key))
    .map(([key, value]) => `- ${key}: ${formatNullable(value, 1200)}`);

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

export async function buildApartmentAIContext(apartmentId: string) {
  const now = new Date();

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    include: {
      apartmentAttachments: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      checklistItems: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        take: 100,
      },
      bookings: {
        orderBy: { checkInDate: "desc" },
        take: 60,
      },
      cleaningTasks: {
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
              attachment: { select: { fileName: true, fileType: true, url: true, createdAt: true } },
            },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
            take: 20,
            select: { fileName: true, fileType: true, url: true, createdAt: true },
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
              attachment: { select: { fileName: true, fileType: true, url: true, createdAt: true } },
            },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
            take: 20,
            select: { fileName: true, fileType: true, url: true, createdAt: true },
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

  const checklistLines = apartment.checklistItems.map((item) => (
    `- ${item.order}. ${item.label} | obbligatorio: ${item.required ? "si" : "no"} | tipo: ${item.type} | formula: ${item.formula || "n/d"}`
  ));

  const bookingLines = apartment.bookings.map((booking) => (
    `- ${formatDate(booking.checkInDate)} -> ${formatDate(booking.checkOutDate)} | ospite: ${booking.guestName || "n/d"} | ospiti: ${booking.totalGuests} | stato: ${booking.status || "n/d"} | fonte: ${booking.source || "manuale"} | externalId: ${booking.externalId || "n/d"}`
  ));

  const cleaningLines = apartment.cleaningTasks.map((task) => {
    const messageLines = task.messages.map((message) => {
      const attachment = message.attachment
        ? ` | allegato messaggio: ${formatOperationalDocuments([message.attachment])}`
        : "";

      return `${formatDateTime(message.createdAt)} ${message.senderName} (${message.role}): ${truncateText(message.text, 220) || "n/d"}${attachment}`;
    });

    return `- ${formatDate(task.date)} | stato: ${task.status} | creata: ${formatDateTime(task.createdAt)} | assegnato: ${task.assignedTo?.name || "non assegnato"} (${task.assignedTo?.role || "n/d"}) | booking: ${task.booking?.guestName || "n/d"} ${task.booking ? `${formatDate(task.booking.checkInDate)} -> ${formatDate(task.booking.checkOutDate)} fonte ${task.booking.source || "n/d"}` : ""} | note: ${truncateText(task.notes, 300) || "n/d"} | checklistProgress: ${compactJsonText(task.checklistProgress, 1200)} | allegati: ${formatOperationalDocuments(task.attachments)} | messaggi: ${messageLines.length > 0 ? messageLines.join(" || ") : "nessun messaggio"} | richieste IA: ${formatAIMessages(task.aiAssistantMessages)}`;
  });

  const ticketLines = apartment.maintenanceTickets.map((ticket) => {
    const messageLines = ticket.messages.map((message) => {
      const attachment = message.attachment
        ? ` | allegato messaggio: ${formatOperationalDocuments([message.attachment])}`
        : "";

      return `${formatDateTime(message.createdAt)} ${message.senderName} (${message.role}): ${truncateText(message.text, 220) || "n/d"}${attachment}`;
    });

    return `- ${formatDate(ticket.createdAt)} | titolo: ${ticket.title} | stato: ${ticket.status} | priorita: ${ticket.priority} | descrizione problema: ${truncateText(ticket.description, 450) || "n/d"} | assegnato: ${ticket.assignedTo?.name || "non assegnato"} (${ticket.assignedTo?.role || "n/d"}) | programmato: ${formatDateTime(ticket.scheduledStart)} -> ${formatDateTime(ticket.scheduledEnd)} | avviato: ${formatDateTime(ticket.startedAt)} | risolto/soluzione: ${formatDateTime(ticket.resolvedAt)} | allegati: ${formatOperationalDocuments(ticket.attachments)} | messaggi/chat: ${messageLines.length > 0 ? messageLines.join(" || ") : "nessun messaggio"} | richieste IA: ${formatAIMessages(ticket.aiAssistantMessages)}`;
  });

  const operationalSummaryText = formatOperationalHistory({
    maintenanceTickets: apartment.maintenanceTickets.map((ticket) => ({
      createdAt: ticket.createdAt,
      status: ticket.status,
      priority: ticket.priority,
      title: ticket.title,
      description: ticket.description,
    })),
    cleaningTasks: apartment.cleaningTasks.map((task) => ({
      date: task.date,
      status: task.status,
      notes: task.notes,
    })),
    aiAssistantMessages: apartment.aiAssistantMessages.map((message) => ({
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

  const cleaningAICount = apartment.cleaningTasks.reduce((total, task) => total + task.aiAssistantMessages.length, 0);
  const maintenanceAICount = apartment.maintenanceTickets.reduce((total, ticket) => total + ticket.aiAssistantMessages.length, 0);
  const cleaningAttachmentCount = apartment.cleaningTasks.reduce((total, task) => total + task.attachments.length, 0);
  const maintenanceAttachmentCount = apartment.maintenanceTickets.reduce((total, ticket) => total + ticket.attachments.length, 0);
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

  const contextText = `
DATI COMPLETI APPARTAMENTO
Stato operativo calcolato: ${status.label} (${status.reason})
${apartmentBaseText}

${formatCompleteTechnicalProfileForAI(apartment.technicalProfile)}

DOCUMENTI E ALLEGATI
${limitSection(formatApartmentDocumentLines(apartment.apartmentAttachments), 4500)}

CHECKLIST / NOTE OPERATIVE MASTER
${checklistLines.length > 0 ? checklistLines.join("\n") : "- Nessuna checklist master registrata."}

PRENOTAZIONI COLLEGATE
${limitSection(bookingLines.length > 0 ? bookingLines.join("\n") : "- Nessuna prenotazione caricata.", 3500)}

SINTESI OPERATIVA
${operationalSummaryText}

STORICO PULIZIE
${limitSection(cleaningLines.length > 0 ? cleaningLines.join("\n") : "- Nessuna pulizia caricata.", 6500)}

MESSAGGI E RICHIESTE IA PULIZIE
${limitSection(apartment.cleaningTasks.flatMap((task) => task.aiAssistantMessages.map((message) => `- Pulizia ${formatDate(task.date)} | ${formatDateTime(message.createdAt)} ${message.role} (${message.userRole}): ${truncateText(message.content, 260) || "n/d"}`)).join("\n") || "- Nessuna richiesta IA collegata alle pulizie.", 3500)}

STORICO MANUTENZIONI
${limitSection(ticketLines.length > 0 ? ticketLines.join("\n") : "- Nessuna manutenzione caricata.", 6500)}

MESSAGGI E RICHIESTE IA MANUTENZIONI
${limitSection(apartment.maintenanceTickets.flatMap((ticket) => ticket.aiAssistantMessages.map((message) => `- Ticket ${ticket.title} | ${formatDateTime(message.createdAt)} ${message.role} (${message.userRole}): ${truncateText(message.content, 260) || "n/d"}`)).join("\n") || "- Nessuna richiesta IA collegata alle manutenzioni.", 3500)}

STORICO CONVERSAZIONI IA APPARTAMENTO
${limitSection(apartment.aiAssistantMessages.map((message) => `- ${formatDateTime(message.createdAt)} ${message.role} (${message.userRole}): ${truncateText(message.content, 300) || "n/d"}`).join("\n") || "- Nessuna conversazione IA diretta sull'appartamento.", 4000)}
`.trim();

  return limitText(contextText, MAX_APARTMENT_AI_CONTEXT_TEXT_LENGTH);
}

async function buildApartmentManagerContext(apartmentId: string, now: Date) {
  const historySince = addDays(now, -HISTORY_DAYS);
  const futureUntil = addDays(now, 30);

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
          notes: true,
          extractedText: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      },
      bookings: {
        where: {
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
            select: { fileName: true, fileType: true, url: true, createdAt: true },
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
            select: { fileName: true, fileType: true, url: true, createdAt: true },
          },
        },
      },
    },
  });

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

  const bookingLines = apartment.bookings.map((booking) => (
    `- ${formatDate(booking.checkInDate)} -> ${formatDate(booking.checkOutDate)} | ospite: ${booking.guestName || "n/d"} | ospiti: ${booking.totalGuests} | stato: ${booking.status || "n/d"} | fonte: ${booking.source || "n/d"}`
  ));

  const cleaningLines = apartment.cleaningTasks.map((task) => (
    `- ${formatDate(task.date)} | stato: ${task.status} | assegnato: ${task.assignedTo?.name || "non assegnato"} | note: ${truncateText(task.notes, 180) || "n/d"} | checklist: ${compactJsonText(task.checklistProgress, 500)} | booking: ${task.booking?.guestName || "n/d"} | messaggi: ${formatManagerMessages(task.messages)} | allegati: ${formatOperationalAttachmentLines(task.attachments)}`
  ));

  const ticketLines = apartment.maintenanceTickets.map((ticket) => (
    `- ${formatDate(ticket.createdAt)} | ${ticket.priority} | ${ticket.status} | ${ticket.title} | descrizione: ${truncateText(ticket.description, 220)} | tecnico: ${ticket.assignedTo?.name || "non assegnato"} | programmato: ${formatDateTime(ticket.scheduledStart)} | risolto: ${formatDateTime(ticket.resolvedAt)} | messaggi: ${formatManagerMessages(ticket.messages)} | allegati: ${formatOperationalAttachmentLines(ticket.attachments)}`
  ));

  const attachmentLines = apartment.apartmentAttachments.map((attachment) => {
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
- Istruzioni accesso: ${truncateText(apartment.accessInstructions, 220) || "n/d"}

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
`.trim();

  return limitText(contextText, MAX_MANAGER_CONTEXT_TEXT_LENGTH);
}

async function buildGeneralManagerContext(now: Date) {
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const next7Days = addDays(todayStart, 7);
  const windowStart = addDays(todayStart, -30);
  const windowEnd = addDays(todayStart, 30);
  const recent14Days = addDays(todayStart, -14);

  const [apartments, bookings, cleanings, tickets] = await Promise.all([
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
          { status: { in: ["PENDING", "IN_PROGRESS"] } },
          { date: { gte: recent14Days } },
        ],
      },
      orderBy: { date: "desc" },
      take: 30,
      include: {
        apartment: { select: { id: true, name: true, address: true } },
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
          select: { fileName: true, fileType: true, url: true, createdAt: true },
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
        assignedTo: { select: { name: true, role: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { createdAt: true, role: true, senderName: true, text: true },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { fileName: true, fileType: true, url: true, createdAt: true },
        },
      },
    }),
  ]);

  const apartmentLines = apartments.map((apartment) => {
    const apartmentBookings = bookings.filter((booking) => booking.apartmentId === apartment.id);
    const apartmentCleanings = cleanings.filter((task) => task.apartmentId === apartment.id);
    const apartmentTickets = tickets.filter((ticket) => ticket.apartmentId === apartment.id);
    const status = getApartmentOperationalStatus(
      now,
      apartmentBookings,
      apartmentCleanings,
      apartmentTickets,
      { now, apartmentId: apartment.id }
    );
    const attachmentSummary = apartment.apartmentAttachments
      .map((attachment) => {
        const linkApribile = formatInternalFileUrl(attachment.url);
        return `${attachment.filename} (${attachment.category}) Documento interno caricato nella scheda appartamento linkApribile: ${linkApribile} markdownLink: ${formatInternalMarkdownLink(linkApribile)} note: ${truncateText(attachment.notes, 80) || "n/d"} extractedText: ${truncateText(attachment.extractedText, 120) || "n/d"}`;
      })
      .join(" || ");

    return `- ${apartment.name} | ${apartment.address} | stato: ${status.label} (${status.reason}) | base: ${apartment.maxGuests} ospiti, ${apartment.bedrooms} camere, ${apartment.bathrooms} bagni, ${apartment.squareMeters} mq | technicalProfile: ${compactJsonText(apartment.technicalProfile, 900)} | prodotti: ${truncateText(formatLegacyProductsSection(apartment.technicalProfile), 400)} | allegati: ${attachmentSummary || "nessun allegato"}`;
  });

  const checkinsToday = bookings.filter((booking) => formatDateKey(booking.checkInDate) === formatDateKey(todayStart));
  const checkoutsToday = bookings.filter((booking) => formatDateKey(booking.checkOutDate) === formatDateKey(todayStart));
  const upcomingCheckins = bookings.filter((booking) => booking.checkInDate >= tomorrowStart && booking.checkInDate < next7Days);
  const activeBookings = bookings.filter((booking) => booking.checkInDate <= now && booking.checkOutDate > now);

  const bookingLine = (booking: (typeof bookings)[number]) => (
    `- ${booking.apartment.name} | ospite: ${booking.guestName || "n/d"} | ${formatDate(booking.checkInDate)} -> ${formatDate(booking.checkOutDate)} | ospiti: ${booking.totalGuests} | stato: ${booking.status || "n/d"} | fonte: ${booking.source || "n/d"}`
  );

  const cleaningLines = cleanings.map((task) => (
    `- ${task.apartment.name} | ${formatDate(task.date)} | stato: ${task.status} | assegnato: ${task.assignedTo?.name || "non assegnato"} | note: ${truncateText(task.notes, 160) || "n/d"} | checklist: ${compactJsonText(task.checklistProgress, 450)} | booking: ${task.booking?.guestName || "n/d"} (${task.booking?.totalGuests ?? "n/d"} ospiti) | messaggi: ${formatManagerMessages(task.messages)} | allegati: ${formatOperationalAttachmentLines(task.attachments)}`
  ));

  const ticketLines = tickets.map((ticket) => (
    `- ${ticket.apartment.name} | ${formatDate(ticket.createdAt)} | ${ticket.priority} | ${ticket.status} | ${ticket.title} | descrizione: ${truncateText(ticket.description, 220)} | tecnico: ${ticket.assignedTo?.name || "non assegnato"} | programmato: ${formatDateTime(ticket.scheduledStart)} | risolto: ${formatDateTime(ticket.resolvedAt)} | messaggi: ${formatManagerMessages(ticket.messages)} | allegati: ${formatOperationalAttachmentLines(ticket.attachments)}`
  ));

  const recentMessageLines = [
    ...cleanings.flatMap((task) => task.messages.map((message) => (
      `- Pulizia | ${task.apartment.name} | ${formatDateTime(message.createdAt)} | ${message.senderName} (${message.role}): ${truncateText(message.text, 160) || "n/d"}`
    ))),
    ...tickets.flatMap((ticket) => ticket.messages.map((message) => (
      `- Manutenzione | ${ticket.apartment.name} | ${ticket.title} | ${formatDateTime(message.createdAt)} | ${message.senderName} (${message.role}): ${truncateText(message.text, 160) || "n/d"}`
    ))),
  ]
    .slice(0, 40);

  const recurringIssueLines = apartments
    .flatMap((apartment) => arraySection(apartment.technicalProfile, "recurringIssues").map((issue) => (
      `- ${apartment.name} | ${stringField(issue.title) || "Problema ricorrente"} | sintomi: ${truncateText(stringField(issue.symptoms), 160) || "n/d"} | soluzione: ${truncateText(stringField(issue.solution), 160) || "n/d"} | note IA: ${truncateText(stringField(issue.notesForAI), 160) || "n/d"}`
    )))
    .slice(0, 30);

  const contextText = `
CONTESTO OPERATIVO MANAGER
Modalita: contesto generale
Periodo prenotazioni: ultimi/prossimi 30 giorni. Pulizie e ticket: aperti/in corso o ultimi 14 giorni. Limiti applicati per sicurezza.

STATO APPARTAMENTI
${apartmentLines.length > 0 ? apartmentLines.join("\n") : "- Nessun appartamento trovato."}

CHECK-IN OGGI
${checkinsToday.length > 0 ? checkinsToday.map(bookingLine).join("\n") : "- Nessun check-in oggi."}

CHECK-OUT OGGI
${checkoutsToday.length > 0 ? checkoutsToday.map(bookingLine).join("\n") : "- Nessun check-out oggi."}

PROSSIMI CHECK-IN 7 GIORNI
${upcomingCheckins.length > 0 ? upcomingCheckins.map(bookingLine).join("\n") : "- Nessun check-in nei prossimi 7 giorni."}

PRENOTAZIONI ATTIVE OGGI
${activeBookings.length > 0 ? activeBookings.map(bookingLine).join("\n") : "- Nessuna prenotazione attiva ora."}

PULIZIE OPERATIVE
${cleaningLines.length > 0 ? cleaningLines.join("\n") : "- Nessuna pulizia operativa nel periodo caricato."}

MANUTENZIONI OPERATIVE
${ticketLines.length > 0 ? ticketLines.join("\n") : "- Nessuna manutenzione operativa nel periodo caricato."}

MESSAGGI OPERATIVI RECENTI
${recentMessageLines.length > 0 ? recentMessageLines.join("\n") : "- Nessun messaggio operativo recente nei dati caricati."}

PROBLEMI RICORRENTI DA SCHEDE TECNICHE
${recurringIssueLines.length > 0 ? recurringIssueLines.join("\n") : "- Nessun problema ricorrente registrato nelle schede tecniche caricate."}
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
    const resolvedApartmentId = await resolveApartmentIdFromAIContext(context, userMessage);

  console.log("[DEBUG AI] apartmentId ricevuto:", context.apartmentId || "n/d");
  console.log("[DEBUG AI] apartmentId risolto:", resolvedApartmentId || "n/d");

  const isInternalQuery = /appartamento|scheda|impianti|elettrodomestici|domotica|pulizie|manutenzione|booking|ospiti|check-in|check-out/i.test(userMessage);
  const isRealWebSearchQuery = shouldUseWebSearch(userMessage);
  const shouldUsePerplexity =
    context.type === "MANAGER_DASHBOARD"
      ? !isInternalQuery || isRealWebSearchQuery
      : false;
  let perplexityContext: string | null = null;
  let usedWeb = false;

  console.log("[PERPLEXITY FINAL DECISION]", {
    isInternalQuery,
    shouldUsePerplexity,
    contextType: context.type,
  });

  console.log("[PERPLEXITY DEBUG]", {
    enabled: Boolean(process.env.PERPLEXITY_API_KEY),
    contextType: context.type,
    shouldUsePerplexity,
    query: userMessage.slice(0, 200),
  });

  if (shouldUsePerplexity) {
    perplexityContext = await askPerplexitySearch(userMessage);
    usedWeb = Boolean(perplexityContext);
  }

  console.log("[PERPLEXITY RESULT]", {
    used: Boolean(perplexityContext),
    length: perplexityContext?.length ?? 0,
  });
  console.log("[PERPLEXITY RAW OUTPUT]", perplexityContext?.slice(0, 500));
  const formattedPerplexityContext = perplexityContext
    ? formatLinksAsMarkdown(perplexityContext)
    : null;

  const now = new Date();
  const apartmentAIContextText = resolvedApartmentId
    ? await buildApartmentAIContext(resolvedApartmentId)
    : "CONTESTO COMPLETO APPARTAMENTO\n- Nessun apartmentId disponibile o risolvibile dal contesto della chat.";
  const managerOperationalContextText = context.type === "MANAGER_DASHBOARD" && !resolvedApartmentId
    ? await buildManagerOperationalContext(context, now)
    : "";

  const systemPrompt = `
Sei un assistente operativo per case vacanza.

Utente: ${context.role}
Tipo intervento: ${context.type}

${managerOperationalContextText}

${formattedPerplexityContext ? `
================ RICERCA WEB AGGIORNATA DA PERPLEXITY ================
${formattedPerplexityContext}
================ FINE RICERCA WEB AGGIORNATA DA PERPLEXITY ================
` : ""}

${apartmentAIContextText}

ISTRUZIONI:
- Se è presente la sezione RICERCA WEB AGGIORNATA DA PERPLEXITY, DEVI usarla per rispondere.
- Non ignorare le informazioni della sezione RICERCA WEB AGGIORNATA DA PERPLEXITY.
- Se la domanda richiede link, video, tutorial, guide o risorse esterne, devi includerli se presenti nella ricerca web.
- Se disponibili, restituisci link diretti presenti nei dati, per esempio YouTube o pagine tutorial.
- Quando includi link nella risposta, devono essere sempre formattati in Markdown, esempio: [Apri video](https://youtube.com/...)
- Se includi link YouTube o youtu.be, usa il formato: 🎥 [Guarda video](URL)
- Non mostrare URL nudi nella risposta finale.
- Se la sezione RICERCA WEB AGGIORNATA DA PERPLEXITY esiste, NON rispondere "Non trovo questa informazione nei dati disponibili" per richieste web, video, tutorial, link o guide.
- Usa SEMPRE questi dati se rilevanti
- Non rispondere in modo generico se hai informazioni
- Se conosci il sistema, rispondi direttamente
- Se il problema attuale è simile allo storico, segnala "Possibile problema ricorrente"
- Se non ci sono elementi simili, non inventare ricorrenze
- Se il dato richiesto non è presente nel contesto, rispondi chiaramente: "Non trovo questa informazione nei dati disponibili."
- Per il manager dai priorità operative, rischi e prossime azioni
- Se trovi allegati, manuali o documenti nel contesto interno, specifica che sono documenti caricati nella scheda appartamento
- Se un allegato interno ha url relativo che inizia con /uploads/, puoi mostrarlo come link interno disponibile dalla cartella pubblica uploads
- Quando citi documenti interni, mantieni il link esattamente come fornito nel contesto
- Quando mostri un documento interno, usa ESATTAMENTE il valore "linkApribile" presente nel contesto
- Quando mostri un documento interno, rendi sempre il link cliccabile in Markdown: [Scarica il documento](linkApribile)
- Usa esattamente il valore linkApribile presente nel contesto
- Se nel contesto è presente markdownLink, copialo esattamente nella risposta
- Non mostrare il link come testo semplice
- Non modificare mai il linkApribile
- Non sostituire mai il dominio dei link interni e non trasformare /uploads/ in un dominio esterno
- Non inventare domini per i documenti interni
- Non inventare domini esterni o placeholder per i documenti interni
- Se il documento è in /uploads/, presentalo come documento interno caricato nella scheda appartamento
- Se il link inizia con /uploads/ oppure http://localhost:3000/uploads/, presentalo come link apribile
- Se linkApribile inizia con http://localhost:3000/uploads/, usalo esattamente così
- Per manuali, allegati, documenti, schede tecniche, impianti, climatizzazione, condizionatori o elettrodomestici NON usare Perplexity

ISTRUZIONI AGGIUNTIVE:
- Se nel contesto sono presenti DOCUMENTI / ALLEGATI APPARTAMENTO e la domanda riguarda manuali, documenti o impianti, devi SEMPRE mostrare i documenti disponibili
- Non rispondere "Non trovo questa informazione" se esiste almeno un allegato
- Quando presenti un documento, scrivi che è un documento interno, mostra il nome file e usa il markdownLink se presente
- Non cercare manuali interni sul web
- Se non trovi il documento esatto ma esistono allegati, mostra comunque quelli disponibili come alternativa
- Se l'utente chiede una lista completa, non riassumere
- Se l'utente chiede una lista completa, non omettere elementi
- Se l'utente chiede una lista completa, elenca tutti gli elementi presenti nel contesto
- Se la domanda chiede impianti, elettrodomestici e domotica, devi riportare ogni elemento di IMPIANTI, ELETTRODOMESTICI e DOMOTICA presente nella sezione SCHEDA TECNICA COMPLETA

Rispondi:
- massimo 5 punti
- se l'utente chiede un riepilogo completo della scheda tecnica, includi tutti gli elementi di IMPIANTI, ELETTRODOMESTICI, DOMOTICA, PRODOTTI e PROBLEMI RICORRENTI presenti nel contesto, anche se superi 5 punti
- pratico
- niente teoria

Se serve:
- suggerisci aprire ticket
- suggerisci segnalare al manager
`;

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
