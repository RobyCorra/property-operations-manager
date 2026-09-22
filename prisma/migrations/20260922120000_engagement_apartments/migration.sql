-- CreateTable
CREATE TABLE "EngagementApartment" (
    "engagementId" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,

    CONSTRAINT "EngagementApartment_pkey" PRIMARY KEY ("engagementId","apartmentId")
);

-- CreateIndex
CREATE INDEX "EngagementApartment_apartmentId_idx" ON "EngagementApartment"("apartmentId");

-- AddForeignKey
ALTER TABLE "EngagementApartment" ADD CONSTRAINT "EngagementApartment_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementApartment" ADD CONSTRAINT "EngagementApartment_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
