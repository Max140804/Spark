import { notFound, redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ClassroomRoom } from "@/components/classroom/room";
import { LessonControls } from "@/components/classroom/lesson-controls";
import { canJoinClassroom, canManageClassroom } from "@/lib/classroom-access";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      class: {
        include: {
          teacher: { select: { userId: true, verificationStatus: true } },
          subject: { select: { name: true } },
          enrolments: {
            where: { status: "active" },
            select: { pupil: { select: { userId: true } } },
          },
        },
      },
    },
  });
  if (!lesson) notFound();
  if (lesson.class.status !== "ACTIVE") notFound();

  const access = {
    role: user.role,
    userId: user.id,
    classActive: lesson.class.status === "ACTIVE",
    teacherUserId: lesson.class.teacher.userId,
    teacherVerificationStatus: lesson.class.teacher.verificationStatus,
    enrolledPupil: lesson.class.enrolments.some(
      (enrolment) => enrolment.pupil.userId === user.id,
    ),
  };
  const canManage = canManageClassroom(access);
  const canJoin = canJoinClassroom(access);
  if (!canJoin) notFound();

  const now = new Date();
  const isOpen =
    lesson.status === "LIVE" &&
    lesson.startsAt <= now &&
    lesson.endsAt > now;
  const canPublish = canManage && user.role !== "ADMIN";

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-spark-amber-700">{lesson.class.subject.name}</p>
        <h1 className="font-display text-2xl font-bold text-spark-indigo-900 sm:text-3xl">{lesson.title}</h1>
        <p className="mt-1 text-sm text-spark-indigo-600">{lesson.class.name}</p>
      </header>

      {isOpen ? (
        <ClassroomRoom roomName={lesson.livekitRoomName} canPublish={canPublish} />
      ) : (
        <Card className="py-12 text-center">
          <CalendarClock className="mx-auto size-9 text-spark-indigo-300" />
          <h2 className="mt-4 font-display text-lg font-semibold text-spark-indigo-900">
            {lesson.status === "ENDED" || lesson.status === "CANCELLED"
              ? "This lesson has ended"
              : "This classroom is not open yet"}
          </h2>
          <p className="mt-2 text-sm text-spark-indigo-700">
            Scheduled for{" "}
            {lesson.startsAt.toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}.
          </p>
          {canManage && lesson.status === "SCHEDULED" && (
            <LessonControls lessonId={lesson.id} status={lesson.status} />
          )}
        </Card>
      )}
    </div>
  );
}
