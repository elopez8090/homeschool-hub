// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface DashboardStats {
  totalPrograms: number;
  featuredPrograms: number;
  pendingSubmissions: number;
}

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    featuredPrograms: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [programsResponse, submissionsResponse] = await Promise.all([
        fetch("/api/admin/programs"),
        fetch("/api/admin/submissions"),
      ]);

      let totalPrograms = 0;
      let featuredPrograms = 0;
      let pendingSubmissions = 0;

      if (programsResponse.ok) {
        const data = await programsResponse.json();
        const programs = data.programs || [];
        totalPrograms = programs.length;
        featuredPrograms = programs.filter((p: { featured: boolean }) => p.featured).length;
      }

      if (submissionsResponse.ok) {
        const submissions = await submissionsResponse.json();
        if (Array.isArray(submissions)) {
          pendingSubmissions = submissions.length;
        } else if (typeof submissions?.total === "number") {
          pendingSubmissions = submissions.total;
        } else if (Array.isArray(submissions?.submissions)) {
          pendingSubmissions = submissions.submissions.length;
        }
      }

      setStats({ totalPrograms, featuredPrograms, pendingSubmissions });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {admin?.name || "Admin"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/admin/submissions"
              className="font-medium text-blue-600 transition hover:text-blue-900"
            >
              Submissions
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-red-600 hover:text-red-900 font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Programs</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              {loading ? "--" : stats.totalPrograms}
            </p>
            <p className="text-gray-500 text-xs mt-2">Across all states</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Featured Programs</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">
              {loading ? "--" : stats.featuredPrograms}
            </p>
            <p className="text-gray-500 text-xs mt-2">Premium listings</p>
          </div>

          <Link
            href="/admin/submissions"
            className="bg-white rounded-lg shadow p-6 transition hover:shadow-md"
          >
            <p className="text-gray-600 text-sm font-medium">
              Pending Submissions
            </p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {loading ? "--" : stats.pendingSubmissions}
            </p>
            <p className="text-gray-500 text-xs mt-2">Awaiting approval</p>
          </Link>
        </div>

        {/* Admin Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Settings */}
            <Link
              href="/admin/settings"
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer"
            >
              <h3 className="font-semibold text-gray-900">Admin Settings</h3>
              <p className="text-sm text-gray-600 mt-1">
                Update your password and account preferences
              </p>
            </Link>

            {/* Manage Programs */}
            <Link
              href="/admin/programs"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
            >
              <h3 className="font-semibold text-gray-900">Manage Programs</h3>
              <p className="text-sm text-gray-600 mt-1">
                View, edit, and delete programs across all states
              </p>
            </Link>

            {/* Featured Listings */}
            <Link
              href="/admin/programs"
              className="p-4 border border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition cursor-pointer"
            >
              <h3 className="font-semibold text-gray-900">Featured Listings</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage featured and ESA badge programs
              </p>
            </Link>

            {/* Pending Submissions */}
            <Link
              href="/admin/submissions"
              className="p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition cursor-pointer"
            >
              <h3 className="font-semibold text-gray-900">Pending Submissions</h3>
              <p className="text-sm text-gray-600 mt-1">
                Approve or deny program submissions
              </p>
            </Link>

            {/* Analytics */}
            <div className="p-4 border border-gray-200 rounded-lg opacity-50">
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">
                View traffic, engagement, and revenue data
              </p>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-900 transition">
            ← Back to home
          </Link>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sign Out?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to sign out of your admin account?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
