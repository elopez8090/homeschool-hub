// TODO: add auth check — these routes currently assume admin access.
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Submission id is required." },
        { status: 400 },
      );
    }

    let reason: string | null = null;
    try {
      const body = await request.json();
      if (body && typeof body.reason === "string" && body.reason.trim()) {
        reason = body.reason.trim();
      }
    } catch {
      // An empty body is valid; the denial reason is optional.
    }

    const { data, error } = await supabase
      .from("program_submissions")
      .update({
        status: "denied",
        denied_at: new Date().toISOString(),
        denial_reason: reason,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Error denying submission:", error);
      return NextResponse.json(
        { error: `Failed to deny submission: ${error.message}` },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Submission not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission denied.",
    });
  } catch (error) {
    console.error("Error denying submission:", error);
    return NextResponse.json(
      { error: "Failed to deny submission." },
      { status: 500 },
    );
  }
}
