import Link from "next/link";
import { notFound } from "next/navigation";
import { EsaBadge, FeaturedBadge } from "@/components/ProgramBadges";
import { fetchProgramById } from "@/lib/programs";
import { formatStateSlug, getStateBySlug } from "@/lib/states";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type ProgramPageProps = {
  params: { state: string; id: string };
};

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { program, error } = await fetchProgramById(
    getServerSupabase(),
    params.id,
  );

  if (error || !program) {
    notFound();
  }

  const stateName = formatStateSlug(params.state);
  const known = getStateBySlug(params.state);
  const matchesState = [params.state, known?.abbreviation, known?.name]
    .filter(Boolean)
    .some((value) => value!.toLowerCase() === program.state.toLowerCase());

  if (!matchesState) {
    notFound();
  }

  const website = program.website
    ? program.website.startsWith("http")
      ? program.website
      : `https://${program.website}`
    : null;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/${params.state}`}
          className="text-sm text-blue-700 hover:text-blue-900"
        >
          ← Back to {stateName}
        </Link>
        <div className="mt-4 flex flex-wrap gap-2">
          {program.featured ? <FeaturedBadge /> : null}
          {program.esa_verified ? <EsaBadge /> : null}
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-blue-900 sm:text-4xl">
          {program.name}
        </h1>
        <p className="mt-2 text-slate-600">
          {program.city}, {stateName} · {program.category}
        </p>
      </div>

      <section className="rounded-xl border border-blue-100 bg-white px-6 py-8 shadow-sm">
        <p className="whitespace-pre-wrap text-slate-700 leading-7">
          {program.description}
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Contact email
            </dt>
            <dd className="mt-1 font-medium text-blue-900">
              {program.contact_email}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Website
            </dt>
            <dd className="mt-1 font-medium text-blue-900">
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  {program.website}
                </a>
              ) : (
                "Not listed"
              )}
            </dd>
          </div>
        </dl>
        <a
          href={`mailto:${program.contact_email}`}
          className="mt-8 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Contact program
        </a>
      </section>
    </div>
  );
}
