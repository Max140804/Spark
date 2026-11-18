import { AuthTokenPurpose } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { hashAuthToken } from "@/lib/auth-tokens";
import { passwordResetConfirmationSchema } from "@/lib/auth-validation";
import { prisma } from "@/lib/prisma";
import { checkRequestRateLimit, consumeRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  const rateLimitResponse = await checkRequestRateLimit(request, "password-reset-confirm-ip", 10);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = passwordResetConfirmationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Use a valid reset link and a password of at least 12 characters." },
      { status: 400 },
    );
  }
  const tokenLimit = await consumeRateLimit("password-reset-confirm-token", hashAuthToken(parsed.data.token), 5, 60 * 60 * 1000);
  if (!tokenLimit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Request a new reset link." }, { status: 429 });
  }

  const authToken = await prisma.authToken.findFirst({
    where: {
      tokenHash: hashAuthToken(parsed.data.token),
      purpose: AuthTokenPurpose.PASSWORD_RESET,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, userId: true },
  });
  if (!authToken) {
    return NextResponse.json(
      { error: "This password reset link is invalid or expired." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.$transaction(async (transaction) => {
    await transaction.authToken.delete({ where: { id: authToken.id } });
    await transaction.user.update({
      where: { id: authToken.userId, isActive: true },
      data: { passwordHash, authVersion: { increment: 1 } },
    });
    await transaction.authToken.deleteMany({
      where: {
        userId: authToken.userId,
        purpose: AuthTokenPurpose.PASSWORD_RESET,
      },
    });
  });

  return NextResponse.json({ message: "Your password has been updated. You can now sign in." });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXTAUTH_URL;
  return Boolean(origin && appUrl && origin === new URL(appUrl).origin);
}
