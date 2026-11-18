import Link from "next/link";
import { CalendarDays, Clock3, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export default async function PupilDashboard() {
  const user = await requireRole("PUPIL");

  const now = new Date();
  const profile = await prisma.pupilProfile.findUnique({
    where: { userId: user.id },
    include: {
      enrolments: {
        where: { status: "active", class: { status: "ACTIVE" } },
        include: {
          class: {
            include: {
              subject: true,
              lessons: {
                where: {
                  status: { in: ["LIVE", "SCHEDULED"] },
                  endsAt: { gte: now },
                },
                orderBy: { startsAt: "asc" },
                take: 8,
              },
            },
          },
        },
      },
    },
  });
  const lessons = profile?.enrolments.flatMap((enrolment) =>
    enrolment.class.lessons.map((lesson) => ({
      ...lesson,
      className: enrolment.class.name,
      subjectName: enrolment.class.subject.name,
    })),
  ).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-spark-indigo-900">
          Your classes
        </h1>
        <p className="mt-1 text-spark-indigo-700">
          Welcome back, {user.name}. Here&apos;s what&apos;s coming up.
        </p>
      </div>

      {lessons.length === 0 ? (
        <Card className="py-12 text-center">
          <CalendarDays className="mx-auto size-8 text-spark-indigo-300" />
          <h2 className="mt-4 font-display text-lg font-semibold text-spark-indigo-900">
            No classes scheduled yet
          </h2>
          <p className="mt-2 text-sm text-spark-indigo-700">
            Once a parent or guardian enrolls you in a class, its lessons will show here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-spark-amber-700">
                    {lesson.subjectName}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-semibold text-spark-indigo-900">
                    {lesson.title}
                  </h2>
                  <p className="mt-1 text-sm text-spark-indigo-700">{lesson.className}</p>
                </div>
                {lesson.status === "LIVE" && (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                    Live now
                  </span>
                )}
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-spark-indigo-600">
                {lesson.status === "LIVE" ? <Video className="size-4" /> : <Clock3 className="size-4" />}
                <time dateTime={lesson.startsAt.toISOString()}>
                  {lesson.startsAt.toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                </time>
              </div>
              {lesson.status === "LIVE" && (
                <Link
                  href={`/classroom/${lesson.id}`}
                  className="mt-5 inline-flex rounded-full bg-spark-amber-400 px-5 py-2.5 text-sm font-bold text-spark-indigo-900 transition-colors hover:bg-spark-amber-500"
                >
                  Join lesson
                </Link>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}