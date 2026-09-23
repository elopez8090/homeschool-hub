import Link from "next/link";
import { formatStateSlug, getStateBySlug } from "@/lib/states";

type StatePageProps = {
  params: { state: string };
};

export default function StatePage({ params }: StatePageProps) {
  const state = getStateBySlug(params.state);
  const stateName = formatStateSlug(params.state);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-navy/60 hover:text-navy">
          ← All states
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-navy sm:text-4xl">
          {stateName} Christian Homeschools
        </h1>
        <p className="mt-2 text-navy/70">
          Programs and resources in {stateName}
          {state ? ` (${state.abbreviation})` : ""}. Directory listings will
          appear here once the database is connected.
        </p>
      </div>

      <section className="rounded-xl border border-dashed border-navy/20 bg-white px-6 py-10">
        <h2 className="text-lg font-semibold text-navy">No programs yet</h2>
        <p className="mt-2 max-w-2xl text-sm text-navy/70">
          This state page reads <code className="rounded bg-cream px-1.5 py-0.5">
            {params.state}
          </code>{" "}
          from the URL. Sample program pages are available so routing can be
          tested before listings are added.
        </p>
        <Link
          href={`/${params.state}/sample-program`}
          className="mt-6 inline-flex rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream hover:bg-navy/90"
        >
          View sample program
        </Link>
      </section>
    </div>
  );
}
