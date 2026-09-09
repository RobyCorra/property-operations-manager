-- Prezzo unitario dei prodotti (appartamento + magazzino)
ALTER TABLE "ApartmentProduct" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "WarehouseProduct" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION NOT NULL DEFAULT 0;
