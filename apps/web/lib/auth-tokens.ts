import { createHash, randomBytes } from "node:crypto";
import { AuthTokenPurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAuthToken(userId: string, purpose: AuthTokenPurpose) {
  const token = randomBytes(32).toString("base64url");
  await prisma.authToken.deleteMany({
    where: { userId, purpose },
  });
  await prisma.authToken.create({
    data: {
      userId,
      purpose,
      tokenHash: hashAuthToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

export function getPublicAppUrl(path: string) {
  const baseUrl = process.env.NEXTAUTH_URL;
  if (!baseUrl) throw new Error("NEXTAUTH_URL must be configured.");
  return new URL(path, baseUrl);
}

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  token: string,
) {
  const url = getPublicAppUrl("/verify-email");
  url.searchParams.set("token", token);
  await sendEmail({
    to: email,
    subject: "Verify your SPARK account",
    text: `Hi ${fullName}, verify your SPARK account using this link: ${url.toString()}. The link expires in one hour.`,
    html: `<p>Hi ${escapeHtml(fullName)},</p><p>Verify your SPARK account to sign in:</p><p><a href="${escapeHtml(url.toString())}">Verify email address</a></p><p>This link expires in one hour. If you did not create an account, you can ignore this message.</p>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  token: string,
) {
  const url = getPublicAppUrl("/reset-password");
  url.searchParams.set("token", token);
  await sendEmail({
    to: email,
    subject: "Reset your SPARK password",
    text: `Hi ${fullName}, reset your SPARK password using this link: ${url.toString()}. The link expires in one hour.`,
    html: `<p>Hi ${escapeHtml(fullName)},</p><p>We received a request to reset your SPARK password:</p><p><a href="${escapeHtml(url.toString())}">Reset password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this message.</p>`,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}
