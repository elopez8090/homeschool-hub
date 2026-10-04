import { startOfAdminMonth } from "@/lib/admin-dates";
import type { AdminStats } from "@/lib/admin-stats-types";
import { getServerSupabase } from "@/lib/supabase-server";

export type { AdminStats };

const STATS_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  expiresAt: number;
  data: AdminStats;
};

let cache: CacheEntry | null = null;

export function invalidateAdminStatsCache() {
  cache = null;
}

function asCount(count: number | null | undefined) {
  return count ?? 0;
}

async function computeAdminStats(): Promise<AdminStats> {
  const client = getServerSupabase();
  const monthStart = startOfAdminMonth();

  const [pendingResult, programsResult, monthResult, approvedResult, totalResult, groupedResult] =
    await Promise.all([
      client
        .from("program_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      client.from("programs").select("*", { count: "exact", head: true }),
      client
        .from("program_submissions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart),
      client
        .from("program_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),
      client.from("program_submissions").select("*", { count: "exact", head: true }),
      fetchPendingGroups(client),
    ]);

  const firstError =
    pendingResult.error ||
    programsResult.error ||
    monthResult.error ||
    approvedResult.error ||
    totalResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const totalSubmissions = asCount(totalResult.count);
  const approvedSubmissions = asCount(approvedResult.count);
  const approvalRate =
    totalSubmissions === 0
      ? 0
      : Math.round((approvedSubmissions / totalSubmissions) * 1000) / 10;

  return {
    pendingCount: asCount(pendingResult.count),
    approvedCount: asCount(programsResult.count),
    thisMonthCount: asCount(monthResult.count),
    approvalRate,
    byState: groupedResult.byState,
    byCategory: groupedResult.byCategory,
  };
}

async function fetchPendingGroups(client: ReturnType<typeof getServerSupabase>) {
  const byState: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("program_submissions")
      .select("state, category")
      .eq("status", "pending")
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of data ?? []) {
      const state = typeof row.state === "string" ? row.state.trim() : "";
      const category = typeof row.category === "string" ? row.category.trim() : "";
      if (state) byState[state] = (byState[state] ?? 0) + 1;
      if (category) byCategory[category] = (byCategory[category] ?? 0) + 1;
    }

    if (!data || data.length < pageSize) break;
  }

  return { byState, byCategory };
}

export async function getAdminStats(options?: { refresh?: boolean }) {
  if (!options?.refresh && cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  const data = await computeAdminStats();
  cache = { data, expiresAt: Date.now() + STATS_TTL_MS };
  return data;
}
