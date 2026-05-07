"use server";

import { prisma } from "@/src/lib/prisma";
import {
  hasValidAttachmentFiles,
  storeAttachmentFile,
} from "@/src/lib/server/attachment-storage";

const apartmentAttachmentCategories = ["MANUAL", "WARRANTY", "PHOTO", "TECHNICAL_SHEET", "INSTALLER_INSTRUCTIONS", "OTHER"];

export async function uploadApartmentWizardAttachment(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Seleziona un file valido." };
  }

  const categoryValue = formData.get("category");
  const category = typeof categoryValue === "string" && apartmentAttachmentCategories.includes(categoryValue)
    ? categoryValue
    : "OTHER";
  const notesValue = formData.get("notes");
  const notes = typeof notesValue === "string" ? notesValue : "";

  const uploadResult = await storeAttachmentFile(file, "apartment-wizard", "temp");
  if (!uploadResult.success) {
    return { success: false, error: uploadResult.error, statusCode: uploadResult.statusCode };
  }
  const storedFile = uploadResult.file;

  return {
    success: true,
    id: null,
    url: storedFile.url,
    hasExtractedText: uploadResult.hasExtractedText,
    attachment: {
      filename: storedFile.filename,
      url: storedFile.url,
      mimeType: storedFile.mimeType,
      size: storedFile.size,
      category,
      notes,
      extractedText: storedFile.extractedText ?? "",
    },
  };
}

export async function uploadMaintenanceAttachment(
  ticketId: string,
  formData: FormData,
  options: { messageId?: string } = {}
) {
  const files = formData.getAll("files") as File[];
  
  if (!files || files.length === 0 || !hasValidAttachmentFiles(files)) {
    console.log(`[Upload] No attachments found for ticket ${ticketId}`);
    return { success: true, count: 0 };
  }

  const attachmentUrls: string[] = [];
  const createdAttachments: any[] = [];

  for (const file of files) {
    // Basic validation
    if (!file || file.size === 0 || !file.name) {
      console.log("[Upload] Skipping empty or invalid attachment");
      continue;
    }

    try {
      const uploadResult = await storeAttachmentFile(file, "maintenance", ticketId);
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error, statusCode: uploadResult.statusCode, count: attachmentUrls.length, urls: attachmentUrls, attachments: createdAttachments };
      }

      const storedFile = uploadResult.file;
      const url = storedFile.url;
      attachmentUrls.push(url);

      // Create database record with metadata
      const attachment = await prisma.$transaction(async (tx) => {
        const createdAttachment = await tx.attachment.create({
          data: {
            url,
            fileName: storedFile.filename,
            fileType: storedFile.mimeType,
            size: storedFile.size,
            category: "OTHER",
            extractedText: storedFile.extractedText,
            maintenanceTicketId: options.messageId ? null : ticketId,
          },
        });

        if (options.messageId) {
          await tx.message.update({
            where: { id: options.messageId },
            data: { attachmentId: createdAttachment.id },
          });
        }

        return createdAttachment;
      });

      createdAttachments.push(attachment);
      console.log("[Upload] Maintenance attachment saved", {
        id: attachment.id,
        filename: attachment.fileName,
        mimeType: attachment.fileType,
        size: file.size,
        uploadType: "maintenance",
      });
    } catch (err) {
      console.error(`[Upload] Failed to process file ${file.name}:`, err);
      return {
        success: false,
        error: "Errore durante il caricamento allegato su storage persistente.",
        count: attachmentUrls.length,
        urls: attachmentUrls,
        attachments: createdAttachments,
      };
    }
  }

  return { 
    success: true, 
    count: attachmentUrls.length, 
    urls: attachmentUrls,
    attachments: createdAttachments,
    id: createdAttachments[0]?.id ?? null,
    url: attachmentUrls[0] ?? null,
    hasExtractedText: createdAttachments.some((attachment) => Boolean(attachment.extractedText)),
  };
}

export async function uploadCleaningAttachment(
  taskId: string,
  formData: FormData,
  options: { messageId?: string } = {}
) {
  const files = formData.getAll("files") as File[];
  
  if (!files || files.length === 0 || !hasValidAttachmentFiles(files)) {
    console.log(`[Upload] No attachments found for cleaning task ${taskId}`);
    return { success: true, count: 0 };
  }

  const attachmentUrls: string[] = [];
  const createdAttachments: any[] = [];

  for (const file of files) {
    // Basic validation
    if (!file || file.size === 0 || !file.name) {
      console.log("[Upload] Skipping empty or invalid attachment");
      continue;
    }

    try {
      const uploadResult = await storeAttachmentFile(file, "cleaning", taskId);
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error, statusCode: uploadResult.statusCode, count: attachmentUrls.length, urls: attachmentUrls, attachments: createdAttachments };
      }

      const storedFile = uploadResult.file;
      const url = storedFile.url;
      attachmentUrls.push(url);

      // Create database record with metadata
      const attachment = await prisma.$transaction(async (tx) => {
        const createdAttachment = await tx.attachment.create({
          data: {
            url,
            fileName: storedFile.filename,
            fileType: storedFile.mimeType,
            size: storedFile.size,
            category: "OTHER",
            extractedText: storedFile.extractedText,
            cleaningTaskId: options.messageId ? null : taskId,
          },
        });

        if (options.messageId) {
          await tx.cleaningTaskMessage.update({
            where: { id: options.messageId },
            data: { attachmentId: createdAttachment.id },
          });
        }

        return createdAttachment;
      });

      createdAttachments.push(attachment);
      console.log("[Upload] Cleaning attachment saved", {
        id: attachment.id,
        filename: attachment.fileName,
        mimeType: attachment.fileType,
        size: file.size,
        uploadType: "cleaning",
      });
    } catch (err) {
      console.error(`[Upload] Failed to process file ${file.name}:`, err);
      return {
        success: false,
        error: "Errore durante il caricamento allegato su storage persistente.",
        count: attachmentUrls.length,
        urls: attachmentUrls,
        attachments: createdAttachments,
      };
    }
  }

  return { 
    success: true, 
    count: attachmentUrls.length, 
    urls: attachmentUrls,
    attachments: createdAttachments,
    id: createdAttachments[0]?.id ?? null,
    url: attachmentUrls[0] ?? null,
    hasExtractedText: createdAttachments.some((attachment) => Boolean(attachment.extractedText)),
  };
}
