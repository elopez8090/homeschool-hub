import { programListingUrl } from "@/lib/emails/brand";
import { sendApprovalNotification, sendDenialNotification } from "@/lib/email-service";
import { getServerSupabase } from "@/lib/supabase-server";

export async function approveSubmission(submissionId: string, origin: string) {
  const client = getServerSupabase();
  const { data: submission, error: fetchError } = await client
    .from("pending_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message, status: 500 as const };
  }

  if (!submission) {
    return { error: "Submission not found.", status: 404 as const };
  }

  const createdAt = new Date().toISOString();
  const { data: program, error: insertError } = await client
    .from("programs")
    .insert({
      name: submission.name,
      city: submission.city,
      state: submission.state,
      category: submission.category,
      description: submission.description || "",
      contact_email: submission.contact_email,
      website: submission.website || null,
      featured: false,
      esa_verified: false,
      created_at: createdAt,
    })
    .select("*")
    .single();

  if (insertError) {
    return { error: insertError.message, status: 500 as const };
  }

  const { error: deleteError } = await client
    .from("pending_submissions")
    .delete()
    .eq("id", submissionId);

  if (deleteError) {
    return { error: deleteError.message, status: 500 as const };
  }

  const listingUrl = program?.id
    ? programListingUrl(String(submission.state), program.id)
    : `${origin}/${submission.state}`;
  if (submission.contact_email) {
    const emailResult = await sendApprovalNotification(
      submission.contact_email,
      submission.name,
      listingUrl,
    );
    if (!emailResult.sent) {
      console.warn("[email] Approval notification was not sent", emailResult);
    }
  }

  return { program, listingUrl };
}

export async function rejectSubmission(submissionId: string) {
  const client = getServerSupabase();
  const { data: submission, error: fetchError } = await client
    .from("pending_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message, status: 500 as const };
  }

  if (!submission) {
    return { error: "Submission not found.", status: 404 as const };
  }

  const { error: deleteError } = await client
    .from("pending_submissions")
    .delete()
    .eq("id", submissionId);

  if (deleteError) {
    return { error: deleteError.message, status: 500 as const };
  }

  if (submission.contact_email) {
    const emailResult = await sendDenialNotification(
      submission.contact_email,
      submission.name,
      null,
    );
    if (!emailResult.sent) {
      console.warn("[email] Denial notification was not sent", emailResult);
    }
  }

  return { ok: true as const };
}
