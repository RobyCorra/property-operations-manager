-- Aggiunge il timestamp di consumo prodotti sulla pulizia (idempotenza:
-- i prodotti si scalano una sola volta, alla conferma/approvazione pulizia).
ALTER TABLE "CleaningTask" ADD COLUMN IF NOT EXISTS "productsConsumedAt" TIMESTAMP(3);
