-- Add contact and external contractor fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone"       TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address"     TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isExternal"  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vatNumber"   TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "iban"        TEXT;
