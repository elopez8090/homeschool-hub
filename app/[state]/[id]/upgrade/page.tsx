import Link from "next/link";
import { notFound } from "next/navigation";
import { EsaBadge, FeaturedBadge } from "@/components/ProgramBadges";
import UpgradePlans from "@/components/UpgradePlans";
import { fetchProgramById } from "@/lib/programs";
import { formatStateSlug } from "@/lib/states";
import { getServerSupabase } from "@/lib/supabase-server";
import { isEsaActive, isFeaturedActive } from "@/lib/upgrades";

export const dynamic = "force-dynamic";

type UpgradePageProps = {
  params: { state: string; id: string };
};

export default async function UpgradePage({ params }: UpgradePageProps) {
  const { program, error } = await fetchProgramById(
    getServerSupabase(),
    params.id,
  );

  if (error || !program) {
    notFound();
  }

  const stateName = formatStateSlug(params.state);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/${params.state}/${params.id}`}
          className="text-sm text-blue-700 hover:text-blue-900"
        >
          ← Back to {program.name}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-blue-900 sm:text-4xl">
          Upgrade your listing
        </h1>
        <p className="mt-2 text-slate-600">
          Choose a monthly subscription to stand out in {stateName}.
        </p>
      </div>

      <section className="rounded-xl border border-blue-100 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {isFeaturedActive(program) ? <FeaturedBadge /> : null}
          {isEsaActive(program) ? <EsaBadge /> : null}
        </div>
        <h2 className="mt-3 text-xl font-semibold text-blue-900">{program.name}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {program.city}, {stateName} · {program.category}
        </p>
      </section>

      <UpgradePlans
        program={program}
        featuredActive={program.featured === true}
        esaActive={program.esa_verified === true}
      />
    </div>
  );
}
