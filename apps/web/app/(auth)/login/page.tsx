"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Sign-in failed. Check your details, and make sure your email is verified.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (requestError) {
      console.error("Sign-in request failed:", requestError);
      setError("We could not reach SPARK. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl font-bold text-spark-indigo-900">
        Welcome back
      </h1>
      <p className="mt-2 text-spark-indigo-700">
        Sign in to continue your spark.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-spark-indigo-900">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border-2 border-spark-indigo-200 px-4 py-3 focus:border-spark-amber-400 focus:outline-none"
          />
        </div>
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-spark-amber-600">
            Forgot password?
          </Link>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-spark-indigo-900">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border-2 border-spark-indigo-200 px-4 py-3 focus:border-spark-amber-400 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-spark-indigo-700">
        New to SPARK?{" "}
        <a href="/register" className="font-semibold text-spark-amber-600">
          Create an account
        </a>
      </p>
      <p className="mt-2 text-sm text-spark-indigo-700">
        Need a verification link?{" "}
        <Link href="/resend-verification" className="font-semibold text-spark-amber-600">
          Resend it
        </Link>
      </p>
    </div>
  );
}