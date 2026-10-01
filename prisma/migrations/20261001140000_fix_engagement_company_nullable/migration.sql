-- Fix: Engagement.companyId deve essere nullable (inviti pending non hanno company)
ALTER TABLE "Engagement" ALTER COLUMN "companyId" DROP NOT NULL;

-- Aggiunge inviteToken se mancante
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "inviteToken" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Engagement_inviteToken_key" ON "Engagement"("inviteToken");
