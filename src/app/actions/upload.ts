"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/src/lib/prisma";

export async function uploadMaintenanceAttachment(ticketId: string, formData: FormData) {
  const files = formData.getAll("files") as File[];
  
  if (!files || files.length === 0) {
    console.log(`[Upload] No files found for ticket ${ticketId}`);
    return { success: true, count: 0 };
  }

  // Ensure directories exist
  const baseUploadDir = join(process.cwd(), "public", "uploads", "maintenance");
  const ticketUploadDir = join(baseUploadDir, ticketId);
  
  try {
    console.log(`[Upload] Ensuring directory exists: ${ticketUploadDir}`);
    await mkdir(ticketUploadDir, { recursive: true });
  } catch (err) {
    console.error(`[Upload] Error creating directory:`, err);
  }

  const attachmentUrls: string[] = [];
  const createdAttachments: any[] = [];

  for (const file of files) {
    // Basic validation
    if (!file || file.size === 0 || !file.name) {
      console.log(`[Upload] Skipping empty or invalid file`);
      continue;
    }

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize fileName
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${Date.now()}-${sanitizedName}`;
      const path = join(ticketUploadDir, fileName);
      
      console.log(`[Upload] Writing file to: ${path}`);
      await writeFile(path, buffer);
      
      const url = `/uploads/maintenance/${ticketId}/${fileName}`;
      attachmentUrls.push(url);

      // Create database record with metadata
      const attachment = await prisma.attachment.create({
        data: {
          url,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          maintenanceTicketId: ticketId,
        },
      });
      
      createdAttachments.push(attachment);
      console.log(`[Upload] Successfully saved: ${url}`);
    } catch (err) {
      console.error(`[Upload] Failed to process file ${file.name}:`, err);
    }
  }

  return { 
    success: true, 
    count: attachmentUrls.length, 
    urls: attachmentUrls,
    attachments: createdAttachments 
  };
}

export async function uploadCleaningAttachment(taskId: string, formData: FormData) {
  const files = formData.getAll("files") as File[];
  
  if (!files || files.length === 0) {
    console.log(`[Upload] No files found for cleaning task ${taskId}`);
    return { success: true, count: 0 };
  }

  // Ensure directories exist
  const baseUploadDir = join(process.cwd(), "public", "uploads", "cleaning");
  const taskUploadDir = join(baseUploadDir, taskId);
  
  try {
    console.log(`[Upload] Ensuring directory exists: ${taskUploadDir}`);
    await mkdir(taskUploadDir, { recursive: true });
  } catch (err) {
    console.error(`[Upload] Error creating directory:`, err);
  }

  const attachmentUrls: string[] = [];
  const createdAttachments: any[] = [];

  for (const file of files) {
    // Basic validation
    if (!file || file.size === 0 || !file.name) {
      console.log(`[Upload] Skipping empty or invalid file`);
      continue;
    }

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize fileName
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${Date.now()}-${sanitizedName}`;
      const path = join(taskUploadDir, fileName);
      
      console.log(`[Upload] Writing file to: ${path}`);
      await writeFile(path, buffer);
      
      const url = `/uploads/cleaning/${taskId}/${fileName}`;
      attachmentUrls.push(url);

      // Create database record with metadata
      const attachment = await prisma.attachment.create({
        data: {
          url,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          cleaningTaskId: taskId,
        },
      });
      
      createdAttachments.push(attachment);
      console.log(`[Upload] Successfully saved: ${url}`);
    } catch (err) {
      console.error(`[Upload] Failed to process file ${file.name}:`, err);
    }
  }

  return { 
    success: true, 
    count: attachmentUrls.length, 
    urls: attachmentUrls,
    attachments: createdAttachments 
  };
}
