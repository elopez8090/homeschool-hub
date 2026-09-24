import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/admin";
import { rejectSubmission } from "@/lib/review";

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return unauthorized();
  }

  let body: { submission_id?: string; id?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const submissionId = body.submission_id || body.id;
  if (!submissionId) {
    return NextResponse.json({ error: "submission_id is required." }, { status: 400 });
  }

  const result = await rejectSubmission(submissionId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    message: "Submission rejected and removed.",
  });
}
