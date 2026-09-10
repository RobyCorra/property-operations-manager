-- Anagrafica clienti (fatturazione) + collegamento appartamento→cliente
CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PRIVATE',
    "name" TEXT NOT NULL,
    "vatNumber" TEXT,
    "taxCode" TEXT,
    "sdiCode" TEXT,
    "pec" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "province" TEXT,
    "country" TEXT DEFAULT 'Italia',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Client_organizationId_idx" ON "Client"("organizationId");

ALTER TABLE "Apartment" ADD COLUMN IF NOT EXISTS "clientId" TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Apartment_clientId_fkey') THEN
        ALTER TABLE "Apartment"
            ADD CONSTRAINT "Apartment_clientId_fkey"
            FOREIGN KEY ("clientId") REFERENCES "Client"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
