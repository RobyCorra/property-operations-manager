import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import mammoth from "mammoth";

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const PERSISTENT_STORAGE_ERROR = "Storage persistente non configurato. Configura Vercel Blob.";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

type UploadType = "apartment" | "apartment-wizard" | "maintenance" | "cleaning";

export type StoredAttachmentFile = {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  extractedText: string | null;
};

export type StoreAttachmentFileResult =
  | { success: true; file: StoredAttachmentFile; hasExtractedText: boolean }
  | { success: false; error: string; statusCode: number };

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function hasValidAttachmentFiles(files: File[]) {
  return files.some((file) => file instanceof File && file.size > 0 && Boolean(file.name));
}

function normalizeMimeType(file: File) {
  return file.type || "application/octet-stream";
}

function isSupportedTextFile(mimeType: string) {
  return mimeType === "text/plain";
}

function isSupportedWordFile(mimeType: string) {
  return mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword";
}

async function extractPdfText(buffer: Buffer, filename: string): Promise<string | null> {
  if (process.env.VERCEL === "1") {
    console.warn("[attachments] PDF extraction disabled on Vercel", { filename });
    return null;
  }

  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      const text = result.text.trim();

      if (!text) {
        console.warn("[Upload] PDF without extractable text", { filename, mimeType: "application/pdf" });
        return null;
      }

      return text;
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    console.warn("[attachments] PDF text extraction skipped", {
      filename,
      error: error instanceof Error ? error.message : "Unknown PDF extraction error",
    });
    return null;
  }
}

async function extractText(file: File, mimeType: string, buffer: Buffer) {
  if (mimeType === "application/pdf") {
    return extractPdfText(buffer, file.name);
  }

  if (isSupportedTextFile(mimeType)) {
    const text = buffer.toString("utf8").trim();
    return text || null;
  }

  if (isSupportedWordFile(mimeType)) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value.trim();
      return text || null;
    } catch (error) {
      console.warn("[Upload] Word document text extraction failed", {
        filename: file.name,
        mimeType,
        error: error instanceof Error ? error.message : "Unknown extraction error",
      });
      return null;
    }
  }

  return null;
}

async function extractTextSafely(file: File, mimeType: string, buffer: Buffer) {
  try {
    return await extractText(file, mimeType, buffer);
  } catch (error) {
    console.warn("[Upload] Text extraction failed; attachment will be saved without extracted text", {
      filename: file.name,
      mimeType,
      size: file.size,
      error: error instanceof Error ? error.message : "Unknown extraction error",
    });
    return null;
  }
}

export async function storeAttachmentFile(
  file: File,
  uploadType: UploadType,
  ownerId: string
): Promise<StoreAttachmentFileResult> {
  if (!(file instanceof File) || file.size === 0 || !file.name) {
    return { success: false, error: "Seleziona un file valido.", statusCode: 400 };
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return { success: false, error: "File troppo grande. Dimensione massima: 10 MB.", statusCode: 413 };
  }

  const mimeType = normalizeMimeType(file);
  if (!allowedMimeTypes.has(mimeType)) {
    return { success: false, error: `Tipo file non supportato: ${mimeType}`, statusCode: 415 };
  }

  if (!hasBlobToken()) {
    return { success: false, error: PERSISTENT_STORAGE_ERROR, statusCode: 503 };
  }

  const pathname = `uploads/${uploadType}/${ownerId}/${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name)}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: mimeType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  const canExtract =
    isSupportedTextFile(mimeType) ||
    isSupportedWordFile(mimeType) ||
    (mimeType === "application/pdf" && process.env.VERCEL !== "1");

  let extractedText: string | null = null;
  if (canExtract) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    extractedText = await extractTextSafely(file, mimeType, buffer);
  }

  return {
    success: true,
    hasExtractedText: Boolean(extractedText),
    file: {
      filename: file.name,
      url: blob.url,
      mimeType,
      size: file.size,
      extractedText,
    },
  };
}
