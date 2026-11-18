import { VerificationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { checkRequestRateLimit } from "@/lib/rate-limit";

const verificationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teacherId: string }> },
) {
  const admin = await getCurrentUser();
  if (!admin) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  const rateLimitResponse = await checkRequestRateLimit(
    request,
    "teacher-verification",
    30,
  );
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = verificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose an approval decision." }, { status: 400 });
  }
  const { teacherId } = await params;
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: { id: true, userId: true, verificationStatus: true },
  });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }
  if (teacher.verificationStatus !== VerificationStatus.PENDING) {
    return NextResponse.json({ error: "This profile has already been reviewed." }, { status: 409 });
  }

  const decision = parsed.data.status;
  const verifiedAt = decision === "APPROVED" ? new Date() : null;
  const forwardedIp = request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  const updated = await prisma.$transaction(async (transaction) => {
    const result = await transaction.teacherProfile.updateMany({
      where: {
        id: teacher.id,
        verificationStatus: VerificationStatus.PENDING,
      },
      data: {
        verificationStatus: decision,
        verifiedAt,
        verifiedByUserId: admin.id,
      },
    });
    if (result.count !== 1) return false;

    await transaction.auditLog.create({
      data: {
        actorId: admin.id,
        action: decision === "APPROVED" ? "teacher.approved" : "teacher.rejected",
        targetType: "TeacherProfile",
        targetId: teacher.id,
        metadata: { teacherUserId: teacher.userId },
        ip: forwardedIp,
      },
    });
    return true;
  });
  if (!updated) {
    return NextResponse.json({ error: "This profile has already been reviewed." }, { status: 409 });
  }

  return NextResponse.json({ status: decision });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXTAUTH_URL;
  return Boolean(origin && appUrl && origin === new URL(appUrl).origin);
}
