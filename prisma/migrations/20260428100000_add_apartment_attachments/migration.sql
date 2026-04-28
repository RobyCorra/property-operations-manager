CREATE TABLE "ApartmentAttachment" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "extractedText" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApartmentAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ApartmentAttachment_apartmentId_idx" ON "ApartmentAttachment"("apartmentId");
CREATE INDEX "ApartmentAttachment_category_idx" ON "ApartmentAttachment"("category");

ALTER TABLE "ApartmentAttachment" ADD CONSTRAINT "ApartmentAttachment_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
