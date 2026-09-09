-- Aliquota IVA (%) dei prodotti (appartamento + magazzino), default 22
ALTER TABLE "ApartmentProduct" ADD COLUMN IF NOT EXISTS "vat" DOUBLE PRECISION NOT NULL DEFAULT 22;
ALTER TABLE "WarehouseProduct" ADD COLUMN IF NOT EXISTS "vat" DOUBLE PRECISION NOT NULL DEFAULT 22;
