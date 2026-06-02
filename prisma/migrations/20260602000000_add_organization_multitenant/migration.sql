-- ============================================================
-- FASE 1: Multi-tenant - Aggiunta modello Organization
-- Pattern sicuro: nullable → backfill → indici
-- ============================================================

-- STEP 1: Crea la tabella Organization
CREATE TABLE "Organization" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "slug"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- STEP 2: Aggiungi colonne organizationId come NULLABLE (non rompe nulla di esistente)
ALTER TABLE "User"               ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
ALTER TABLE "Apartment"          ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
ALTER TABLE "ManagerChatSession" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;

-- STEP 3: Crea l'organizzazione di default e collega tutti i dati esistenti
INSERT INTO "Organization" ("id", "name", "slug", "createdAt")
VALUES ('org_default', 'Organizzazione Principale', 'principale', NOW())
ON CONFLICT DO NOTHING;

UPDATE "User"               SET "organizationId" = 'org_default' WHERE "organizationId" IS NULL;
UPDATE "Apartment"          SET "organizationId" = 'org_default' WHERE "organizationId" IS NULL;
UPDATE "ManagerChatSession" SET "organizationId" = 'org_default' WHERE "organizationId" IS NULL;

-- STEP 4: Aggiungi i vincoli di foreign key
ALTER TABLE "User"
    ADD CONSTRAINT "User_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Apartment"
    ADD CONSTRAINT "Apartment_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ManagerChatSession"
    ADD CONSTRAINT "ManagerChatSession_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- STEP 5: Aggiorna il vincolo unique di ManagerChatSession (ora include organizationId)
ALTER TABLE "ManagerChatSession" DROP CONSTRAINT IF EXISTS "ManagerChatSession_date_key";
CREATE UNIQUE INDEX "ManagerChatSession_date_organizationId_key" ON "ManagerChatSession"("date", "organizationId");

-- STEP 6: Crea gli indici per performance
CREATE INDEX IF NOT EXISTS "User_organizationId_idx"               ON "User"("organizationId");
CREATE INDEX IF NOT EXISTS "Apartment_organizationId_idx"          ON "Apartment"("organizationId");
CREATE INDEX IF NOT EXISTS "ManagerChatSession_organizationId_idx" ON "ManagerChatSession"("organizationId");
