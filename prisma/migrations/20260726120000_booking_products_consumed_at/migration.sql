-- Idempotenza consumo prodotti al check-in: segna quando i prodotti sono già stati sottratti
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "productsConsumedAt" TIMESTAMP(3);
