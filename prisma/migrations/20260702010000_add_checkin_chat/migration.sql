-- AlterTable: Attachment collegabile anche a una CheckinTask
ALTER TABLE "Attachment" ADD COLUMN "checkinTaskId" TEXT;

-- CreateTable: CheckinTaskMessage (chat del check-in)
CREATE TABLE "CheckinTaskMessage" (
    "id" TEXT NOT NULL,
    "text" TEXT,
    "role" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkinTaskId" TEXT NOT NULL,
    "attachmentId" TEXT,
    "readByManagerAt" TIMESTAMP(3),
    "readByWorkerAt" TIMESTAMP(3),

    CONSTRAINT "CheckinTaskMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attachment_checkinTaskId_idx" ON "Attachment"("checkinTaskId");

-- AddForeignKey: Attachment → CheckinTask
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_checkinTaskId_fkey"
    FOREIGN KEY ("checkinTaskId") REFERENCES "CheckinTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CheckinTaskMessage → CheckinTask
ALTER TABLE "CheckinTaskMessage" ADD CONSTRAINT "CheckinTaskMessage_checkinTaskId_fkey"
    FOREIGN KEY ("checkinTaskId") REFERENCES "CheckinTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CheckinTaskMessage → Attachment
ALTER TABLE "CheckinTaskMessage" ADD CONSTRAINT "CheckinTaskMessage_attachmentId_fkey"
    FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
