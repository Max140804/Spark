import Link from "next/link";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export default async function TeacherDashboard() {
  const user = await requireRole("TEACHER");

  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { verificationStatus: true, id: true },
  });
  if (!teacher) {
    return <p>Your teacher profile could not be found. Contact support.</p>;
  }

  const now = new Date();
  const lagosTime = new Date(now.getTime() + 60 * 60 * 1000);
  const lagosMidnightUtc = Date.UTC(
    lagosTime.getUTCFullYear(),
    lagosTime.getUTCMonth(),
    lagosTime.getUTCDate(),
    -1,
  );
  const startOfDay = new Date(lagosMidnightUtc);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const [lessonsToday, classCount, activePupils, pendingGrading, lessons] =
    await Promise.all([
      prisma.lesson.count({
        where: {
          class: { teacherId: teacher.id },
          startsAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      prisma.class.count({ where: { teacherId: teacher.id, status: "ACTIVE" } }),
      prisma.enrolment.findMany({
        where: { status: "active", class: { teacherId: teacher.id, status: "ACTIVE" } },
        distinct: ["pupilId"],
        select: { pupilId: true },
      }),
      prisma.submission.count({
        where: {
          score: null,
          assignment: { module: { class: { teacherId: teacher.id } } },
        },
      }),
      prisma.lesson.findMany({
        where: {
          class: { teacherId: teacher.id },
          status: { in: ["LIVE", "SCHEDULED"] },
          endsAt: { gte: now },
        },
        include: { class: { include: { subject: true } } },
        orderBy: { startsAt: "asc" },
        take: 6,
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-spark-indigo-900">Teacher dashboard</h1>
        <p className="mt-1 text-spark-indigo-700">Welcome back, {user.name}.</p>
      </div>

      {teacher.verificationStatus !== "APPROVED" && (
        <Card className="border-spark-amber-200 bg-spark-amber-50">
          <h2 className="font-semibold text-spark-indigo-900">Your profile is under review</h2>
          <p className="mt-1 text-sm text-spark-indigo-700">
            You can sign in while we review your qualifications. Live teaching is enabled after approval.
          </p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Lessons today", value: lessonsToday },
          { label: "Active classes", value: classCount },
          { label: "Pupils to review", value: pendingGrading },
        ].map((s) => (
          <Card key={s.label}>
            <p className="font-display text-2xl font-bold text-spark-indigo-900">
              {s.value}
            </p>
            <p className="text-sm text-spark-indigo-700">{s.label}</p>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-spark-indigo-900">Upcoming lessons</h2>
        {lessons.length === 0 ? (
          <Card><p className="text-sm text-spark-indigo-700">No lessons are scheduled for your classes.</p></Card>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-spark-amber-700">{lesson.class.subject.name}</p>
                  <h3 className="font-semibold text-spark-indigo-900">{lesson.title}</h3>
                  <p className="text-sm text-spark-indigo-700">{lesson.class.name} · {lesson.startsAt.toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</p>
                </div>
                {teacher.verificationStatus === "APPROVED" && (
                  <Link href={`/classroom/${lesson.id}`} className="rounded-full bg-spark-indigo-900 px-4 py-2 text-sm font-semibold text-white hover:bg-spark-indigo-800">
                    {lesson.status === "LIVE" ? "Open classroom" : "Prepare lesson"}
                  </Link>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}