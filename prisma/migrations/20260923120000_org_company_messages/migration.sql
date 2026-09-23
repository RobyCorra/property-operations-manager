-- CreateTable
CREATE TABLE "OrgCompanyMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "senderIsOrg" BOOLEAN NOT NULL,
    "senderName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "mediaName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readByOrgAt" TIMESTAMP(3),
    "readByCompanyAt" TIMESTAMP(3),

    CONSTRAINT "OrgCompanyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrgCompanyMessage_organizationId_companyId_createdAt_idx" ON "OrgCompanyMessage"("organizationId", "companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "OrgCompanyMessage" ADD CONSTRAINT "OrgCompanyMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgCompanyMessage" ADD CONSTRAINT "OrgCompanyMessage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
