// TODO: add auth check — these routes currently assume admin access.
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function POST(
  _request: NextRequest,
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

    const { data: submission, error: fetchError } = await supabase
      .from("program_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching submission:", fetchError);
      return NextResponse.json(
        { error: "Failed to load submission." },
        { status: 500 },
      );
    }

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found." },
        { status: 404 },
      );
    }

    const { error: insertError } = await supabase.from("programs").insert({
      name: submission.name,
      description: submission.description ?? "",
      city: submission.city,
      state: submission.state,
      category: submission.category,
      contact_email: submission.contact_email,
      phone: submission.phone || null,
      website: submission.website || null,
      featured: false,
    });

    if (insertError) {
      console.error("Error publishing program:", insertError);
      return NextResponse.json(
        { error: `Failed to publish program: ${insertError.message}` },
        { status: 500 },
      );
    }

    const { error: updateError } = await supabase
      .from("program_submissions")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error marking submission approved:", updateError);
      return NextResponse.json(
        {
          error:
            "Program was created, but the submission status could not be updated.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission approved and program published.",
    });
  } catch (error) {
    console.error("Error approving submission:", error);
    return NextResponse.json(
      { error: "Failed to approve submission." },
      { status: 500 },
    );
  }
}
