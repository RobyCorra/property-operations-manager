-- Strutture ricettive (hotel/residence): Property + UnitCategory (master) e
-- collegamento delle unita' (Apartment) a struttura/categoria. Additivo:
-- gli appartamenti singoli esistenti restano invariati (colonne nullable).

CREATE TABLE IF NOT EXISTS "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'RESIDENCE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Property_organizationId_idx" ON "Property"("organizationId");

CREATE TABLE IF NOT EXISTS "UnitCategory" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "squareMeters" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "bedConfig" JSONB,
    "technicalProfile" JSONB,
    "accessInstructions" TEXT,
    "accessInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnitCategory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UnitCategory_propertyId_idx" ON "UnitCategory"("propertyId");

ALTER TABLE "Apartment" ADD COLUMN IF NOT EXISTS "propertyId" TEXT;
ALTER TABLE "Apartment" ADD COLUMN IF NOT EXISTS "unitCategoryId" TEXT;
ALTER TABLE "Apartment" ADD COLUMN IF NOT EXISTS "unitNumber" TEXT;

CREATE INDEX IF NOT EXISTS "Apartment_propertyId_idx" ON "Apartment"("propertyId");
CREATE INDEX IF NOT EXISTS "Apartment_unitCategoryId_idx" ON "Apartment"("unitCategoryId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Property_organizationId_fkey') THEN
        ALTER TABLE "Property"
            ADD CONSTRAINT "Property_organizationId_fkey"
            FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UnitCategory_propertyId_fkey') THEN
        ALTER TABLE "UnitCategory"
            ADD CONSTRAINT "UnitCategory_propertyId_fkey"
            FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Apartment_propertyId_fkey') THEN
        ALTER TABLE "Apartment"
            ADD CONSTRAINT "Apartment_propertyId_fkey"
            FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Apartment_unitCategoryId_fkey') THEN
        ALTER TABLE "Apartment"
            ADD CONSTRAINT "Apartment_unitCategoryId_fkey"
            FOREIGN KEY ("unitCategoryId") REFERENCES "UnitCategory"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
