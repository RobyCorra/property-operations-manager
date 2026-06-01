-- AlterTable: add readByWorkerAt to maintenance Message
ALTER TABLE "Message" ADD COLUMN "readByWorkerAt" TIMESTAMP(3);

-- AlterTable: add readByWorkerAt to CleaningTaskMessage
ALTER TABLE "CleaningTaskMessage" ADD COLUMN "readByWorkerAt" TIMESTAMP(3);
