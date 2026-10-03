"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ClaimProgramModal from "@/components/ClaimProgramModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import OwnerBadge from "@/components/OwnerBadge";
import type { Program } from "@/lib/types";
import { US_STATES, type USState } from "@/lib/states";

function resolveState(slug: string): USState | undefined {
  const value = decodeURIComponent(slug).trim().toLowerCase();
  return (
    US_STATES.find((state) => state.slug === value) ??
    US_STATES.find((state) => state.abbreviation.toLowerCase() === value)
  );
}

function websiteHref(website: string | null | undefined) {
  if (!website?.trim()) return null;
  return website.startsWith("http") ? website : `https://${website}`;
}

export default function StatePage() {
  const params = useParams<{ state: string }>();
  const slug = typeof params.state === "string" ? params.state : "";
  const state = resolveState(slug);
  const stateCode = (state?.abbreviation ?? slug).toUpperCase();
  const stateName = state?.name ?? stateCode;

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedVerified, setSelectedVerified] = useState("All Programs");

  useEffect(() => {
    if (!stateCode) return;

    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      setSearchTerm("");
      setSelectedCategory("All Categories");
      setSelectedVerified("All Programs");

      try {
        const response = await fetch(
          `/api/programs?state=${encodeURIComponent(stateCode)}`,
        );
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load programs.");
        }

        if (active) {
          setPrograms(payload.programs || []);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load programs.",
          );
          setPrograms([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [stateCode]);

  const categories = useMemo(
    () =>
      Array.from(new Set(programs.map((program) => program.category)))
        .filter(Boolean)
        .sort(),
    [programs],
  );

  const filteredPrograms = useMemo(
    () =>
      programs.filter((program) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          searchTerm === "" ||
          (program.name ?? "").toLowerCase().includes(searchLower) ||
          (program.description?.toLowerCase().includes(searchLower) ?? false) ||
          (program.city ?? "").toLowerCase().includes(searchLower) ||
          (program.category ?? "").toLowerCase().includes(searchLower);

        const matchesCategory =
          selectedCategory === "All Categories" ||
          program.category === selectedCategory;

        const matchesVerified =
          selectedVerified === "All Programs" ||
          (selectedVerified === "Verified Only" && program.owner_verified) ||
          (selectedVerified === "Unverified Only" && !program.owner_verified);

        return matchesSearch && matchesCategory && matchesVerified;
      }),
    [programs, searchTerm, selectedCategory, selectedVerified],
  );

  const filtersActive =
    searchTerm !== "" ||
    selectedCategory !== "All Categories" ||
    selectedVerified !== "All Programs";

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setSelectedVerified("All Programs");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-900">
            ← All states
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-blue-900 sm:text-4xl">
            {stateName} Homeschool Programs
          </h1>
          <p className="mt-2 text-slate-600">
            Programs and resources in {stateName}
            {state ? ` (${state.abbreviation})` : ""}.
          </p>
        </div>
        <Link
          href={`/${slug}/submit`}
          className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Submit a program
        </Link>
      </div>

      {loading ? <LoadingSpinner label="Loading programs..." /> : null}

      {!loading && error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!loading && !error && programs.length === 0 ? (
        <section className="rounded-xl border border-dashed border-blue-200 bg-white px-6 py-12 text-center">
          <h2 className="text-xl font-semibold text-blue-900">
            No programs found for {stateName}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Know a program in {stateName}? Add it so other families can find it.
          </p>
        </section>
      ) : null}

      {!loading && !error && programs.length > 0 ? (
        <div className="space-y-4">
          <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="relative w-full lg:w-1/2">
                <label htmlFor="program-search" className="sr-only">
                  Search programs
                </label>
                <input
                  id="program-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search programs by name, description, or city..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                ) : null}
              </div>

              <div className="flex flex-1 flex-wrap items-end gap-3">
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
                  Category:
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All Categories">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
                  Status:
                  <select
                    value={selectedVerified}
                    onChange={(event) => setSelectedVerified(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All Programs">All Programs</option>
                    <option value="Verified Only">Verified Only</option>
                    <option value="Unverified Only">Unverified Only</option>
                  </select>
                </label>

                {filtersActive ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <p className="text-sm text-slate-600">
            Showing {filteredPrograms.length} of {programs.length} programs
          </p>

          {filteredPrograms.length === 0 ? (
            <p className="rounded-xl border border-dashed border-blue-200 bg-white px-6 py-12 text-center text-slate-600">
              No programs match your search filters
            </p>
          ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program) => {
            const site = websiteHref(program.website);

            return (
              <li key={program.id}>
                <article className="flex h-full flex-col rounded-xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                  {program.owner_verified ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <OwnerBadge />
                    </div>
                  ) : null}

                  <h2 className="mt-3 text-lg font-semibold text-blue-900">
                    <Link
                      href={`/${slug}/${program.id}`}
                      className="hover:text-blue-700"
                    >
                      {program.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {program.city}, {program.state} · {program.category}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {program.description}
                  </p>

                  <dl className="mt-4 space-y-1.5 text-sm">
                    {program.contact_email ? (
                      <div>
                        <dt className="sr-only">Email</dt>
                        <dd>
                          <a
                            href={`mailto:${program.contact_email}`}
                            className="text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {program.contact_email}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    {program.phone ? (
                      <div>
                        <dt className="sr-only">Phone</dt>
                        <dd>
                          <a
                            href={`tel:${program.phone}`}
                            className="text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {program.phone}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    {site ? (
                      <div>
                        <dt className="sr-only">Website</dt>
                        <dd>
                          <a
                            href={site}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {program.website}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-5">
                    {program.owner_verified ? null : (
                      <ClaimProgramModal
                        programId={String(program.id)}
                        programName={program.name}
                      />
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
