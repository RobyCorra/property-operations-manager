-- Registro movimenti di scorta prodotti (storico per intervallo di date)
CREATE TABLE IF NOT EXISTS "StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "bookingId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StockMovement_productId_createdAt_idx" ON "StockMovement"("productId", "createdAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'StockMovement_productId_fkey'
    ) THEN
        ALTER TABLE "StockMovement"
            ADD CONSTRAINT "StockMovement_productId_fkey"
            FOREIGN KEY ("productId") REFERENCES "ApartmentProduct"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
