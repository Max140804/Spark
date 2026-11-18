import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { TeacherVerificationQueue } from "@/components/admin/teacher-verification-queue";

export default async function AdminDashboard() {
  await requireRole("ADMIN");

  const [activePupils, liveLessons, pendingVerifications, flaggedMessages, applicants] =
    await Promise.all([
      prisma.user.count({
        where: { role: "PUPIL", isActive: true, emailVerified: { not: null } },
      }),
      prisma.lesson.count({
        where: { status: "LIVE", class: { status: "ACTIVE" } },
      }),
      prisma.teacherProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.message.count({ where: { moderationStatus: "FLAGGED" } }),
      prisma.teacherProfile.findMany({
        where: { verificationStatus: "PENDING" },
        select: {
          id: true,
          bio: true,
          qualifications: true,
          user: { select: { fullName: true, email: true, createdAt: true } },
        },
        orderBy: { user: { createdAt: "asc" } },
      }),
    ]);
  const serializedApplicants = applicants.map((applicant) => ({
    ...applicant,
    user: {
      ...applicant.user,
      createdAt: applicant.user.createdAt.toISOString(),
    },
  }));

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold text-spark-indigo-900">
        Platform pulse
      </h1>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Active pupils", value: activePupils },
          { label: "Live lessons now", value: liveLessons },
          { label: "Pending verifications", value: pendingVerifications },
          { label: "Open moderation", value: flaggedMessages },
        ].map((s) => (
          <Card key={s.label}>
            <p className="font-display text-2xl font-bold text-spark-indigo-900">
              {s.value}
            </p>
            <p className="text-sm text-spark-indigo-700">{s.label}</p>
          </Card>
        ))}
      </div>
      <TeacherVerificationQueue applicants={serializedApplicants} />
    </div>
  );
}