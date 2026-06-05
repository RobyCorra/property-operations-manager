ALTER TABLE "Organization" ADD COLUMN "aiMonthlyTokenLimit" INTEGER NOT NULL DEFAULT 1800000;
ALTER TABLE "Organization" ADD COLUMN "aiTokensUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Organization" ADD COLUMN "aiTokensResetAt" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "perplexityMonthlyLimit" INTEGER NOT NULL DEFAULT 600;
ALTER TABLE "Organization" ADD COLUMN "perplexityRequestsUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Organization" ADD COLUMN "perplexityRequestsResetAt" TIMESTAMP(3);
