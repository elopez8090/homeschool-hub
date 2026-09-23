"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { US_STATES } from "@/lib/states";

export default function StateDirectory() {
  const [query, setQuery] = useState("");

  const filteredStates = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return US_STATES;

    return US_STATES.filter(
      (state) =>
        state.name.toLowerCase().includes(term) ||
        state.abbreviation.toLowerCase().includes(term) ||
        state.slug.includes(term),
    );
  }, [query]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-blue-900">Browse by state</h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose a state to view Christian homeschool programs in that area.
          </p>
        </div>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Search states</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search states..."
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-300 placeholder:text-slate-400 focus:ring-2"
          />
        </label>
      </div>

      {filteredStates.length === 0 ? (
        <p className="rounded-lg border border-dashed border-blue-200 bg-white px-4 py-8 text-center text-slate-600">
          No states match “{query}”.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filteredStates.map((state) => (
            <li key={state.slug}>
              <Link
                href={`/${state.slug}`}
                className="flex items-center justify-between rounded-lg border border-blue-100 bg-white px-4 py-3 text-blue-900 shadow-sm transition hover:border-blue-400 hover:shadow"
              >
                <span className="font-medium">{state.name}</span>
                <span className="text-xs tracking-wide text-blue-700/60">
                  {state.abbreviation}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
