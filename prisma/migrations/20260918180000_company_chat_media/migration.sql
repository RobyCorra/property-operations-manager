-- Media nei messaggi chat impresa (foto/vocali/allegati). Additivo, idempotente.
ALTER TABLE "CompanyChatMessage" ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT;
ALTER TABLE "CompanyChatMessage" ADD COLUMN IF NOT EXISTS "mediaType" TEXT;
ALTER TABLE "CompanyChatMessage" ADD COLUMN IF NOT EXISTS "mediaName" TEXT;
