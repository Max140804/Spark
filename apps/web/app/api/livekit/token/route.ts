import { AccessToken } from "livekit-server-sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { canJoinClassroom } from "@/lib/classroom-access";

const requestSchema = z.object({
  roomName: z.string().trim().min(1).max(128),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid roomName is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isActive: true, emailVerified: true, fullName: true },
  });
  if (!user || !user.isActive || !user.emailVerified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = user.role;
  if (role !== "TEACHER" && role !== "PUPIL" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const lesson = await prisma.lesson.findUnique({
    where: { livekitRoomName: parsed.data.roomName },
    select: {
      status: true,
      startsAt: true,
      endsAt: true,
      class: {
        select: {
          status: true,
          teacher: {
            select: { userId: true, verificationStatus: true },
          },
          enrolments: {
            where: { status: "active" },
            select: { pupil: { select: { userId: true } } },
          },
        },
      },
    },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }
  if (
    lesson.class.status !== "ACTIVE" ||
    lesson.status !== "LIVE" ||
    lesson.startsAt > now ||
    lesson.endsAt <= now
  ) {
    return NextResponse.json({ error: "This lesson is not live." }, { status: 409 });
  }

  const isAuthorized = canJoinClassroom({
    role,
    userId: user.id,
    classActive: lesson.class.status === "ACTIVE",
    teacherUserId: lesson.class.teacher.userId,
    teacherVerificationStatus: lesson.class.teacher.verificationStatus,
    enrolledPupil: lesson.class.enrolments.some(
      (enrolment) => enrolment.pupil.userId === user.id,
    ),
  });
  if (!isAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const serverUrl = process.env.LIVEKIT_URL;
  if (!apiKey || !apiSecret || !serverUrl) {
    return NextResponse.json(
      { error: "LiveKit is not configured" },
      { status: 503 },
    );
  }

  const at = new AccessToken(
    apiKey,
    apiSecret,
    { identity: user.id, name: user.fullName, ttl: "2h" },
  );

  at.addGrant({
    roomJoin: true,
    room: parsed.data.roomName,
    canPublish: role === "TEACHER",
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return NextResponse.json({ token, url: serverUrl });
}