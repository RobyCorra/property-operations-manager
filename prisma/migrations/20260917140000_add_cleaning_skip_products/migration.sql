-- Flag per escludere una singola pulizia (tipicamente manuale) dallo scarico
-- prodotti alla sua approvazione.
ALTER TABLE "CleaningTask" ADD COLUMN IF NOT EXISTS "skipProductConsumption" BOOLEAN NOT NULL DEFAULT false;
