-- AlterTable: add AI usage/limit fields to Company (mirror Organization)
ALTER TABLE "Company"
  ADD COLUMN "aiMonthlyTokenLimit" INTEGER NOT NULL DEFAULT 1800000,
  ADD COLUMN "aiTokensUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "aiTokensResetAt" TIMESTAMP(3),
  ADD COLUMN "perplexityMonthlyLimit" INTEGER NOT NULL DEFAULT 600,
  ADD COLUMN "perplexityRequestsUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "perplexityRequestsResetAt" TIMESTAMP(3);
