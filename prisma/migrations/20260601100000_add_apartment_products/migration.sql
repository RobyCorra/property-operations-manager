-- CreateTable
CREATE TABLE "ApartmentProduct" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "unit" TEXT NOT NULL DEFAULT 'pz',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "consumptionType" TEXT NOT NULL DEFAULT 'STATIC',
    "consumptionValue" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApartmentProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApartmentProduct_apartmentId_idx" ON "ApartmentProduct"("apartmentId");

-- AddForeignKey
ALTER TABLE "ApartmentProduct" ADD CONSTRAINT "ApartmentProduct_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
