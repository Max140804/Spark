"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function VerifyEmailForm({ token }: { token?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function verifyEmail() {
    if (!token) {
      setError("This verification link is missing its token.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(result.error ?? "This verification link could not be used.");
        return;
      }
      setMessage(result.message ?? "Your email is verified.");
    } catch (requestError) {
      console.error("Email verification request failed:", requestError);
      setError("We could not reach SPARK. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl font-bold text-spark-indigo-900">
        Verify your email
      </h1>
      <p className="mt-2 text-spark-indigo-700">
        Confirm your email address to activate your SPARK account.
      </p>
      {message ? (
        <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{message}</p>
      ) : (
        <div className="mt-6 space-y-4">
          <Button type="button" disabled={loading || !token} onClick={verifyEmail} className="w-full">
            {loading ? "Verifying…" : "Verify email address"}
          </Button>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        </div>
      )}
      <Link href="/login" className="mt-6 inline-flex font-semibold text-spark-amber-600">
        Continue to sign in
      </Link>
    </div>
  );
}
