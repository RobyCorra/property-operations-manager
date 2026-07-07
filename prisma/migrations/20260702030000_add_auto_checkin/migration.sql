-- AlterTable: self check-in per appartamento (disabilita il workflow assistente)
ALTER TABLE "Apartment" ADD COLUMN "autoCheckin" BOOLEAN NOT NULL DEFAULT false;
