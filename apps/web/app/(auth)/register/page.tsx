"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type AccountRole = "PARENT" | "TEACHER";

export default function RegisterPage() {
  const [role, setRole] = useState<AccountRole>("PARENT");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          password: formData.get("password"),
          role,
        }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(result.error ?? "We could not create your account. Please try again.");
        return;
      }

      setMessage(result.message ?? "Check your email for a verification link.");
      form.reset();
    } catch (requestError) {
      console.error("Registration request failed:", requestError);
      setError("We could not reach SPARK. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl font-bold text-spark-indigo-900">
        Join SPARK
      </h1>
      <p className="mt-2 text-spark-indigo-700">
        Create an adult account. Pupil accounts are managed by a parent or guardian.
      </p>

      {message ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900" role="status">
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-1">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-spark-indigo-900">
              I&apos;m joining as a
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(["PARENT", "TEACHER"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={role === option}
                  onClick={() => setRole(option)}
                  className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    role === option
                      ? "border-spark-amber-400 bg-spark-amber-50 text-spark-indigo-900"
                      : "border-spark-indigo-200 text-spark-indigo-700 hover:border-spark-indigo-400"
                  }`}
                >
                  {option === "PARENT" ? "Parent / guardian" : "Teacher"}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-semibold text-spark-indigo-900">
              Full name
            </label>
            <input id="fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={80}
              className="w-full rounded-2xl border-2 border-spark-indigo-200 px-4 py-3 focus:border-spark-amber-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-spark-indigo-900">
              Email
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required maxLength={254}
              className="w-full rounded-2xl border-2 border-spark-indigo-200 px-4 py-3 focus:border-spark-amber-400 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-spark-indigo-900">
              Password
            </label>
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={72}
              aria-describedby="password-hint"
              className="w-full rounded-2xl border-2 border-spark-indigo-200 px-4 py-3 focus:border-spark-amber-400 focus:outline-none" />
            <p id="password-hint" className="mt-1 text-xs text-spark-indigo-600">
              Use at least 12 characters.
            </p>
          </div>
          {role === "TEACHER" && (
            <p className="rounded-xl bg-spark-indigo-50 p-3 text-xs leading-5 text-spark-indigo-700">
              Teacher accounts need identity and qualification review before teaching.
            </p>
          )}
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-spark-indigo-700">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-spark-amber-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
