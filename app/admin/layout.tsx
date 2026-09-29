// app/admin/layout.tsx
"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // If not authenticated and not on login page, redirect
    if (!authenticated && !pathname.includes("/login")) {
      router.push("/admin/login");
    }
  }, [authenticated, loading, pathname, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show content if authenticated or on login page
  if (authenticated || pathname.includes("/login")) {
    return children;
  }

  // Redirecting message
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
