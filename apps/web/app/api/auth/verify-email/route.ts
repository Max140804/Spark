import { AuthTokenPurpose } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashAuthToken } from "@/lib/auth-tokens";
import { verificationTokenSchema } from "@/lib/auth-validation";
import { prisma } from "@/lib/prisma";
import { checkRequestRateLimit, consumeRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  const rateLimitResponse = await checkRequestRateLimit(request, "email-verification-ip", 10);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = verificationTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "This verification link is invalid or expired." }, { status: 400 });
  }
  const tokenLimit = await consumeRateLimit("email-verification-token", hashAuthToken(parsed.data.token), 5, 60 * 60 * 1000);
  if (!tokenLimit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Request a new verification link." }, { status: 429 });
  }

  const authToken = await prisma.authToken.findFirst({
    where: {
      tokenHash: hashAuthToken(parsed.data.token),
      purpose: AuthTokenPurpose.EMAIL_VERIFICATION,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, userId: true, user: { select: { emailVerified: true } } },
  });
  if (!authToken) {
    return NextResponse.json({ error: "This verification link is invalid or expired." }, { status: 400 });
  }
  if (authToken.user.emailVerified) {
    await prisma.authToken.delete({ where: { id: authToken.id } });
    return NextResponse.json({ message: "Your email is already verified. You can sign in." });
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.authToken.delete({ where: { id: authToken.id } });
    await transaction.user.update({
      where: { id: authToken.userId },
      data: { emailVerified: new Date() },
    });
  });

  return NextResponse.json({ message: "Your email is verified. You can now sign in." });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXTAUTH_URL;
  return Boolean(origin && appUrl && origin === new URL(appUrl).origin);
}
