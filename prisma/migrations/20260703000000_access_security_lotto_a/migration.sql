-- Access security (Lotto A)
ALTER TABLE "User" ADD COLUMN "failedLoginCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lockedUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3);
ALTER TABLE "CleaningTask" ADD COLUMN "cleaningAccessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "CheckinTask" ADD COLUMN "checkinAccessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "MaintenanceTicket" ADD COLUMN "maintenanceAccessTokenExpiresAt" TIMESTAMP(3);
