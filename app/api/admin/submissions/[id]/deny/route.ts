import { NextRequest, NextResponse } from "next/server";
import { denyProgramSubmission } from "@/lib/program-submission-actions";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    let reason: string | null = null;
    try {
      const body = await request.json();
      if (body && typeof body.reason === "string" && body.reason.trim()) {
        reason = body.reason.trim();
      }
    } catch {
      // An empty body is valid; the denial reason is optional.
    }

    const result = await denyProgramSubmission(params.id, reason);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error denying submission:", error);
    return NextResponse.json({ error: "Failed to deny submission." }, { status: 500 });
  }
}
