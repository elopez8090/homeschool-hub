import Link from "next/link";
import { formatStateSlug } from "@/lib/states";

type ProgramPageProps = {
  params: { state: string; id: string };
};

export default function ProgramPage({ params }: ProgramPageProps) {
  const stateName = formatStateSlug(params.state);
  const programLabel = params.id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/${params.state}`}
          className="text-sm text-navy/60 hover:text-navy"
        >
          ← Back to {stateName}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-navy sm:text-4xl">
          {programLabel}
        </h1>
        <p className="mt-2 text-navy/70">
          Program detail for{" "}
          <code className="rounded bg-white px-1.5 py-0.5">{params.id}</code> in{" "}
          {stateName}.
        </p>
      </div>

      <section className="rounded-xl border border-navy/10 bg-white px-6 py-8 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-navy/50">
              State
            </dt>
            <dd className="mt-1 font-medium text-navy">{stateName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-navy/50">
              Program ID
            </dt>
            <dd className="mt-1 font-medium text-navy">{params.id}</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-navy/70">
          Full program details will load from Supabase once the directory tables
          are created.
        </p>
      </section>
    </div>
  );
}
