import Link from "next/link";
import UpgradeSuccess from "@/components/UpgradeSuccess";

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  params: { state: string; id: string };
  searchParams: { session_id?: string };
};

export default function UpgradeSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const programPath = `/${params.state}/${params.id}`;
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <section className="rounded-xl border border-blue-100 bg-white px-6 py-10">
        <h1 className="text-2xl font-semibold text-blue-900">Missing checkout session</h1>
        <p className="mt-2 text-sm text-slate-600">
          We could not find a Stripe session on this page. If you completed payment,
          your listing will still update when the webhook arrives.
        </p>
        <Link
          href={programPath}
          className="mt-6 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Back to program page
        </Link>
      </section>
    );
  }

  return <UpgradeSuccess sessionId={sessionId} programPath={programPath} />;
}
