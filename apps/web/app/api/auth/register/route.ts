import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createAuthToken, sendVerificationEmail } from "@/lib/auth-tokens";
import { registrationSchema } from "@/lib/auth-validation";
import { prisma } from "@/lib/prisma";
import { checkRequestRateLimit, consumeRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  const rateLimitResponse = await checkRequestRateLimit(request, "registration-ip", 10);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid name, email, password, and account type." },
      { status: 400 },
    );
  }

  const { fullName, email, password, role } = parsed.data;
  const emailLimit = await consumeRateLimit("registration-email", email, 3, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } },
    );
  }
  if (process.env.NODE_ENV === "production" && !hasSmtpConfiguration()) {
    return NextResponse.json(
      { error: "Account email delivery is temporarily unavailable." },
      { status: 503 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let userId: string;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role,
        ...(role === "PARENT"
          ? { parentProfile: { create: {} } }
          : { teacherProfile: { create: { verificationStatus: "PENDING" } } }),
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "If this email can be registered, a verification link will be sent." },
        { status: 202 },
      );
    }
    throw error;
  }

  try {
    const token = await createAuthToken(userId, "EMAIL_VERIFICATION");
    await sendVerificationEmail(email, fullName, token);
  } catch (error) {
    await prisma.user.delete({ where: { id: userId } });
    console.error("Account verification email could not be sent:", error);
    return NextResponse.json(
      { error: "We could not send the verification email. Please try again later." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { message: "If this email can be registered, a verification link will be sent." },
    { status: 202 },
  );
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXTAUTH_URL;
  if (!origin || !appUrl) return false;
  return origin === new URL(appUrl).origin;
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
