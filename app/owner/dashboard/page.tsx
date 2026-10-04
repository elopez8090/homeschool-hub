"use client";

import { Suspense } from "react";
import OwnerDashboard from "@/components/OwnerDashboard";

export default function OwnerDashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-600">Loading your programs...</p>}>
      <OwnerDashboard />
    </Suspense>
  );
}
