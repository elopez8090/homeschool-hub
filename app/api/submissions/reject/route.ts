import { NextRequest, NextResponse } from "next/server";
import { getPasswordFromRequest, isValidAdminPassword, unauthorized } from "@/lib/admin";
import { emailOwnerRejected } from "@/lib/email";
import { getServerSupabase } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  if (!isValidAdminPassword(getPasswordFromRequest(request))) {
    return unauthorized();
  }

  let body: { id?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Submission id is required." }, { status: 400 });
  }

  const client = getServerSupabase();
  const { data: submission, error: fetchError } = await client
    .from("pending_submissions")
    .select("*")
    .eq("id", body.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const { error: deleteError } = await client
    .from("pending_submissions")
    .delete()
    .eq("id", body.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await emailOwnerRejected({
    name: submission.name,
    contact_email: submission.contact_email,
  });

  return NextResponse.json({ ok: true });
}
