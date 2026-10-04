"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { programPath, stateDisplayName } from "@/lib/states";

type OwnerProgram = {
  id: string | number;
  name: string;
  city: string;
  state: string;
  owner_verified?: boolean;
  updated_at?: string | null;
};

function formatUpdated(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function locationLabel(program: OwnerProgram) {
  const state = stateDisplayName(program.state);
  return [program.city, state].filter(Boolean).join(", ");
}

export default function OwnerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [programs, setPrograms] = useState<OwnerProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const notice = searchParams.get("notice");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/owner/programs");
        if (response.status === 401) {
          if (!cancelled) setAuthenticated(false);
          return;
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Could not load your programs.");
        }
        if (!cancelled) {
          setAuthenticated(true);
          setEmail(payload.email || "");
          setPrograms(Array.isArray(payload) ? payload : payload.programs || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load your programs.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading your programs...</p>;
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-blue-100 bg-white px-6 py-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-blue-900">Manage Your Programs</h1>
        <p className="mt-3 text-base text-slate-700">Sign in to manage your programs</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use the email from your claim link. If you have not claimed a listing yet, open a
          program and choose Claim this program.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/owner/login"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Sign in
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50"
          >
            Browse programs to claim one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-blue-900">Manage Your Programs</h1>
          <p className="mt-2 text-slate-600">View and edit your claimed programs</p>
          {email ? <p className="mt-1 text-sm text-slate-500">Signed in as {email}</p> : null}
        </div>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50 disabled:opacity-60"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {notice === "taken" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          That program was already claimed by someone else. You are signed in, and your other
          programs are listed below.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {programs.length === 0 ? (
        <div className="rounded-xl border border-blue-100 bg-white px-6 py-8 shadow-sm">
          <p className="text-lg font-medium text-blue-900">No programs yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Browse the directory and claim a program from its listing page. The claim link is
            sent to the contact email on that listing.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            Browse programs and claim one
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 text-blue-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Program Name</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Last Updated</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id} className="border-t border-blue-100">
                    <td className="px-4 py-4 font-medium text-blue-950">{program.name}</td>
                    <td className="px-4 py-4 text-slate-700">{locationLabel(program)}</td>
                    <td className="px-4 py-4">
                      <StatusBadge verified={Boolean(program.owner_verified)} />
                    </td>
                    <td className="px-4 py-4 text-slate-700">{formatUpdated(program.updated_at)}</td>
                    <td className="px-4 py-4">
                      <ProgramActions program={program} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-4 md:hidden">
            {programs.map((program) => (
              <li
                key={program.id}
                className="rounded-xl border border-blue-100 bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-blue-900">{program.name}</h2>
                  <StatusBadge verified={Boolean(program.owner_verified)} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-blue-800">Location</dt>
                    <dd className="text-slate-700">{locationLabel(program)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-blue-800">Last Updated</dt>
                    <dd className="text-slate-700">{formatUpdated(program.updated_at)}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <ProgramActions program={program} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        verified ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
      }`}
    >
      {verified ? "Verified" : "Pending Verification"}
    </span>
  );
}

function ProgramActions({ program }: { program: OwnerProgram }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm font-medium">
      <Link
        href={`/owner/programs/${program.id}/edit`}
        className="inline-flex min-h-10 items-center rounded-lg bg-blue-700 px-3 py-1.5 text-white hover:bg-blue-800"
      >
        Edit
      </Link>
      <Link
        href={programPath(program.state, program.id)}
        className="inline-flex min-h-10 items-center rounded-lg border border-blue-200 px-3 py-1.5 text-blue-800 hover:bg-blue-50"
      >
        View
      </Link>
    </div>
  );
}
