"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function AdminDashboard({
  initialSubmissions,
}: {
  initialSubmissions: PendingSubmission[];
}) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: id }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || `Unable to ${action} this submission.`);
      }

      setSubmissions((current) => current.filter((item) => item.id !== id));
      setSuccess(
        action === "approve"
          ? "Program approved. It is now live and the owner has been notified."
          : "Submission rejected. The owner has been notified.",
      );
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

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-blue-900">Welcome, Admin!</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review pending program submissions. Approving a listing publishes it
            and emails the program owner.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50 disabled:opacity-50"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {success}
        </p>
      ) : null}

      {submissions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-blue-200 bg-white px-6 py-10 text-center text-slate-600">
          No pending submissions right now.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-blue-50 text-blue-900">
              <tr>
                <th className="px-4 py-3 font-semibold">Program name</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Contact email</th>
                <th className="px-4 py-3 font-semibold">Submitted date</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-t border-blue-100">
                  <td className="px-4 py-3 font-medium text-blue-900">
                    {submission.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{submission.city}</td>
                  <td className="px-4 py-3 text-slate-700">{submission.category}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {submission.contact_email}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(submission.submitted_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === submission.id}
                        onClick={() => review(submission.id, "approve")}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {busyId === submission.id ? "Working..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === submission.id}
                        onClick={() => review(submission.id, "reject")}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
