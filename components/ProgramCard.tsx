import Link from "next/link";
import { EsaBadge, FeaturedBadge } from "@/components/ProgramBadges";
import type { Program } from "@/lib/types";

function excerpt(text: string, max = 150) {
  const value = (text || "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
}

export default function ProgramCard({
  program,
  stateSlug,
}: {
  program: Program;
  stateSlug: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <div className="flex flex-wrap gap-2">
        {program.featured ? <FeaturedBadge /> : null}
        {program.esa_verified ? <EsaBadge /> : null}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-blue-900">
        <Link href={`/${stateSlug}/${program.id}`} className="hover:text-blue-700">
          {program.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-blue-800/70">
        {program.city} · {program.category}
      </p>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
        {excerpt(program.description)}
      </p>
      <Link
        href={`/${stateSlug}/${program.id}`}
        className="mt-4 text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        View program →
      </Link>
    </article>
  );
}
