import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/app/admin/dashboard";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/lib/admin";
import { fetchPendingSubmissions } from "@/lib/programs";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!(await isAdminCookieValid(token))) {
    redirect("/admin");
  }

  const { submissions, error } = await fetchPendingSubmissions(getServerSupabase());

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Unable to load submissions: {error.message}
      </div>
    );
  }

  return <AdminDashboard initialSubmissions={submissions} />;
}
