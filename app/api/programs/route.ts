import { NextRequest, NextResponse } from "next/server";
import { fetchProgramsByState } from "@/lib/programs";
import { getServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state");

  if (!state) {
    return NextResponse.json(
      { error: "Query parameter `state` is required." },
      { status: 400 },
    );
  }

  const { programs, error } = await fetchProgramsByState(
    getServerSupabase(),
    state,
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ programs });
}
