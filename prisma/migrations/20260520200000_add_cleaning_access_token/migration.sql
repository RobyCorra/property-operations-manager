-- AlterTable
ALTER TABLE "CleaningTask" ADD COLUMN "cleaningAccessToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CleaningTask_cleaningAccessToken_key" ON "CleaningTask"("cleaningAccessToken");
