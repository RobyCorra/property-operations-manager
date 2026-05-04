-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN "apartmentCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Apartment_apartmentCode_key" ON "Apartment"("apartmentCode");
