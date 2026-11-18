"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LessonControls({
  lessonId,
  status,
}: {
  lessonId: string;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status !== "SCHEDULED" && status !== "LIVE") return null;

  async function updateStatus(nextStatus: "LIVE" | "ENDED") {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/classroom/${lessonId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "The lesson status could not be updated.");
        return;
      }
      router.refresh();
    } catch (requestError) {
      console.error("Lesson status update failed:", requestError);
      setError("We could not reach SPARK. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      {status === "SCHEDULED" ? (
        <button type="button" disabled={loading} onClick={() => updateStatus("LIVE")}
          className="rounded-full bg-spark-amber-400 px-5 py-2.5 text-sm font-bold text-spark-indigo-900 transition-colors hover:bg-spark-amber-500 disabled:opacity-50">
          {loading ? "Opening classroom…" : "Start lesson"}
        </button>
      ) : (
        <button type="button" disabled={loading} onClick={() => updateStatus("ENDED")}
          className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
          {loading ? "Ending lesson…" : "End lesson"}
        </button>
      )}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
