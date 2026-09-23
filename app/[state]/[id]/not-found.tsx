import Link from "next/link";

export default function ProgramNotFound() {
  return (
    <div className="rounded-xl border border-blue-100 bg-white px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold text-blue-900">Program not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        This listing may have been removed or the link is incorrect.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
      >
        Browse states
      </Link>
    </div>
  );
}
