"use server";

import OpenAI from "openai";
import { prisma } from "@/src/lib/prisma";

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

function formatAttachmentLines(attachments: unknown, maxExtractedText = 300) {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .filter((attachment) => attachment && typeof attachment === "object" && !Array.isArray(attachment))
    .map((attachment) => {
      const item = attachment as Record<string, unknown>;
      return `allegato: ${stringField(item.filename) || "n/d"} | category: ${stringField(item.category) || "n/d"} | url: ${stringField(item.url) || "n/d"} | notes: ${truncateText(stringField(item.notes), 180) || "n/d"} | extractedText: ${truncateText(stringField(item.extractedText), maxExtractedText) || "n/d"}`;
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
  const persistedAttachmentLines = apartmentAttachments.map((attachment) => (
    `- allegato tecnico: ${attachment.filename} | category: ${attachment.category} | url: ${attachment.url || "n/d"} | notes: ${truncateText(attachment.notes, 180) || "n/d"} | extractedText: ${truncateText(attachment.extractedText, 400) || "n/d"}`
  ));

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

export async function askAI(messages: AIMessage[], context: AIContext) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const historySince = new Date();
  historySince.setDate(historySince.getDate() - HISTORY_DAYS);

  const [apartment, maintenanceTickets, cleaningTasks, aiAssistantMessages, apartmentAttachments] = context.apartmentId
    ? await Promise.all([
        prisma.apartment.findUnique({
          where: { id: context.apartmentId },
        }),
        prisma.maintenanceTicket.findMany({
          where: {
            apartmentId: context.apartmentId,
            createdAt: { gte: historySince },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            createdAt: true,
            status: true,
            priority: true,
            title: true,
            description: true,
          },
        }),
        prisma.cleaningTask.findMany({
          where: {
            apartmentId: context.apartmentId,
            date: { gte: historySince },
          },
          orderBy: { date: "desc" },
          take: 10,
          select: {
            date: true,
            status: true,
            notes: true,
          },
        }),
        prisma.aIAssistantMessage.findMany({
          where: {
            apartmentId: context.apartmentId,
            createdAt: { gte: historySince },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            createdAt: true,
            role: true,
            content: true,
          },
        }),
        prisma.apartmentAttachment.findMany({
          where: {
            apartmentId: context.apartmentId,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            filename: true,
            url: true,
            category: true,
            notes: true,
            extractedText: true,
          },
        }),
      ])
    : [null, [], [], [], []];

  const technicalProfileText = formatTechnicalProfile(apartment?.technicalProfile);
  const structuredTechnicalKnowledgeText = formatStructuredTechnicalKnowledge({
    technicalProfile: apartment?.technicalProfile,
    apartmentAttachments,
  });
  const operationalHistoryText = formatOperationalHistory({
    maintenanceTickets,
    cleaningTasks,
    aiAssistantMessages,
  });

  const systemPrompt = `
Sei un assistente operativo per case vacanza.

Utente: ${context.role}
Tipo intervento: ${context.type}

DATI APPARTAMENTO:
${technicalProfileText}

${structuredTechnicalKnowledgeText}

${operationalHistoryText}

ISTRUZIONI:
- Usa SEMPRE questi dati se rilevanti
- Non rispondere in modo generico se hai informazioni
- Se conosci il sistema, rispondi direttamente
- Se il problema attuale è simile allo storico, segnala "Possibile problema ricorrente"
- Se non ci sono elementi simili, non inventare ricorrenze

Rispondi:
- massimo 5 punti
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
        apartmentId: context.apartmentId || null,
        cleaningTaskId: context.cleaningTaskId || null,
        maintenanceTicketId: context.maintenanceTicketId || null,
      },
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const answer = response.choices[0].message.content || "";

  await prisma.aIAssistantMessage.create({
    data: {
      role: "ASSISTANT",
      content: answer,
      userRole: context.role,
      apartmentId: context.apartmentId || null,
      cleaningTaskId: context.cleaningTaskId || null,
      maintenanceTicketId: context.maintenanceTicketId || null,
    },
  });

  return answer;
}
