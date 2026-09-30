-- AlterTable
ALTER TABLE "CleaningTask" ADD COLUMN "hideChecklist" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CleaningTask" ADD COLUMN "manualTasks" JSONB;
