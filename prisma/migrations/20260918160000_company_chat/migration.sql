-- Chat privata impresa (manager d'impresa <-> operatore). Additivo, idempotente.
CREATE TABLE IF NOT EXISTS "CompanyChatMessage" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "staffUserId" TEXT NOT NULL,
  "senderIsManager" BOOLEAN NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readByManagerAt" TIMESTAMP(3),
  "readByStaffAt" TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "CompanyChatMessage_thread_idx" ON "CompanyChatMessage"("companyId","staffUserId","createdAt");
