-- CreateTable CleanerLocation
CREATE TABLE IF NOT EXISTS "CleanerLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CleanerLocation_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CleanerLocation_userId_key" ON "CleanerLocation"("userId");

-- AddForeignKey
ALTER TABLE "CleanerLocation" ADD CONSTRAINT "CleanerLocation_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable ApnsToken
CREATE TABLE IF NOT EXISTS "ApnsToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApnsToken_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ApnsToken_token_key" ON "ApnsToken"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ApnsToken_userId_idx" ON "ApnsToken"("userId");

-- AddForeignKey
ALTER TABLE "ApnsToken" ADD CONSTRAINT "ApnsToken_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
