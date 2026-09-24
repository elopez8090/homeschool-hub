import { emailOwnerApproved, emailOwnerRejected } from "@/lib/email";
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

  const listingUrl = `${origin}/${submission.state}`;
  await emailOwnerApproved({
    name: submission.name,
    contact_email: submission.contact_email,
    listingUrl,
  });

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

  await emailOwnerRejected({
    name: submission.name,
    contact_email: submission.contact_email,
  });

  return { ok: true as const };
}
