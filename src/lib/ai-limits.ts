import { prisma } from "./prisma";

function isNewMonth(resetAt: Date | null): boolean {
  if (!resetAt) return true;
  const now = new Date();
  return now.getFullYear() !== resetAt.getFullYear() || now.getMonth() !== resetAt.getMonth();
}

export async function checkTokenLimit(orgId: string): Promise<{ allowed: boolean; reason?: string; currentUsed: number }> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { aiMonthlyTokenLimit: true, aiTokensUsed: true, aiTokensResetAt: true },
  });
  if (!org) return { allowed: true, currentUsed: 0 };

  const shouldReset = isNewMonth(org.aiTokensResetAt);
  const currentUsed = shouldReset ? 0 : org.aiTokensUsed;

  if (currentUsed >= org.aiMonthlyTokenLimit) {
    return {
      allowed: false,
      currentUsed,
      reason: `Hai raggiunto il limite mensile di conversazioni AI (${org.aiMonthlyTokenLimit.toLocaleString("it-IT")} token). Il limite si rinnova il 1° del mese.`,
    };
  }
  return { allowed: true, currentUsed };
}

export async function consumeTokens(orgId: string, tokensUsed: number): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { aiTokensUsed: true, aiTokensResetAt: true },
  });
  if (!org) return;

  const shouldReset = isNewMonth(org.aiTokensResetAt);
  const currentUsed = shouldReset ? 0 : org.aiTokensUsed;

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      aiTokensUsed: currentUsed + tokensUsed,
      ...(shouldReset ? { aiTokensResetAt: new Date() } : {}),
    },
  });
}

export async function checkAndConsumePerplexity(orgId: string): Promise<{ allowed: boolean; reason?: string }> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { perplexityMonthlyLimit: true, perplexityRequestsUsed: true, perplexityRequestsResetAt: true },
  });
  if (!org) return { allowed: true };

  const shouldReset = isNewMonth(org.perplexityRequestsResetAt);
  const currentUsed = shouldReset ? 0 : org.perplexityRequestsUsed;

  if (currentUsed + 1 > org.perplexityMonthlyLimit) {
    return {
      allowed: false,
      reason: `Hai raggiunto il limite mensile di ricerche web (${org.perplexityMonthlyLimit} richieste). Il limite si rinnova il 1° del mese.`,
    };
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      perplexityRequestsUsed: currentUsed + 1,
      ...(shouldReset ? { perplexityRequestsResetAt: new Date() } : {}),
    },
  });

  return { allowed: true };
}

export async function getAIUsage(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      aiMonthlyTokenLimit: true,
      aiTokensUsed: true,
      aiTokensResetAt: true,
      perplexityMonthlyLimit: true,
      perplexityRequestsUsed: true,
      perplexityRequestsResetAt: true,
    },
  });
  if (!org) return null;

  const tokenReset = isNewMonth(org.aiTokensResetAt);
  const perplexityReset = isNewMonth(org.perplexityRequestsResetAt);

  return {
    tokens: {
      used: tokenReset ? 0 : org.aiTokensUsed,
      limit: org.aiMonthlyTokenLimit,
      resetAt: org.aiTokensResetAt,
    },
    perplexity: {
      used: perplexityReset ? 0 : org.perplexityRequestsUsed,
      limit: org.perplexityMonthlyLimit,
      resetAt: org.perplexityRequestsResetAt,
    },
  };
}
