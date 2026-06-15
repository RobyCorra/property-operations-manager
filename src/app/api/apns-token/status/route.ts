import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tokens = await prisma.apnsToken.findMany({
    where: { userId },
    select: { token: true },
  });

  if (tokens.length === 0) {
    return NextResponse.json({ hasToken: false });
  }

  const last = tokens[tokens.length - 1].token;
  return NextResponse.json({
    hasToken: true,
    tokenShort: last.slice(-20),
    count: tokens.length,
  });
}
