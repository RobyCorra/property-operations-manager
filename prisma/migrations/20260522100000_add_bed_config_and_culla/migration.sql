-- AlterTable Apartment: add bedConfig JSON column
ALTER TABLE "Apartment" ADD COLUMN "bedConfig" JSONB;

-- AlterTable Booking: add cullaRequested boolean
ALTER TABLE "Booking" ADD COLUMN "cullaRequested" BOOLEAN NOT NULL DEFAULT false;
