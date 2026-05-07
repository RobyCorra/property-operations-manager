ALTER TABLE "Attachment" ADD COLUMN "size" INTEGER;
ALTER TABLE "Attachment" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'OTHER';
ALTER TABLE "Attachment" ADD COLUMN "extractedText" TEXT;

CREATE INDEX "Attachment_maintenanceTicketId_idx" ON "Attachment"("maintenanceTicketId");
CREATE INDEX "Attachment_cleaningTaskId_idx" ON "Attachment"("cleaningTaskId");
CREATE INDEX "Attachment_category_idx" ON "Attachment"("category");
