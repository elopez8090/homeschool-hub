import { NextRequest, NextResponse } from "next/server";
import { approveProgramSubmission } from "@/lib/program-submission-actions";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const result = await approveProgramSubmission(params.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error approving submission:", error);
    return NextResponse.json({ error: "Failed to approve submission." }, { status: 500 });
  }
}
