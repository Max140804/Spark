import { AuthTokenPurpose } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAuthToken,
  sendVerificationEmail,
} from "@/lib/auth-tokens";
import { prisma } from "@/lib/prisma";
import { checkRequestRateLimit, consumeRateLimit } from "@/lib/rate-limit";

const requestSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
});
const successMessage =
  "If this account needs verification, a new link will be sent.";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  const rateLimitResponse = await checkRequestRateLimit(request, "verification-resend-ip", 10);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const emailLimit = await consumeRateLimit("verification-resend-email", parsed.data.email, 3, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { message: successMessage },
      { status: 202, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, fullName: true, isActive: true, emailVerified: true },
  });
  if (!user || !user.isActive || user.emailVerified) {
    return NextResponse.json({ message: successMessage }, { status: 202 });
  }

  try {
    const token = await createAuthToken(
      user.id,
      AuthTokenPurpose.EMAIL_VERIFICATION,
    );
    await sendVerificationEmail(user.email, user.fullName, token);
  } catch (error) {
    await prisma.authToken.deleteMany({
      where: {
        userId: user.id,
        purpose: AuthTokenPurpose.EMAIL_VERIFICATION,
      },
    });
    console.error("Verification email could not be resent:", error);
    return NextResponse.json(
      { error: "Verification email could not be sent. Please try again later." },
      { status: 503 },
    );
  }

  return NextResponse.json({ message: successMessage }, { status: 202 });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXTAUTH_URL;
  return Boolean(origin && appUrl && origin === new URL(appUrl).origin);
}
