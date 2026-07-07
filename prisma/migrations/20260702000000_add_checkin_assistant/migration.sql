-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CHECKIN';

-- CreateTable: CheckinChecklistItem (checklist di check-in, per-appartamento)
CREATE TABLE "CheckinChecklistItem" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelTranslations" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "photoRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'static',

    CONSTRAINT "CheckinChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CheckinTask (task operativa di check-in)
CREATE TABLE "CheckinTask" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "notes" TEXT,
    "bookingId" TEXT,
    "checklistProgress" JSONB DEFAULT '[]',
    "checkinAccessToken" TEXT,

    CONSTRAINT "CheckinTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckinTask_bookingId_key" ON "CheckinTask"("bookingId");
CREATE UNIQUE INDEX "CheckinTask_checkinAccessToken_key" ON "CheckinTask"("checkinAccessToken");

-- AddForeignKey: CheckinChecklistItem → Apartment
ALTER TABLE "CheckinChecklistItem" ADD CONSTRAINT "CheckinChecklistItem_apartmentId_fkey"
    FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CheckinTask → Apartment
ALTER TABLE "CheckinTask" ADD CONSTRAINT "CheckinTask_apartmentId_fkey"
    FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CheckinTask → User (assignedTo)
ALTER TABLE "CheckinTask" ADD CONSTRAINT "CheckinTask_assignedToId_fkey"
    FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: CheckinTask → Booking
ALTER TABLE "CheckinTask" ADD CONSTRAINT "CheckinTask_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
