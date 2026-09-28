-- CreateTable: richieste di cambio data intervento (impresa → proprietario)
CREATE TABLE "MaintenanceDateRequest" (
    "id" TEXT NOT NULL,
    "maintenanceTicketId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requestedByUserId" TEXT,
    "proposedStart" TIMESTAMP(3) NOT NULL,
    "proposedEnd" TIMESTAMP(3),
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,

    CONSTRAINT "MaintenanceDateRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MaintenanceDateRequest_maintenanceTicketId_idx" ON "MaintenanceDateRequest"("maintenanceTicketId");
CREATE INDEX "MaintenanceDateRequest_status_idx" ON "MaintenanceDateRequest"("status");
CREATE INDEX "MaintenanceDateRequest_companyId_idx" ON "MaintenanceDateRequest"("companyId");

ALTER TABLE "MaintenanceDateRequest" ADD CONSTRAINT "MaintenanceDateRequest_maintenanceTicketId_fkey" FOREIGN KEY ("maintenanceTicketId") REFERENCES "MaintenanceTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
