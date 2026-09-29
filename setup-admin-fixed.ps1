# Admin Login System Setup Script for Christian Homeschools Hub
# Run this from your project root directory: .\setup-admin.ps1

Write-Host "Setting up Admin Login System..." -ForegroundColor Cyan
Write-Host ""

# Create folder structure
$folders = @(
    "app/admin/login",
    "app/admin/dashboard",
    "app/api/admin/login",
    "app/api/admin/logout",
    "app/api/admin/verify",
    "hooks"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "[OK] Created folder: $folder" -ForegroundColor Green
    } else {
        Write-Host "[EXISTS] Folder exists: $folder" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Creating files..." -ForegroundColor Cyan
Write-Host ""

# 1. Admin Login API Route
$loginApiContent = @'
// app/api/admin/login/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find admin user
    const { data: admin, error: findError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (findError || !admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordHash = hashPassword(password);
    if (admin.password_hash !== passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashPassword(token);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session
    const { error: sessionError } = await supabase
      .from("admin_sessions")
      .insert({
        admin_id: admin.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Update last login
    await supabase
      .from("admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", admin.id);

    // Return token (to be stored in cookie or localStorage)
    const response = NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });

    // Set httpOnly cookie for security
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
'@

Set-Content -Path "app/api/admin/login/route.ts" -Value $loginApiContent -Encoding UTF8
Write-Host "[OK] Created: app/api/admin/login/route.ts" -ForegroundColor Green

# 2. Admin Logout API Route
$logoutApiContent = @'
// app/api/admin/logout/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 401 }
      );
    }

    const tokenHash = hashPassword(token);

    // Delete session
    await supabase
      .from("admin_sessions")
      .delete()
      .eq("token_hash", tokenHash);

    // Clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", "", {
      httpOnly: true,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
'@

Set-Content -Path "app/api/admin/logout/route.ts" -Value $logoutApiContent -Encoding UTF8
Write-Host "[OK] Created: app/api/admin/logout/route.ts" -ForegroundColor Green

# 3. Admin Verify API Route
$verifyApiContent = @'
// app/api/admin/verify/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const tokenHash = hashPassword(token);

    // Find valid session
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("admin_id, expires_at")
      .eq("token_hash", tokenHash)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from("admin_sessions")
        .delete()
        .eq("token_hash", tokenHash);

      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Get admin user info
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, email, name")
      .eq("id", session.admin_id)
      .single();

    return NextResponse.json({
      authenticated: true,
      admin,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
'@

Set-Content -Path "app/api/admin/verify/route.ts" -Value $verifyApiContent -Encoding UTF8
Write-Host "[OK] Created: app/api/admin/verify/route.ts" -ForegroundColor Green

# 4. Admin Login Page
$loginPageContent = @'
// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Christian Homeschools Hub
            </h1>
            <p className="text-sm text-gray-600 mt-2">Admin Portal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Need help?{" "}
              <a href="mailto:elopez8090@gmail.com" className="text-blue-600 hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
'@

Set-Content -Path "app/admin/login/page.tsx" -Value $loginPageContent -Encoding UTF8
Write-Host "[OK] Created: app/admin/login/page.tsx" -ForegroundColor Green

# 5. Admin Layout
$layoutContent = @'
// app/admin/layout.tsx
"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/admin/login");
    }
  }, [authenticated, loading, router]);

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

  if (!authenticated) {
    return null;
  }

  return children;
}
'@

Set-Content -Path "app/admin/layout.tsx" -Value $layoutContent -Encoding UTF8
Write-Host "[OK] Created: app/admin/layout.tsx" -ForegroundColor Green

# 6. Admin Dashboard
$dashboardContent = @'
// app/admin/dashboard/page.tsx
"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, {admin?.name || admin?.email}
            </p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Programs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
            <p className="text-xs text-gray-500 mt-2">Coming soon</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Featured Programs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
            <p className="text-xs text-gray-500 mt-2">Coming soon</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Pending Submissions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
            <p className="text-xs text-gray-500 mt-2">Coming soon</p>
          </div>
        </div>

        {/* Features Coming Soon */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Admin Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg opacity-60 cursor-not-allowed">
              <h3 className="font-semibold text-gray-900">Manage Programs</h3>
              <p className="text-sm text-gray-600 mt-1">
                View, edit, and delete programs across all states
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg opacity-60 cursor-not-allowed">
              <h3 className="font-semibold text-gray-900">
                Pending Submissions
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Approve or reject program submissions
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg opacity-60 cursor-not-allowed">
              <h3 className="font-semibold text-gray-900">
                Featured Listings
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage featured and ESA badge programs
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg opacity-60 cursor-not-allowed">
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">
                View traffic, engagement, and revenue data
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Back to home
          </Link>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'@

Set-Content -Path "app/admin/dashboard/page.tsx" -Value $dashboardContent -Encoding UTF8
Write-Host "[OK] Created: app/admin/dashboard/page.tsx" -ForegroundColor Green

# 7. useAdminAuth Hook
$hookContent = @'
// hooks/useAdminAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/verify");
      const data = await response.json();

      if (data.authenticated) {
        setAuthenticated(true);
        setAdmin(data.admin);
      } else {
        setAuthenticated(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthenticated(false);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setAuthenticated(false);
      setAdmin(null);
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    admin,
    authenticated,
    loading,
    logout,
    checkAuth,
  };
}
'@

Set-Content -Path "hooks/useAdminAuth.ts" -Value $hookContent -Encoding UTF8
Write-Host "[OK] Created: hooks/useAdminAuth.ts" -ForegroundColor Green

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host "2. Visit: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host "3. Login with your admin account" -ForegroundColor White
Write-Host ""
Write-Host "All files created successfully!" -ForegroundColor Green
