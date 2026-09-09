-- Magazzino: prodotti di scorta generica a livello di organizzazione + movimenti

CREATE TABLE IF NOT EXISTS "WarehouseProduct" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "unit" TEXT NOT NULL DEFAULT 'pz',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "consumptionType" TEXT NOT NULL DEFAULT 'MANUAL',
    "consumptionBasis" TEXT NOT NULL DEFAULT 'BATHROOM',
    "consumptionValue" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WarehouseProduct_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WarehouseProduct_organizationId_idx" ON "WarehouseProduct"("organizationId");

CREATE TABLE IF NOT EXISTS "WarehouseStockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "bookingId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WarehouseStockMovement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WarehouseStockMovement_productId_createdAt_idx" ON "WarehouseStockMovement"("productId", "createdAt");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WarehouseStockMovement_productId_fkey') THEN
        ALTER TABLE "WarehouseStockMovement"
            ADD CONSTRAINT "WarehouseStockMovement_productId_fkey"
            FOREIGN KEY ("productId") REFERENCES "WarehouseProduct"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
