-- CreateTable FcmToken (token push Firebase Cloud Messaging per Android)
CREATE TABLE IF NOT EXISTS "FcmToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FcmToken_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FcmToken_token_key" ON "FcmToken"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FcmToken_userId_idx" ON "FcmToken"("userId");

-- AddForeignKey (idempotente)
DO $$ BEGIN
  ALTER TABLE "FcmToken" ADD CONSTRAINT "FcmToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
