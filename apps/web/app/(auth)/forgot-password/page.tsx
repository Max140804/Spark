"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: new FormData(form).get("email") }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(result.error ?? "Password reset is temporarily unavailable.");
        return;
      }
      setMessage(result.message ?? "Check your inbox for reset instructions.");
      form.reset();
    } catch (requestError) {
      console.error("Password reset request failed:", requestError);
      setError("We could not reach SPARK. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl font-bold text-spark-indigo-900">
        Reset your password
      </h1>
      <p className="mt-2 text-spark-indigo-700">
        Enter the email on your account and we&apos;ll send reset instructions.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-spark-indigo-900">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254}
            className="w-full rounded-2xl border-2 border-spark-indigo-200 px-4 py-3 focus:border-spark-amber-400 focus:outline-none" />
        </div>
        {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-spark-indigo-700">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-spark-amber-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
