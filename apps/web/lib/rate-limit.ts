import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const HOUR_MS = 60 * 60 * 1000;

export async function checkRequestRateLimit(
  request: Request,
  scope: string,
  maxRequests: number,
  windowMs = HOUR_MS,
) {
  const result = await consumeRateLimit(
    scope,
    getRequestIdentity(request.headers),
    maxRequests,
    windowMs,
  );
  if (result.allowed) return null;

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    },
  );
}

export async function consumeRateLimit(
  scope: string,
  identity: string,
  maxRequests: number,
  windowMs: number,
) {
  const now = new Date();
  const windowStart = Math.floor(now.getTime() / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + windowMs);
  const bucketId = createHash("sha256")
    .update(`${scope}\0${windowStart}\0${identity}`)
    .digest("hex");

  const bucket = await prisma.rateLimitBucket.upsert({
    where: { id: bucketId },
    create: { id: bucketId, expiresAt },
    update: { requests: { increment: 1 } },
    select: { requests: true },
  });

  if (bucket.requests % 100 === 0) {
    await prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lte: now } } });
  }
  if (bucket.requests > maxRequests + 1) {
    await prisma.rateLimitBucket.updateMany({
      where: { id: bucketId, requests: { gt: maxRequests + 1 } },
      data: { requests: maxRequests + 1 },
    });
  }

  return {
    allowed: bucket.requests <= maxRequests,
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)),
  };
}

export function getRequestIdentity(headers: Headers) {
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
