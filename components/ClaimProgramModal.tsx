"use client";

import { useEffect, useId, useState } from "react";

export default function ClaimProgramModal({
  programId,
  programName,
}: {
  programId: string;
  programName: string;
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
    setError("");
    setSubmitting(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          programId,
          programName,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "Could not send a verification link.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not send a verification link. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSent(false);
          setError("");
          setOpen(true);
        }}
        className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
      >
        Claim this program
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-blue-950/40"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-md rounded-xl border border-blue-100 bg-white p-6 shadow-lg"
          >
            <h2 id={titleId} className="text-lg font-semibold text-blue-900">
              Claim {programName}
            </h2>
            {sent ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm leading-6 text-slate-700">
                  Check your email for a link to claim this program. The link expires in 24 hours
                  and can only be used once.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                  Enter the contact email listed on this program. We&apos;ll send a one-time link
                  to verify you and mark the listing as yours.
                </p>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-blue-900">Email</span>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
                    disabled={submitting}
                  />
                </label>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
                  >
                    {submitting ? "Sending..." : "Send verification link"}
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="text-sm font-medium text-blue-700 hover:text-blue-900"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
