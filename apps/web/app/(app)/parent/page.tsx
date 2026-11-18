import { BookOpen, Shield, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export default async function ParentDashboard() {
  const user = await requireRole("PARENT");

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    include: {
      children: {
        where: { consentSignedAt: { not: null }, consentRevokedAt: null },
        include: {
          pupil: {
            include: {
              user: { select: { fullName: true } },
              enrolments: {
                where: { status: "active", class: { status: "ACTIVE" } },
                include: { class: { include: { subject: true } } },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-spark-indigo-900">Family dashboard</h1>
        <p className="mt-1 text-spark-indigo-700">A clear view of your learner&apos;s classes.</p>
      </div>
      {!profile || profile.children.length === 0 ? (
        <Card>
          <div className="flex items-center gap-3">
            <User className="size-5 text-spark-amber-600" />
            <h2 className="font-display text-lg font-semibold text-spark-indigo-900">No learner profiles linked</h2>
          </div>
          <p className="mt-3 text-sm text-spark-indigo-700">
            Learner profiles and guardian consent need to be set up before progress is shared here.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-spark-indigo-600">
            <Shield className="size-4 text-emerald-600" />
            Only consented, linked learners are shown.
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {profile.children.map((link) => (
            <Card key={link.id}>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-spark-amber-100 font-bold text-spark-indigo-900">
                  {link.pupil.user.fullName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-spark-indigo-900">
                    {link.pupil.user.fullName}
                  </h2>
                  <p className="text-sm text-spark-indigo-600">{link.pupil.classBand ?? "Class not set"}</p>
                </div>
              </div>
              <div className="mt-5 border-t border-spark-indigo-100 pt-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-spark-indigo-500">
                  <BookOpen className="size-4" /> Enrolled classes
                </p>
                {link.pupil.enrolments.length === 0 ? (
                  <p className="mt-2 text-sm text-spark-indigo-700">No active classes.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {link.pupil.enrolments.map(({ class: pupilClass }) => (
                      <li key={pupilClass.id} className="text-sm text-spark-indigo-800">
                        {pupilClass.subject.name} <span className="text-spark-indigo-500">· {pupilClass.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}