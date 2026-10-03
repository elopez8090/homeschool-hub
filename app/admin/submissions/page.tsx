"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface Submission {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  category: string;
  contact_email: string;
  phone: string;
  website: string;
  created_at: string;
  status: "pending" | "approved" | "denied";
}

type BusyAction = {
  id: string;
  action: "approve" | "deny";
};

function formatSubmittedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ProgramSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [denyingId, setDenyingId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState("");

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/submissions");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load submissions.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const removeSubmission = (id: string) => {
    setSubmissions((current) => current.filter((submission) => submission.id !== id));
    setDenyingId(null);
    setDenyReason("");
  };

  const handleApprove = async (id: string) => {
    setBusy({ id, action: "approve" });
    setNotice("");

    try {
      const response = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve submission.");
      }

      removeSubmission(id);
      setNotice(data.message || "Submission approved.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve submission.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeny = async (id: string) => {
    setBusy({ id, action: "deny" });
    setNotice("");

    try {
      const response = await fetch(`/api/admin/submissions/${id}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: denyReason.trim() }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to deny submission.");
      }

      removeSubmission(id);
      setNotice(data.message || "Submission denied.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to deny submission.");
    } finally {
      setBusy(null);
    }
  };

  const openDenyForm = (id: string) => {
    setDenyingId(id);
    setDenyReason("");
  };

  const cancelDeny = () => {
    setDenyingId(null);
    setDenyReason("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Program Submissions</h1>
              <p className="mt-1 text-gray-600">
                Review new program submissions and approve or deny each one.
              </p>
            </div>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/admin/dashboard" className="text-blue-600 transition hover:text-blue-900">
                Dashboard
              </Link>
              <Link href="/admin/programs" className="text-blue-600 transition hover:text-blue-900">
                Programs
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Pending submissions</p>
          <p className="mt-2 text-4xl font-bold text-blue-600">
            {loading ? "--" : submissions.length}
          </p>
          <p className="mt-2 text-xs text-gray-500">Awaiting review</p>
        </div>

        {notice && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            {notice}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">Loading submissions...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchSubmissions}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div className="rounded-lg bg-white px-6 py-16 text-center shadow">
            <p className="text-lg font-semibold text-gray-900">No pending submissions</p>
            <p className="mt-2 text-gray-600">
              New program submissions will appear here when they are ready for review.
            </p>
          </div>
        )}

        {!loading && !error && submissions.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {submissions.map((submission) => {
              const isBusy = busy?.id === submission.id;
              const isDenying = denyingId === submission.id;
              const actionsLocked = busy !== null;

              return (
                <article
                  key={submission.id}
                  className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900">{submission.name}</h2>
                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {submission.category}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {submission.city}, {submission.state}
                  </p>

                  <dl className="mt-4 space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${submission.contact_email}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {submission.contact_email}
                        </a>
                      </dd>
                    </div>
                    {submission.phone && (
                      <div>
                        <dt className="font-medium text-gray-500">Phone</dt>
                        <dd>
                          <a
                            href={`tel:${submission.phone}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {submission.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {submission.website && (
                      <div>
                        <dt className="font-medium text-gray-500">Website</dt>
                        <dd>
                          <a
                            href={submission.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-blue-600 hover:text-blue-900"
                          >
                            {submission.website}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                    {submission.description}
                  </p>

                  <p className="mt-4 text-xs text-gray-500">
                    Submitted {formatSubmittedDate(submission.created_at)}
                  </p>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    {isDenying ? (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Denial reason
                          <span className="ml-1 font-normal text-gray-500">(optional)</span>
                          <textarea
                            value={denyReason}
                            onChange={(event) => setDenyReason(event.target.value)}
                            disabled={actionsLocked}
                            rows={3}
                            placeholder="Tell the submitter why this was denied"
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
                          />
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => handleDeny(submission.id)}
                            disabled={actionsLocked}
                            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy && busy.action === "deny" ? "Denying..." : "Confirm Deny"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelDeny}
                            disabled={actionsLocked}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleApprove(submission.id)}
                          disabled={actionsLocked}
                          className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy && busy.action === "approve" ? "Approving..." : "✓ Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDenyForm(submission.id)}
                          disabled={actionsLocked}
                          className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          ✗ Deny
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
