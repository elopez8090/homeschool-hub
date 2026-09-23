export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-blue-800">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700"
        aria-hidden
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
