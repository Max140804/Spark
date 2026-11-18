import { LessonStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageClassroom } from "@/lib/classroom-access";

const statusSchema = z.object({
  status: z.enum(["LIVE", "ENDED"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lesson status." }, { status: 400 });
  }
  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      status: true,
      startsAt: true,
      endsAt: true,
      class: {
        select: {
          status: true,
          teacher: { select: { userId: true, verificationStatus: true } },
        },
      },
    },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  if (lesson.class.status !== "ACTIVE") {
    return NextResponse.json({ error: "This class is not active." }, { status: 409 });
  }

  if (
    !canManageClassroom({
      role: user.role,
      userId: user.id,
      classActive: lesson.class.status === "ACTIVE",
      teacherUserId: lesson.class.teacher.userId,
      teacherVerificationStatus: lesson.class.teacher.verificationStatus,
      enrolledPupil: false,
    })
  ) {
    return NextResponse.json({ error: "You cannot manage this classroom." }, { status: 403 });
  }

  const isAdmin = user.role === "ADMIN";
  const now = new Date();
  const expectedStatus =
    parsed.data.status === "LIVE" ? LessonStatus.SCHEDULED : LessonStatus.LIVE;
  if (lesson.status !== expectedStatus) {
    return NextResponse.json({ error: "The lesson status has changed. Refresh and try again." }, { status: 409 });
  }
  if (
    parsed.data.status === "LIVE" &&
    !isAdmin &&
    (now < new Date(lesson.startsAt.getTime() - 15 * 60 * 1000) ||
      now >= lesson.endsAt)
  ) {
    return NextResponse.json(
      { error: "You can open the classroom from 15 minutes before its scheduled start until it ends." },
      { status: 409 },
    );
  }
  if (parsed.data.status === "ENDED" && now < lesson.startsAt && !isAdmin) {
    return NextResponse.json({ error: "A lesson cannot end before it starts." }, { status: 409 });
  }

  const update = await prisma.lesson.updateMany({
    where: { id: lessonId, status: expectedStatus },
    data: { status: parsed.data.status },
  });
  if (update.count !== 1) {
    return NextResponse.json({ error: "The lesson status has changed. Refresh and try again." }, { status: 409 });
  }

  return NextResponse.json({ status: parsed.data.status });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXTAUTH_URL;
  return Boolean(origin && appUrl && origin === new URL(appUrl).origin);
}
