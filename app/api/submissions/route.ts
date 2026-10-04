import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification, sendSubmissionConfirmation } from "@/lib/email-service";
import { getServerSupabase } from "@/lib/supabase-server";
import { validateProgramSubmission } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body.", message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { errors, fieldErrors, data } = validateProgramSubmission(
    body && typeof body === "object" ? (body as Record<string, unknown>) : {},
  );

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: errors[0],
        message: errors[0],
        errors,
        fieldErrors,
      },
      { status: 400 },
    );
  }

  const client = getServerSupabase();
  const { data: submission, error } = await client
    .from("program_submissions")
    .insert({
      name: data.name,
      description: data.description,
      city: data.city,
      state: data.state,
      category: data.category,
      contact_email: data.contact_email,
      phone: data.phone,
      website: data.website,
      submitted_by: data.contact_email,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error saving program submission:", error);
    const rlsBlocked = error.message.includes("row-level security");
    const message = rlsBlocked
      ? "Submissions are blocked by Supabase row-level security. Add SUPABASE_SERVICE_ROLE_KEY to .env.local."
      : "Unable to save your submission. Please try again.";

    return NextResponse.json(
      { error: message, message },
      { status: 500 },
    );
  }

  const emailResults = await Promise.allSettled([
    sendSubmissionConfirmation(data.contact_email, data.name, data.category),
    sendAdminNotification({
      name: data.name,
      city: data.city,
      state: data.state,
      category: data.category,
      contactEmail: data.contact_email,
      phone: data.phone,
      website: data.website,
      description: data.description,
    }),
  ]);

  for (const result of emailResults) {
    if (result.status === "rejected") {
      console.error("[email] Submission email failed", result.reason);
    } else if (!result.value.sent) {
      console.warn("[email] Submission email was not sent", result.value);
    }
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Thank you for submitting your program! Our team will review it and get back to you within 3-5 business days.",
      submission,
    },
    { status: 201 },
  );
}
