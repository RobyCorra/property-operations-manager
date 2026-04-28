CREATE TYPE "AIAssistantMessageRole" AS ENUM ('USER', 'ASSISTANT');

CREATE TABLE "AIAssistantMessage" (
    "id" TEXT NOT NULL,
    "role" "AIAssistantMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "userRole" "Role" NOT NULL,
    "apartmentId" TEXT,
    "cleaningTaskId" TEXT,
    "maintenanceTicketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAssistantMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AIAssistantMessage_apartmentId_idx" ON "AIAssistantMessage"("apartmentId");
CREATE INDEX "AIAssistantMessage_cleaningTaskId_idx" ON "AIAssistantMessage"("cleaningTaskId");
CREATE INDEX "AIAssistantMessage_maintenanceTicketId_idx" ON "AIAssistantMessage"("maintenanceTicketId");
CREATE INDEX "AIAssistantMessage_createdAt_idx" ON "AIAssistantMessage"("createdAt");

ALTER TABLE "AIAssistantMessage" ADD CONSTRAINT "AIAssistantMessage_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AIAssistantMessage" ADD CONSTRAINT "AIAssistantMessage_cleaningTaskId_fkey" FOREIGN KEY ("cleaningTaskId") REFERENCES "CleaningTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIAssistantMessage" ADD CONSTRAINT "AIAssistantMessage_maintenanceTicketId_fkey" FOREIGN KEY ("maintenanceTicketId") REFERENCES "MaintenanceTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
