-- Prodotti a livello di struttura (stock unico condiviso) + consumi per categoria.
-- Additivo: non tocca i prodotti per-appartamento esistenti.

CREATE TABLE IF NOT EXISTS "PropertyProduct" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "unit" TEXT NOT NULL DEFAULT 'pz',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vat" DOUBLE PRECISION NOT NULL DEFAULT 22,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyProduct_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PropertyProduct_propertyId_idx" ON "PropertyProduct"("propertyId");

CREATE TABLE IF NOT EXISTS "PropertyStockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "bookingId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyStockMovement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PropertyStockMovement_productId_createdAt_idx" ON "PropertyStockMovement"("productId", "createdAt");

ALTER TABLE "UnitCategory" ADD COLUMN IF NOT EXISTS "consumption" JSONB;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PropertyProduct_propertyId_fkey') THEN
        ALTER TABLE "PropertyProduct"
            ADD CONSTRAINT "PropertyProduct_propertyId_fkey"
            FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PropertyStockMovement_productId_fkey') THEN
        ALTER TABLE "PropertyStockMovement"
            ADD CONSTRAINT "PropertyStockMovement_productId_fkey"
            FOREIGN KEY ("productId") REFERENCES "PropertyProduct"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
