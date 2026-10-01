-- CreateTable
CREATE TABLE IF NOT EXISTS "OrgStaffMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "staffUserId" TEXT NOT NULL,
    "senderIsManager" BOOLEAN NOT NULL,
    "senderName" TEXT NOT NULL,
    "text" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "mediaName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readByManagerAt" TIMESTAMP(3),
    "readByStaffAt" TIMESTAMP(3),

    CONSTRAINT "OrgStaffMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgStaffMessage_organizationId_staffUserId_createdAt_idx" ON "OrgStaffMessage"("organizationId", "staffUserId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "OrgStaffMessage" ADD CONSTRAINT "OrgStaffMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "OrgStaffMessage" ADD CONSTRAINT "OrgStaffMessage_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
