"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

type TeacherApplicant = {
  id: string;
  bio: string | null;
  qualifications: string | null;
  user: {
    fullName: string;
    email: string;
    createdAt: string;
  };
};

export function TeacherVerificationQueue({
  applicants,
}: {
  applicants: TeacherApplicant[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function review(applicantId: string, status: "APPROVED" | "REJECTED") {
    setBusyId(applicantId);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/teachers/${encodeURIComponent(applicantId)}/verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "The review could not be saved.");
        return;
      }
      router.refresh();
    } catch (requestError) {
      console.error("Teacher verification review failed:", requestError);
      setError("We could not reach SPARK. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-spark-indigo-900">Teacher applications</h2>
        <p className="mt-1 text-sm text-spark-indigo-700">
          Review qualifications before granting access to live teaching.
        </p>
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      {applicants.length === 0 ? (
        <Card><p className="text-sm text-spark-indigo-700">No teacher applications are waiting for review.</p></Card>
      ) : (
        applicants.map((applicant) => {
          const isBusy = busyId === applicant.id;
          return (
            <Card key={applicant.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[220px] flex-1">
                  <h3 className="font-semibold text-spark-indigo-900">{applicant.user.fullName}</h3>
                  <a href={`mailto:${applicant.user.email}`} className="text-sm text-spark-indigo-700 underline">
                    {applicant.user.email}
                  </a>
                  <p className="mt-1 text-xs text-spark-indigo-500">
                    Applied {new Date(applicant.user.createdAt).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}
                  </p>
                  {applicant.qualifications && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-spark-indigo-800">
                      <span className="font-semibold">Qualifications: </span>{applicant.qualifications}
                    </p>
                  )}
                  {applicant.bio && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-spark-indigo-700">
                      <span className="font-semibold">About: </span>{applicant.bio}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={isBusy} onClick={() => review(applicant.id, "REJECTED")}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                    Reject
                  </button>
                  <button type="button" disabled={isBusy} onClick={() => review(applicant.id, "APPROVED")}
                    className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                    {isBusy ? "Saving…" : "Approve"}
                  </button>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </section>
  );
}
