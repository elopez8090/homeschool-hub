"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import OwnerBadge from "@/components/OwnerBadge";
import type { Program } from "@/lib/types";

function publicPath(program: Pick<Program, "id" | "state">) {
  const state = program.state.trim().toLowerCase().replace(/\s+/g, "-");
  return `/${state}/${program.id}`;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const notice = searchParams.get("notice");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/owner/programs");
        if (response.status === 401) {
          router.replace("/owner/login");
          return;
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Could not load your programs.");
        }
        if (!cancelled) {
          setEmail(payload.email || "");
          setPrograms(payload.programs || []);
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
  }, [router]);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/");
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading your programs...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-blue-900">Your programs</h1>
          {email ? <p className="mt-1 text-sm text-slate-600">Signed in as {email}</p> : null}
        </div>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="inline-flex rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50 disabled:opacity-60"
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
          <p className="text-slate-700">You have not claimed a program yet.</p>
          <p className="mt-2 text-sm text-slate-600">
            Open your listing and choose Claim this program. The link is sent to the contact email
            on that listing.
          </p>
          <Link href="/" className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900">
            Browse states
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {programs.map((program) => (
            <li
              key={program.id}
              className="rounded-xl border border-blue-100 bg-white px-5 py-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-blue-900">{program.name}</h2>
                {program.owner_verified ? <OwnerBadge /> : null}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {program.city}, {program.state} · {program.category}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                <Link
                  href={`/owner/programs/${program.id}/edit`}
                  className="text-blue-700 hover:text-blue-900"
                >
                  Edit
                </Link>
                <Link href={publicPath(program)} className="text-blue-700 hover:text-blue-900">
                  View listing
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
