import { Suspense } from "react";
import OwnerDashboard from "@/components/OwnerDashboard";

export const dynamic = "force-dynamic";

export default function OwnerProgramsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-600">Loading your programs...</p>}>
      <OwnerDashboard />
    </Suspense>
  );
}
