import { AuthTokenPurpose } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  createAuthToken,
  sendPasswordResetEmail,
} from "@/lib/auth-tokens";
import { passwordResetRequestSchema } from "@/lib/auth-validation";
import { prisma } from "@/lib/prisma";
import { checkRequestRateLimit, consumeRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  const rateLimitResponse = await checkRequestRateLimit(request, "password-reset-ip", 10);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = passwordResetRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const emailLimit = await consumeRateLimit("password-reset-email", parsed.data.email, 3, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { message: successMessage },
      { status: 202, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } },
    );
  }

  if (process.env.NODE_ENV === "production" && !hasSmtpConfiguration()) {
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable." },
      { status: 503 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, fullName: true, isActive: true, emailVerified: true },
  });
  if (!user || !user.isActive || !user.emailVerified) {
    return NextResponse.json({ message: successMessage }, { status: 202 });
  }

  try {
    const token = await createAuthToken(user.id, AuthTokenPurpose.PASSWORD_RESET);
    await sendPasswordResetEmail(user.email, user.fullName, token);
  } catch (error) {
    await prisma.authToken.deleteMany({
      where: { userId: user.id, purpose: AuthTokenPurpose.PASSWORD_RESET },
    });
    console.error("Password reset email could not be sent:", error);
    return NextResponse.json(
      { error: "Password reset email could not be sent. Please try again later." },
      { status: 503 },
    );
  }

  return NextResponse.json({ message: successMessage }, { status: 202 });
}

const successMessage =
  "If an active account uses that email, password reset instructions will be sent.";

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXTAUTH_URL;
  return Boolean(origin && appUrl && origin === new URL(appUrl).origin);
}

function hasSmtpConfiguration() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.EMAIL_FROM,
  );
}
