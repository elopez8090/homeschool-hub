import Link from "next/link";
import ProgramDirectory from "@/components/ProgramDirectory";
import { fetchProgramsByState } from "@/lib/programs";
import { formatStateSlug, getStateBySlug } from "@/lib/states";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type StatePageProps = {
  params: { state: string };
};

export default async function StatePage({ params }: StatePageProps) {
  const state = getStateBySlug(params.state);
  const stateName = formatStateSlug(params.state);
  const { programs } = await fetchProgramsByState(
    getServerSupabase(),
    params.state,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-900">
            ← All states
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-blue-900 sm:text-4xl">
            {stateName} Christian Homeschools
          </h1>
          <p className="mt-2 text-slate-600">
            Search programs and resources in {stateName}
            {state ? ` (${state.abbreviation})` : ""}.
          </p>
        </div>
        <Link
          href={`/${params.state}/submit`}
          className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Submit a program
        </Link>
      </div>

      <ProgramDirectory
        stateSlug={params.state}
        stateName={stateName}
        initialPrograms={programs}
      />
    </div>
  );
}
