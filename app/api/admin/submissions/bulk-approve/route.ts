import { NextRequest, NextResponse } from "next/server";
import { approveProgramSubmission } from "@/lib/program-submission-actions";

export const dynamic = "force-dynamic";

const MAX_BATCH = 50;

function readIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && id.trim().length > 0);
}

export async function POST(request: NextRequest) {
  try {
    let body: { submissionIds?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const submissionIds = Array.from(new Set(readIds(body.submissionIds).map((id) => id.trim())));
    if (submissionIds.length === 0) {
      return NextResponse.json({ error: "submissionIds is required." }, { status: 400 });
    }
    if (submissionIds.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Select ${MAX_BATCH} or fewer submissions at a time.` },
        { status: 400 },
      );
    }

    let count = 0;
    const failed: string[] = [];
    let firstError = "Failed to approve the selected submissions.";

    for (const id of submissionIds) {
      const result = await approveProgramSubmission(id);
      if (result.ok) {
        count += 1;
      } else {
        failed.push(id);
        firstError = result.error;
      }
    }

    if (count === 0) {
      return NextResponse.json({ success: false, count: 0, error: firstError }, { status: 500 });
    }

    return NextResponse.json({ success: true, count, failed });
  } catch (error) {
    console.error("Error bulk approving submissions:", error);
    return NextResponse.json({ error: "Failed to approve submissions." }, { status: 500 });
  }
}
