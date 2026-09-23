import { NextRequest, NextResponse } from "next/server";
import { getPasswordFromRequest, isValidAdminPassword, unauthorized } from "@/lib/admin";
import { fetchPendingSubmissions } from "@/lib/programs";
import { getServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  if (!isValidAdminPassword(getPasswordFromRequest(request))) {
    return unauthorized();
  }

  const { submissions, error } = await fetchPendingSubmissions(
    getServerSupabase(),
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions });
}
