import { NextRequest, NextResponse } from "next/server";
import { endOfAdminDay, startOfAdminDay } from "@/lib/admin-dates";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 20;

function sanitizeSearch(value: string) {
  return value
    .replace(/[%_\\,()."']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function readFilter(value: string | null, maxLength: number) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength || /[,()]/.test(trimmed)) return "";
  return trimmed;
}

function readDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return value;
}

function readPage(value: string | null) {
  const page = Number(value);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function readPageSize(value: string | null) {
  if (!value) return DEFAULT_PAGE_SIZE;
  const size = Number(value);
  if (!Number.isFinite(size) || size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.floor(size));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const state = readFilter(searchParams.get("state"), 40);
    const category = readFilter(searchParams.get("category"), 80);
    const search = sanitizeSearch(searchParams.get("search") || "");
    const from = readDate(searchParams.get("from"));
    const to = readDate(searchParams.get("to"));
    const page = readPage(searchParams.get("page"));
    const pageSize = readPageSize(searchParams.get("limit"));

    const result = await querySubmissions({
      state,
      category,
      search,
      from,
      to,
      page,
      pageSize,
      includeSubmittedBy: true,
    });

    if (result.error && /submitted_by/i.test(result.error)) {
      const retry = await querySubmissions({
        state,
        category,
        search,
        from,
        to,
        page,
        pageSize,
        includeSubmittedBy: false,
      });
      if (retry.error) {
        console.error("Error fetching submissions:", retry.error);
        return NextResponse.json({ error: "Failed to fetch submissions." }, { status: 500 });
      }
      return NextResponse.json(retry.body);
    }

    if (result.error) {
      console.error("Error fetching submissions:", result.error);
      return NextResponse.json({ error: "Failed to fetch submissions." }, { status: 500 });
    }

    return NextResponse.json(result.body);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions." }, { status: 500 });
  }
}

async function querySubmissions({
  state,
  category,
  search,
  from,
  to,
  page,
  pageSize,
  includeSubmittedBy,
}: {
  state: string;
  category: string;
  search: string;
  from: string;
  to: string;
  page: number;
  pageSize: number;
  includeSubmittedBy: boolean;
}) {
  const supabase = getServerSupabase();
  let query = supabase
    .from("program_submissions")
    .select("*", { count: "exact" })
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (state) query = query.eq("state", state);
  if (category) query = query.eq("category", category);
  if (from) query = query.gte("created_at", startOfAdminDay(from));
  if (to) query = query.lte("created_at", endOfAdminDay(to));

  if (search) {
    const pattern = `"%${search}%"`;
    const clauses = [
      `name.ilike.${pattern}`,
      `city.ilike.${pattern}`,
      `contact_email.ilike.${pattern}`,
    ];
    if (includeSubmittedBy) clauses.push(`submitted_by.ilike.${pattern}`);
    query = query.or(clauses.join(","));
  }

  const fromIndex = (page - 1) * pageSize;
  const { data, error, count } = await query.range(fromIndex, fromIndex + pageSize - 1);

  if (error) {
    return { error: error.message, body: null };
  }

  const total = count ?? 0;
  return {
    error: null,
    body: {
      submissions: data ?? [],
      total,
      page,
      pageSize,
    },
  };
}
