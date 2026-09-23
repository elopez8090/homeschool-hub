"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { PendingSubmission } from "@/lib/types";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const password = searchParams.get("password") || "";

  const [loginPassword, setLoginPassword] = useState("");
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(Boolean(password));
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(!password);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    if (!password) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/submissions", {
          headers: { "x-admin-password": password },
        });

        if (response.status === 401) {
          if (active) {
            setUnauthorized(true);
            setSubmissions([]);
          }
          return;
        }

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load submissions.");
        }

        if (active) {
          setUnauthorized(false);
          setSubmissions(payload.submissions || []);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load submissions.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [password]);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/admin/dashboard?password=${encodeURIComponent(loginPassword)}`);
  }

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setError("");

    try {
      const response = await fetch(`/api/submissions/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || `Unable to ${action} this submission.`);
      }

      setSubmissions((current) => current.filter((item) => item.id !== id));
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : `Unable to ${action} this submission.`,
      );
    } finally {
      setBusyId("");
    }
  }

  if (unauthorized) {
    return (
      <form
        onSubmit={handleLogin}
        className="mx-auto max-w-md space-y-4 rounded-xl border border-blue-100 bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-blue-900">Admin login</h1>
        <p className="text-sm text-slate-600">
          Enter the admin password to review pending submissions.
        </p>
        <input
          type="password"
          value={loginPassword}
          onChange={(event) => setLoginPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Continue
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-blue-900">Admin dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review pending program submissions. Approving a listing publishes it
          and emails the program owner.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <LoadingSpinner label="Loading submissions..." />
      ) : submissions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-blue-200 bg-white px-6 py-10 text-center text-slate-600">
          No pending submissions right now.
        </p>
      ) : (
        <ul className="space-y-4">
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">
                    {submission.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {submission.city} · {submission.category}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {submission.contact_email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Submitted {formatDate(submission.submitted_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === submission.id}
                    onClick={() => review(submission.id, "approve")}
                    className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === submission.id}
                    onClick={() => review(submission.id, "reject")}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
