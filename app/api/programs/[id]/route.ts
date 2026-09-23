import { NextRequest, NextResponse } from "next/server";
import { fetchProgramById } from "@/lib/programs";
import { getServerSupabase } from "@/lib/supabase-server";

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { program, error } = await fetchProgramById(
    getServerSupabase(),
    params.id,
  );

  if (error) {
    const notFoundError =
      error.code === "22P02" ||
      error.code === "PGRST116" ||
      error.message.toLowerCase().includes("invalid input");

    return NextResponse.json(
      { error: notFoundError ? "Program not found." : error.message },
      { status: notFoundError ? 404 : 500 },
    );
  }

  if (!program) {
    return NextResponse.json({ error: "Program not found." }, { status: 404 });
  }

  return NextResponse.json({ program });
}
