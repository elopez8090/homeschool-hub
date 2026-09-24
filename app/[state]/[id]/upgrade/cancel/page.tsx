import Link from "next/link";

type CancelPageProps = {
  params: { state: string; id: string };
};

export default function UpgradeCancelPage({ params }: CancelPageProps) {
  return (
    <section className="rounded-xl border border-blue-100 bg-white px-6 py-10">
      <h1 className="text-2xl font-semibold text-blue-900">Checkout canceled</h1>
      <p className="mt-2 text-sm text-slate-600">
        No charge was made. You can return to the upgrade page whenever you are ready.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/${params.state}/${params.id}/upgrade`}
          className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Back to upgrade options
        </Link>
        <Link
          href={`/${params.state}/${params.id}`}
          className="inline-flex rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50"
        >
          Program page
        </Link>
      </div>
    </section>
  );
}
