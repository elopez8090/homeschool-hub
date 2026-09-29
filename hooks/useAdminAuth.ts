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
