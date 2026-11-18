"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm({ token }: { token?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    if (password !== formData.get("confirmPassword")) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(result.error ?? "This reset link could not be used.");
        return;
      }
      setMessage(result.message ?? "Your password has been updated.");
      form.reset();
    } catch (requestError) {
      console.error("Password update request failed:", requestError);
      setError("We could not reach SPARK. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl font-bold text-spark-indigo-900">
        Choose a new password
      </h1>
      <p className="mt-2 text-spark-indigo-700">
        Use a unique password with at least 12 characters.
      </p>
      {message ? (
        <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-spark-indigo-900">
              New password
            </label>
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={72}
              className="w-full rounded-2xl border-2 border-spark-indigo-200 px-4 py-3 focus:border-spark-amber-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-semibold text-spark-indigo-900">
              Confirm password
            </label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={72}
              className="w-full rounded-2xl border-2 border-spark-indigo-200 px-4 py-3 focus:border-spark-amber-400 focus:outline-none" />
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" size="lg" disabled={loading || !token} className="w-full">
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
      <Link href="/login" className="mt-6 inline-flex font-semibold text-spark-amber-600">
        Continue to sign in
      </Link>
    </div>
  );
}
