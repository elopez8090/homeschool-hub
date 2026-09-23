"use client";

type SearchFiltersProps = {
  query: string;
  city: string;
  category: string;
  esaOnly: boolean;
  cities: string[];
  categories: string[];
  resultCount: number;
  onQueryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onEsaOnlyChange: (value: boolean) => void;
};

export default function SearchFilters({
  query,
  city,
  category,
  esaOnly,
  cities,
  categories,
  resultCount,
  onQueryChange,
  onCityChange,
  onCategoryChange,
  onEsaOnlyChange,
}: SearchFiltersProps) {
  return (
    <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="block lg:col-span-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-blue-800/70">
            Search programs
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by program name"
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-300 placeholder:text-slate-400 focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-blue-800/70">
            City
          </span>
          <select
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-300 focus:ring-2"
          >
            <option value="">All cities</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-blue-800/70">
            Category
          </span>
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-300 focus:ring-2"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={esaOnly}
            onChange={(event) => onEsaOnlyChange(event.target.checked)}
            className="h-4 w-4 rounded border-blue-300 text-green-600 focus:ring-green-500"
          />
          ESA approved only
        </label>
        <p className="text-sm font-medium text-blue-800">
          {resultCount} {resultCount === 1 ? "program" : "programs"} found
        </p>
      </div>
    </section>
  );
}
