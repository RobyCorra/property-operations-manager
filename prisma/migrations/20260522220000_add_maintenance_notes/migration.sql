-- AlterTable: add maintenanceNotes column to MaintenanceTicket
ALTER TABLE "MaintenanceTicket" ADD COLUMN IF NOT EXISTS "maintenanceNotes" TEXT;
