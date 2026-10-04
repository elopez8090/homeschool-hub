"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { AdminStats } from "@/lib/admin-stats-types";
import { stateAbbreviation, stateDisplayName, US_STATES } from "@/lib/states";
import { PROGRAM_SUBMISSION_CATEGORIES } from "@/lib/validation";

const PAGE_SIZE = 15;
const STATS_CACHE_MS = 5 * 60 * 1000;

const SubmissionCharts = dynamic(() => import("@/components/admin/SubmissionCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
    </div>
  ),
});

interface Submission {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  category: string;
  contact_email: string;
  submitted_by?: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
  status: string;
}

type BusyAction = {
  id: string;
  action: "approve" | "deny";
};

type Toast = {
  tone: "success" | "error" | "info";
  message: string;
};

type StatsMemory = {
  stats: AdminStats;
  fetchedAt: number;
};

let statsMemory: StatsMemory | null = null;

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500";

function formatSubmittedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRate(rate: number) {
  return Number.isInteger(rate) ? `${rate}%` : `${rate.toFixed(1)}%`;
}

function formatClock(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: string) {
  if (status === "approved") return "Approved";
  if (status === "denied") return "Denied";
  return "Pending";
}

function statusClass(status: string) {
  if (status === "approved") return "bg-green-50 text-green-800";
  if (status === "denied") return "bg-red-50 text-red-800";
  return "bg-amber-50 text-amber-800";
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

async function fetchAdminStats(force: boolean) {
  if (!force && statsMemory && Date.now() - statsMemory.fetchedAt < STATS_CACHE_MS) {
    return statsMemory.stats;
  }

  const response = await fetch(force ? "/api/admin/stats?refresh=1" : "/api/admin/stats", {
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Failed to load analytics.");
  }

  statsMemory = { stats: payload as AdminStats, fetchedAt: Date.now() };
  return statsMemory.stats;
}

export default function ProgramSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(statsMemory?.stats ?? null);
  const [statsLoading, setStatsLoading] = useState(!statsMemory);
  const [statsRefreshing, setStatsRefreshing] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [statsFetchedAt, setStatsFetchedAt] = useState<number | null>(statsMemory?.fetchedAt ?? null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [bulkBusy, setBulkBusy] = useState<"approve" | "deny" | null>(null);
  const [denyingId, setDenyingId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState("");
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmDeny, setConfirmDeny] = useState(false);
  const [bulkDenyReason, setBulkDenyReason] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const searchSync = useRef(searchInput);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((next: Toast) => {
    setToast(next);
  }, []);

  const loadStats = useCallback(async (force = false) => {
    const cached = statsMemory;
    const fresh = Boolean(cached && Date.now() - cached.fetchedAt < STATS_CACHE_MS);
    if (!force && fresh && cached) {
      setStats(cached.stats);
      setStatsFetchedAt(cached.fetchedAt);
      setStatsLoading(false);
      return;
    }

    if (force) setStatsRefreshing(true);
    else if (!cached) setStatsLoading(true);

    try {
      const next = await fetchAdminStats(force);
      setStats(next);
      setStatsFetchedAt(statsMemory?.fetchedAt ?? Date.now());
      setStatsError("");
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : "Failed to load analytics.");
    } finally {
      setStatsLoading(false);
      setStatsRefreshing(false);
    }
  }, []);

  const fetchSubmissions = useCallback(
    async (signal?: AbortSignal) => {
      if (fromDate && toDate && fromDate > toDate) {
        setListError("The start date must be on or before the end date.");
        setSubmissions([]);
        setTotal(0);
        setListLoading(false);
        return;
      }

      setListLoading(true);
      setListError("");

      const params = new URLSearchParams();
      if (stateFilter) params.set("state", stateFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));

      try {
        const response = await fetch(`/api/admin/submissions?${params.toString()}`, {
          signal,
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load submissions.");
        }

        const items = Array.isArray(payload.submissions) ? (payload.submissions as Submission[]) : [];
        const nextTotal = typeof payload.total === "number" ? payload.total : items.length;
        if (signal?.aborted) return;

        if (items.length === 0 && nextTotal > 0 && page > 1) {
          const lastPage = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
          if (lastPage !== page) {
            setPage(lastPage);
            return;
          }
        }

        setSubmissions(items);
        setTotal(nextTotal);
      } catch (error) {
        if (signal?.aborted) return;
        setListError(error instanceof Error ? error.message : "Failed to load submissions.");
      } finally {
        if (!signal?.aborted) setListLoading(false);
      }
    },
    [categoryFilter, fromDate, page, searchQuery, stateFilter, toDate],
  );

  useEffect(() => {
    void loadStats(false);
  }, [loadStats]);

  useEffect(() => {
    if (searchSync.current === searchInput) return undefined;
    const timer = window.setTimeout(() => {
      searchSync.current = searchInput;
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchSubmissions(controller.signal);
    return () => controller.abort();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), toast.tone === "error" ? 8000 : 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!confirmApprove && !confirmDeny) return undefined;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !bulkBusy) {
        setConfirmApprove(false);
        setConfirmDeny(false);
        setBulkError("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bulkBusy, confirmApprove, confirmDeny]);

  const pageIds = submissions.map((submission) => submission.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));
  const selectedCount = selected.size;
  const actionsLocked = busy !== null || bulkBusy !== null;
  const filtersActive = Boolean(searchInput || stateFilter || categoryFilter || fromDate || toDate);
  const appliedFilters = Boolean(searchQuery || stateFilter || categoryFilter || fromDate || toDate);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = total === 0 ? 0 : rangeStart + submissions.length - 1;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = somePageSelected && !allPageSelected;
    }
  }, [allPageSelected, somePageSelected]);

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePageSelection() {
    setSelected((current) => {
      const next = new Set(current);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function clearFilters() {
    searchSync.current = "";
    setSearchInput("");
    setSearchQuery("");
    setStateFilter("");
    setCategoryFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  }

  function applyStateFilter(value: string) {
    setStateFilter(value);
    setPage(1);
  }

  function applyCategoryFilter(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  function toggleStateFromChart(value: string) {
    setStateFilter((current) => (current === value ? "" : value));
    setPage(1);
  }

  function toggleCategoryFromChart(value: string) {
    setCategoryFilter((current) => (current === value ? "" : value));
    setPage(1);
  }

  function forgetIds(ids: string[]) {
    setSelected((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  async function refreshAfterChange(ids: string[], message: string) {
    forgetIds(ids);
    showToast({ tone: "success", message });
    void loadStats(true);

    const remaining = submissions.filter((submission) => !ids.includes(submission.id)).length;
    if (remaining === 0 && page > 1) {
      setPage((current) => Math.max(1, current - 1));
      return;
    }

    await fetchSubmissions();
  }

  async function handleApprove(id: string) {
    setBusy({ id, action: "approve" });
    try {
      const response = await fetch(`/api/admin/submissions/${id}/approve`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to approve submission.");
      }
      await refreshAfterChange([id], data.message || "Submission approved.");
    } catch (error) {
      showToast({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to approve submission.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleDeny(id: string) {
    setBusy({ id, action: "deny" });
    try {
      const response = await fetch(`/api/admin/submissions/${id}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: denyReason.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to deny submission.");
      }
      setDenyingId(null);
      setDenyReason("");
      await refreshAfterChange([id], data.message || "Submission denied.");
    } catch (error) {
      showToast({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to deny submission.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleBulkApprove() {
    const submissionIds = Array.from(selected);
    setBulkBusy("approve");
    setBulkError("");
    try {
      const response = await fetch("/api/admin/submissions/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionIds }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to approve selected submissions.");
      }
      const failedCount = Array.isArray(data.failed) ? data.failed.length : 0;
      const approvedCount = typeof data.count === "number" ? data.count : submissionIds.length;
      const message = failedCount
        ? `Approved ${approvedCount} of ${approvedCount + failedCount} submissions.`
        : `Approved ${plural(approvedCount, "submission")}.`;
      setConfirmApprove(false);
      await refreshAfterChange(submissionIds.filter((id) => !data.failed?.includes(id)), message);
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : "Failed to approve selected submissions.");
    } finally {
      setBulkBusy(null);
    }
  }

  async function handleBulkDeny() {
    const reason = bulkDenyReason.trim();
    if (!reason) {
      setBulkError("Enter a reason for denying these submissions.");
      return;
    }

    const submissionIds = Array.from(selected);
    setBulkBusy("deny");
    setBulkError("");
    try {
      const response = await fetch("/api/admin/submissions/bulk-deny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionIds, reason }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to deny selected submissions.");
      }
      const failedCount = Array.isArray(data.failed) ? data.failed.length : 0;
      const deniedCount = typeof data.count === "number" ? data.count : submissionIds.length;
      const message = failedCount
        ? `Denied ${deniedCount} of ${deniedCount + failedCount} submissions.`
        : `Denied ${plural(deniedCount, "submission")}.`;
      setConfirmDeny(false);
      setBulkDenyReason("");
      await refreshAfterChange(submissionIds.filter((id) => !data.failed?.includes(id)), message);
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : "Failed to deny selected submissions.");
    } finally {
      setBulkBusy(null);
    }
  }

  const knownStateSelected = US_STATES.some((state) => state.abbreviation === stateFilter);
  const knownCategorySelected = PROGRAM_SUBMISSION_CATEGORIES.some((category) => category === categoryFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Program Submissions</h1>
              <p className="mt-1 text-gray-600">
                Review new program submissions and approve or deny each one.
              </p>
            </div>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/admin/dashboard" className="text-blue-600 transition hover:text-blue-900">
                Dashboard
              </Link>
              <Link href="/admin/programs" className="text-blue-600 transition hover:text-blue-900">
                Programs
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8" aria-busy={statsLoading}>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
              <p className="text-sm text-gray-500">
                {statsFetchedAt
                  ? `Updated ${formatClock(statsFetchedAt)} · refreshes every 5 minutes`
                  : "Submission and directory totals"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadStats(true)}
              disabled={statsRefreshing || statsLoading}
              className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statsRefreshing ? "Refreshing..." : "Refresh stats"}
            </button>
          </div>

          {statsError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {statsError}{" "}
              <button type="button" onClick={() => void loadStats(true)} className="font-medium underline">
                Try again
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Pending submissions"
              value={stats ? String(stats.pendingCount) : "—"}
              detail="Awaiting review"
              valueClass="text-blue-600"
            />
            <StatCard
              label="Approved programs"
              value={stats ? String(stats.approvedCount) : "—"}
              detail="Published in the directory"
              valueClass="text-navy"
            />
            <StatCard
              label="Submissions this month"
              value={stats ? String(stats.thisMonthCount) : "—"}
              detail="Since the 1st, Eastern time"
              valueClass="text-blue-800"
            />
            <StatCard
              label="Approval rate"
              value={stats ? formatRate(stats.approvalRate) : "—"}
              detail="Approved submissions out of all submissions"
              valueClass="text-navy"
            />
          </div>

          <div className="mt-6">
            {statsLoading && !stats ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="h-80 animate-pulse rounded-lg bg-white shadow" />
                <div className="h-80 animate-pulse rounded-lg bg-white shadow" />
              </div>
            ) : stats ? (
              <SubmissionCharts
                byState={stats.byState}
                byCategory={stats.byCategory}
                activeState={stateFilter}
                activeCategory={categoryFilter}
                onStateClick={toggleStateFromChart}
                onCategoryClick={toggleCategoryFromChart}
              />
            ) : null}
          </div>
        </section>

        <section className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">Search and filter</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
            <label className="block text-sm font-medium text-gray-700 md:col-span-2">
              Search
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Program name, city, or email"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              State
              <select
                value={stateFilter}
                onChange={(event) => applyStateFilter(event.target.value)}
                className={inputClass}
              >
                <option value="">All states</option>
                {stateFilter && !knownStateSelected && (
                  <option value={stateFilter}>{stateDisplayName(stateFilter)}</option>
                )}
                {US_STATES.map((state) => (
                  <option key={state.abbreviation} value={state.abbreviation}>
                    {state.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Category
              <select
                value={categoryFilter}
                onChange={(event) => applyCategoryFilter(event.target.value)}
                className={inputClass}
              >
                <option value="">All categories</option>
                {categoryFilter && !knownCategorySelected && (
                  <option value={categoryFilter}>{categoryFilter}</option>
                )}
                {PROGRAM_SUBMISSION_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              From
              <input
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              To
              <input
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
                className={inputClass}
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!filtersActive}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear filters
            </button>
          </div>
        </section>

        {listError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-center">
            <p className="font-medium text-red-700">{listError}</p>
            <button
              type="button"
              onClick={() => void fetchSubmissions()}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {(submissions.length > 0 || selectedCount > 0) && (
          <div className="sticky top-0 z-20 mb-4 rounded-lg border border-gray-200 bg-white/95 p-4 shadow backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={togglePageSelection}
                  disabled={actionsLocked || submissions.length === 0}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Select all
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {selectedCount > 0 && (
                  <>
                    <span className="text-sm font-medium text-gray-700">{selectedCount} selected</span>
                    <button
                      type="button"
                      onClick={() => setSelected(new Set())}
                      disabled={actionsLocked}
                      className="text-sm font-medium text-blue-700 hover:text-blue-900 disabled:opacity-60"
                    >
                      Clear selection
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkError("");
                        setConfirmApprove(true);
                      }}
                      disabled={actionsLocked}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve selected
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkError("");
                        setBulkDenyReason("");
                        setConfirmDeny(true);
                      }}
                      disabled={actionsLocked}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Deny selected
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {listLoading && submissions.length === 0 && !listError && (
          <LoadingSpinner label="Loading submissions..." />
        )}

        {!listLoading && !listError && submissions.length === 0 && (
          <div className="rounded-lg bg-white px-6 py-16 text-center shadow">
            <p className="text-lg font-semibold text-gray-900">
              {appliedFilters ? "No submissions match filters" : "No pending submissions"}
            </p>
            <p className="mt-2 text-gray-600">
              {appliedFilters
                ? "Try a different search, state, category, or date range."
                : "New program submissions will appear here when they are ready for review."}
            </p>
          </div>
        )}

        {submissions.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Showing {rangeStart}–{rangeEnd} of {total}
              </p>
              {listLoading && <p className="text-sm text-blue-700">Updating results...</p>}
            </div>
            <div className={`grid grid-cols-1 gap-6 lg:grid-cols-2 ${listLoading ? "opacity-70" : ""}`}>
              {submissions.map((submission) => {
                const isBusy = busy?.id === submission.id;
                const isDenying = denyingId === submission.id;
                const submittedBy = submission.submitted_by || submission.contact_email;

                return (
                  <article
                    key={submission.id}
                    className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected.has(submission.id)}
                        onChange={() => toggleSelected(submission.id)}
                        disabled={actionsLocked}
                        aria-label={`Select ${submission.name}`}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900">{submission.name}</h2>
                            <span className="rounded bg-navy px-1.5 py-0.5 text-xs font-semibold tracking-wide text-white">
                              {stateAbbreviation(submission.state)}
                            </span>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(submission.status)}`}
                          >
                            {statusLabel(submission.status)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-600">
                          {submission.city}, {stateDisplayName(submission.state)}
                          <span className="mx-2 text-gray-300">·</span>
                          <time dateTime={submission.created_at}>{formatSubmittedDate(submission.created_at)}</time>
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {submission.category}
                          </span>
                        </div>

                        <dl className="mt-4 space-y-2 text-sm">
                          <div>
                            <dt className="font-medium text-gray-500">Submitted by</dt>
                            <dd>
                              <a href={`mailto:${submittedBy}`} className="break-all text-blue-600 hover:text-blue-900">
                                {submittedBy}
                              </a>
                            </dd>
                          </div>
                          {submission.contact_email && submission.contact_email !== submittedBy && (
                            <div>
                              <dt className="font-medium text-gray-500">Contact email</dt>
                              <dd>
                                <a
                                  href={`mailto:${submission.contact_email}`}
                                  className="break-all text-blue-600 hover:text-blue-900"
                                >
                                  {submission.contact_email}
                                </a>
                              </dd>
                            </div>
                          )}
                          {submission.phone && (
                            <div>
                              <dt className="font-medium text-gray-500">Phone</dt>
                              <dd>
                                <a href={`tel:${submission.phone}`} className="text-blue-600 hover:text-blue-900">
                                  {submission.phone}
                                </a>
                              </dd>
                            </div>
                          )}
                          {submission.website && (
                            <div>
                              <dt className="font-medium text-gray-500">Website</dt>
                              <dd>
                                <a
                                  href={submission.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="break-all text-blue-600 hover:text-blue-900"
                                >
                                  {submission.website}
                                </a>
                              </dd>
                            </div>
                          )}
                        </dl>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                          {submission.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-4">
                      {isDenying ? (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Denial reason
                            <span className="ml-1 font-normal text-gray-500">(optional)</span>
                            <textarea
                              value={denyReason}
                              onChange={(event) => setDenyReason(event.target.value)}
                              disabled={actionsLocked}
                              rows={3}
                              placeholder="Tell the submitter why this was denied"
                              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
                            />
                          </label>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => void handleDeny(submission.id)}
                              disabled={actionsLocked}
                              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isBusy && busy.action === "deny" ? "Denying..." : "Confirm deny"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDenyingId(null);
                                setDenyReason("");
                              }}
                              disabled={actionsLocked}
                              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => void handleApprove(submission.id)}
                            disabled={actionsLocked}
                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy && busy.action === "approve" ? "Approving..." : "✓ Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDenyingId(submission.id);
                              setDenyReason("");
                            }}
                            disabled={actionsLocked}
                            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            ✗ Deny
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              showToast({
                                tone: "info",
                                message: "Editing submissions is coming soon.",
                              })
                            }
                            disabled={actionsLocked}
                            className="flex-1 rounded-lg border border-blue-200 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {pageCount > 1 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-gray-600">
                  Page {page} of {pageCount}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1 || listLoading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                    disabled={page >= pageCount || listLoading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border px-4 py-3 shadow-lg ${
            toast.tone === "error"
              ? "border-red-200 bg-white text-red-800"
              : toast.tone === "info"
                ? "border-blue-200 bg-white text-blue-900"
                : "border-green-200 bg-white text-green-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-sm text-gray-500 hover:text-gray-800"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {confirmApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" role="dialog" aria-modal="true">
            <h3 className="text-lg font-bold text-gray-900">Approve selected submissions?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This will publish {plural(selectedCount, "program")} and email each contact.
            </p>
            {bulkError && <p className="mt-3 text-sm text-red-700">{bulkError}</p>}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmApprove(false);
                  setBulkError("");
                }}
                disabled={bulkBusy === "approve"}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleBulkApprove()}
                disabled={bulkBusy === "approve"}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkBusy === "approve" ? "Approving..." : "Approve selected"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeny && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" role="dialog" aria-modal="true">
            <h3 className="text-lg font-bold text-gray-900">Deny selected submissions?</h3>
            <p className="mt-2 text-sm text-gray-600">
              The same reason is sent for all {plural(selectedCount, "submission")}.
            </p>
            <label className="mt-4 block text-sm font-medium text-gray-700">
              Denial reason
              <textarea
                value={bulkDenyReason}
                onChange={(event) => setBulkDenyReason(event.target.value)}
                disabled={bulkBusy === "deny"}
                rows={4}
                autoFocus
                placeholder="Tell these submitters why the programs were denied"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
              />
            </label>
            {bulkError && <p className="mt-3 text-sm text-red-700">{bulkError}</p>}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmDeny(false);
                  setBulkError("");
                }}
                disabled={bulkBusy === "deny"}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleBulkDeny()}
                disabled={bulkBusy === "deny"}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkBusy === "deny" ? "Denying..." : "Deny selected"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  valueClass,
}: {
  label: string;
  value: string;
  detail: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`mt-2 text-4xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-2 text-xs text-gray-500">{detail}</p>
    </div>
  );
}
