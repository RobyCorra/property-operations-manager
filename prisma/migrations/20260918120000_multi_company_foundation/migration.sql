-- Fondamenta imprese esterne: Company, Engagement, User.companyId,
-- proprietario magazzino Org o Company. Tutto additivo e idempotente.

CREATE TABLE IF NOT EXISTS "Company" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "legalName" TEXT,
  "vatNumber" TEXT,
  "scopes" TEXT[] NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Company_slug_key" ON "Company"("slug");

CREATE TABLE IF NOT EXISTS "Engagement" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "Engagement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Engagement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Engagement_organizationId_companyId_scope_key" ON "Engagement"("organizationId","companyId","scope");
CREATE INDEX IF NOT EXISTS "Engagement_companyId_idx" ON "Engagement"("companyId");
CREATE INDEX IF NOT EXISTS "Engagement_organizationId_idx" ON "Engagement"("organizationId");

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
CREATE INDEX IF NOT EXISTS "User_companyId_idx" ON "User"("companyId");
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "WarehouseProduct" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "WarehouseProduct" ALTER COLUMN "organizationId" DROP NOT NULL;
CREATE INDEX IF NOT EXISTS "WarehouseProduct_companyId_idx" ON "WarehouseProduct"("companyId");
DO $$ BEGIN
  ALTER TABLE "WarehouseProduct" ADD CONSTRAINT "WarehouseProduct_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "WarehouseProduct" ADD CONSTRAINT "WarehouseProduct_owner_xor"
    CHECK ((("organizationId" IS NOT NULL)::int + ("companyId" IS NOT NULL)::int) = 1) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
