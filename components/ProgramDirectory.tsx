"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgramCard from "@/components/ProgramCard";
import SearchFilters from "@/components/SearchFilters";
import { PROGRAM_CATEGORIES, type Program } from "@/lib/types";
import { isEsaActive, isFeaturedActive } from "@/lib/upgrades";

export default function ProgramDirectory({
  stateSlug,
  stateName,
  initialPrograms,
}: {
  stateSlug: string;
  stateName: string;
  initialPrograms?: Program[];
}) {
  const hasInitial = Array.isArray(initialPrograms);
  const [programs, setPrograms] = useState<Program[]>(initialPrograms || []);
  const [loading, setLoading] = useState(!hasInitial);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [esaOnly, setEsaOnly] = useState(false);

  useEffect(() => {
    if (hasInitial) return;

    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/programs?state=${encodeURIComponent(stateSlug)}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load programs.");
        }

        if (active) {
          setPrograms(payload.programs || []);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load programs.",
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
  }, [stateSlug, hasInitial]);

  const cities = useMemo(
    () =>
      Array.from(new Set(programs.map((program) => program.city).filter(Boolean))).sort(),
    [programs],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesName = term ? program.name.toLowerCase().includes(term) : true;
      const matchesCity = city ? program.city === city : true;
      const matchesCategory = category ? program.category === category : true;
      const matchesEsa = esaOnly ? isEsaActive(program) : true;
      return matchesName && matchesCity && matchesCategory && matchesEsa;
    }).sort((a, b) => Number(isFeaturedActive(b)) - Number(isFeaturedActive(a)));
  }, [programs, query, city, category, esaOnly]);

  if (loading) {
    return <LoadingSpinner label="Loading programs..." />;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <SearchFilters
        query={query}
        city={city}
        category={category}
        esaOnly={esaOnly}
        cities={cities}
        categories={[...PROGRAM_CATEGORIES]}
        resultCount={filtered.length}
        onQueryChange={setQuery}
        onCityChange={setCity}
        onCategoryChange={setCategory}
        onEsaOnlyChange={setEsaOnly}
      />

      {filtered.length === 0 ? (
        <section className="rounded-xl border border-dashed border-blue-200 bg-white px-6 py-12 text-center">
          <h2 className="text-xl font-semibold text-blue-900">
            No programs found. Be first to add one!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Help families in {stateName} discover Christ-centered programs.
          </p>
          <Link
            href={`/${stateSlug}/submit`}
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Submit a program
          </Link>
        </section>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((program) => (
            <li key={program.id}>
              <ProgramCard program={program} stateSlug={stateSlug} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
