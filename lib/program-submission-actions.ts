import { programListingUrl } from "@/lib/emails/brand";
import { sendApprovalNotification, sendDenialNotification } from "@/lib/email-service";
import { invalidateAdminStatsCache } from "@/lib/admin-stats";
import { getServerSupabase } from "@/lib/supabase-server";

export type SubmissionActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; status: number };

export async function approveProgramSubmission(id: string): Promise<SubmissionActionResult> {
  if (!id) {
    return { ok: false, error: "Submission id is required.", status: 400 };
  }

  const supabase = getServerSupabase();
  const { data: submission, error: fetchError } = await supabase
    .from("program_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching submission:", fetchError);
    return { ok: false, error: "Failed to load submission.", status: 500 };
  }

  if (!submission) {
    return { ok: false, error: "Submission not found.", status: 404 };
  }

  if (submission.status && submission.status !== "pending") {
    return { ok: false, error: "Submission is no longer pending.", status: 409 };
  }

  const { data: program, error: insertError } = await supabase
    .from("programs")
    .insert({
      name: submission.name,
      description: submission.description ?? "",
      city: submission.city,
      state: submission.state,
      category: submission.category,
      contact_email: submission.contact_email,
      phone: submission.phone || null,
      website: submission.website || null,
      featured: false,
    })
    .select("id, state")
    .single();

  if (insertError) {
    console.error("Error publishing program:", insertError);
    return {
      ok: false,
      error: `Failed to publish program: ${insertError.message}`,
      status: 500,
    };
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
    return {
      ok: false,
      error: "Program was created, but the submission status could not be updated.",
      status: 500,
    };
  }

  if (submission.contact_email) {
    const programUrl = program?.id
      ? programListingUrl(program.state || submission.state, program.id)
      : undefined;
    const emailResult = await sendApprovalNotification(
      submission.contact_email,
      submission.name,
      programUrl,
    );
    if (!emailResult.sent) {
      console.warn("[email] Approval notification was not sent", emailResult);
    }
  }

  invalidateAdminStatsCache();
  return { ok: true, message: "Submission approved and program published." };
}

export async function denyProgramSubmission(
  id: string,
  reason: string | null,
): Promise<SubmissionActionResult> {
  if (!id) {
    return { ok: false, error: "Submission id is required.", status: 400 };
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("program_submissions")
    .update({
      status: "denied",
      denied_at: new Date().toISOString(),
      denial_reason: reason,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("id, name, contact_email")
    .maybeSingle();

  if (error) {
    console.error("Error denying submission:", error);
    return { ok: false, error: `Failed to deny submission: ${error.message}`, status: 500 };
  }

  if (!data) {
    return { ok: false, error: "Submission not found.", status: 404 };
  }

  if (data.contact_email && data.name) {
    const emailResult = await sendDenialNotification(data.contact_email, data.name, reason);
    if (!emailResult.sent) {
      console.warn("[email] Denial notification was not sent", emailResult);
    }
  }

  invalidateAdminStatsCache();
  return { ok: true, message: "Submission denied." };
}
