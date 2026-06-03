CREATE TABLE IF NOT EXISTS "SuperAdminLog" (
  "id"        TEXT NOT NULL,
  "action"    TEXT NOT NULL,
  "detail"    TEXT,
  "orgId"     TEXT,
  "orgName"   TEXT,
  "ip"        TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SuperAdminLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SuperAdminLog_createdAt_idx" ON "SuperAdminLog"("createdAt");
CREATE INDEX IF NOT EXISTS "SuperAdminLog_orgId_idx" ON "SuperAdminLog"("orgId");
