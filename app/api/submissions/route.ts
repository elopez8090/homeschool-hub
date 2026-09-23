import { NextRequest, NextResponse } from "next/server";
import { emailAdminNewSubmission } from "@/lib/email";
import { getServerSupabase } from "@/lib/supabase-server";
import { validateSubmission } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { errors, data } = validateSubmission(body as Record<string, unknown>);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const client = getServerSupabase();
  const fullRow = {
    name: data.name,
    city: data.city,
    state: data.state,
    category: data.category,
    description: data.description,
    contact_email: data.contact_email,
    website: data.website,
    accepts_esa: data.accepts_esa,
    status: "pending",
  };

  let { data: submission, error } = await client
    .from("pending_submissions")
    .insert(fullRow)
    .select("*")
    .single();

  if (error?.message?.includes("schema cache") || error?.code === "PGRST204") {
    const fallback = await client
      .from("pending_submissions")
      .insert({
        name: data.name,
        city: data.city,
        state: data.state,
        category: data.category,
        contact_email: data.contact_email,
        status: "pending",
      })
      .select("*")
      .single();
    submission = fallback.data;
    error = fallback.error;
  }

  if (error) {
    const rlsBlocked = error.message.includes("row-level security");
    return NextResponse.json(
      {
        error: rlsBlocked
          ? "Submissions are blocked by Supabase row-level security. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and run supabase/phase2.sql."
          : error.message,
      },
      { status: 500 },
    );
  }

  await emailAdminNewSubmission(data);

  return NextResponse.json({ submission }, { status: 201 });
}
