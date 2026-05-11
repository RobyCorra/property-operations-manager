-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPERVISOR';
ALTER TYPE "Role" ADD VALUE 'OWNER';

-- AlterTable: add correctionProgress to CleaningTask
ALTER TABLE "CleaningTask" ADD COLUMN "correctionProgress" JSONB;

-- AlterTable: add correctionProgress to MaintenanceTicket
ALTER TABLE "MaintenanceTicket" ADD COLUMN "correctionProgress" JSONB;

-- CreateTable: SupervisorReview
CREATE TABLE "SupervisorReview" (
    "id" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "cleaningTaskId" TEXT,
    "maintenanceTicketId" TEXT,
    "decision" TEXT NOT NULL,
    "notes" TEXT,
    "correctionItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupervisorReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ApartmentSupervisor
CREATE TABLE "ApartmentSupervisor" (
    "apartmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ApartmentSupervisor_pkey" PRIMARY KEY ("apartmentId","userId")
);

-- CreateTable: ApartmentOwner
CREATE TABLE "ApartmentOwner" (
    "apartmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ApartmentOwner_pkey" PRIMARY KEY ("apartmentId","userId")
);

-- CreateIndex
CREATE INDEX "SupervisorReview_cleaningTaskId_idx" ON "SupervisorReview"("cleaningTaskId");
CREATE INDEX "SupervisorReview_maintenanceTicketId_idx" ON "SupervisorReview"("maintenanceTicketId");
CREATE INDEX "SupervisorReview_supervisorId_idx" ON "SupervisorReview"("supervisorId");

-- AddForeignKey: SupervisorReview → User
ALTER TABLE "SupervisorReview" ADD CONSTRAINT "SupervisorReview_supervisorId_fkey"
    FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: SupervisorReview → CleaningTask
ALTER TABLE "SupervisorReview" ADD CONSTRAINT "SupervisorReview_cleaningTaskId_fkey"
    FOREIGN KEY ("cleaningTaskId") REFERENCES "CleaningTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SupervisorReview → MaintenanceTicket
ALTER TABLE "SupervisorReview" ADD CONSTRAINT "SupervisorReview_maintenanceTicketId_fkey"
    FOREIGN KEY ("maintenanceTicketId") REFERENCES "MaintenanceTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ApartmentSupervisor → Apartment
ALTER TABLE "ApartmentSupervisor" ADD CONSTRAINT "ApartmentSupervisor_apartmentId_fkey"
    FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ApartmentSupervisor → User
ALTER TABLE "ApartmentSupervisor" ADD CONSTRAINT "ApartmentSupervisor_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ApartmentOwner → Apartment
ALTER TABLE "ApartmentOwner" ADD CONSTRAINT "ApartmentOwner_apartmentId_fkey"
    FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ApartmentOwner → User
ALTER TABLE "ApartmentOwner" ADD CONSTRAINT "ApartmentOwner_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
