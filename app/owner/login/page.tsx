"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: "That sign-in link is missing a token. Request a new one.",
  invalid_token: "That link is invalid, expired, or already used. Request a new one.",
  session_failed: "We could not finish signing you in. Request a new link.",
};

function OwnerLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(ERROR_MESSAGES[searchParams.get("error") || ""] || "");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "Could not send a sign-in link.");
        return;
      }
      setMessage(payload.message || "Check your email for a sign-in link.");
    } catch {
      setError("Could not send a sign-in link. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-semibold text-blue-900">Program owner sign in</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Enter the email you used to claim your program. We&apos;ll send a one-time sign-in link.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-xl border border-blue-100 bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-blue-900">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
            disabled={submitting}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-800">{message}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
        >
          {submitting ? "Sending..." : "Send sign-in link"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Haven&apos;t claimed a listing yet? Open the program and choose Claim this program.{" "}
        <Link href="/" className="font-medium text-blue-700 hover:text-blue-900">
          Browse states
        </Link>
      </p>
    </div>
  );
}

export default function OwnerLoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-600">Loading...</p>}>
      <OwnerLoginForm />
    </Suspense>
  );
}
