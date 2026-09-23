import { Suspense } from "react";
import AdminDashboard from "@/app/admin/dashboard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading dashboard..." />}>
      <AdminDashboard />
    </Suspense>
  );
}
