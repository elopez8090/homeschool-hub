import Link from "next/link";
import SubmitForm from "@/components/SubmitForm";
import { formatStateSlug } from "@/lib/states";

type SubmitPageProps = {
  params: { state: string };
};

export default function SubmitPage({ params }: SubmitPageProps) {
  const stateName = formatStateSlug(params.state);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/${params.state}`}
          className="text-sm text-blue-700 hover:text-blue-900"
        >
          ← Back to {stateName}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-blue-900">
          Submit Your Program
        </h1>
        <p className="mt-2 text-slate-600">
          Share a Christ-centered homeschool program in {stateName}. Listings
          are reviewed before they appear in the directory.
        </p>
      </div>
      <SubmitForm stateSlug={params.state} stateName={stateName} />
    </div>
  );
}
